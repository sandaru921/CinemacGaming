"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Navbar from "../../components/Navbar";
import LocationSelector, { Location, Room } from "../../components/booking/LocationSelector";
import RoomSelector from "../../components/booking/RoomSelector";
import TimeSlotPicker from "../../components/booking/TimeSlotPicker";
import MediaSelector from "../../components/booking/MediaSelector";
import { useRouter, useSearchParams } from "next/navigation";
import { useLibrary, LibraryItem } from "../../contexts/LibraryContext";
import * as signalR from "@microsoft/signalr";

const API_BASE_URL   = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5211/api";
const DURATION_HOURS = 3;

function BookingForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { library }  = useLibrary();

  const [locations,        setLocations]        = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedRoom,     setSelectedRoom]      = useState<Room | null>(null);
  const [startTime,        setStartTime]         = useState<Date | null>(null);
  const [endTime,          setEndTime]           = useState<Date | null>(null);
  const [refreshKey,       setRefreshKey]        = useState(0);
  const [isSubmitting,     setIsSubmitting]      = useState(false);
  const [isSuccess,        setIsSuccess]         = useState(false);
  const [errorMsg,         setErrorMsg]          = useState<string | null>(null);
  const [selectedMedia,    setSelectedMedia]     = useState<LibraryItem | null>(null);

  // Auto-select media from library deeplink (?media=x&type=y)
  useEffect(() => {
    const mediaId   = searchParams?.get("media");
    const mediaType = searchParams?.get("type");
    if (mediaId && mediaType && library.length > 0 && !selectedMedia) {
      const match = library.find((i) => i.mediaId === mediaId && i.mediaType === mediaType);
      if (match) setSelectedMedia(match);
    }
  }, [searchParams, library, selectedMedia]);

  // Fetch locations on mount + restore any pending booking from sessionStorage
  useEffect(() => {
    fetch(`${API_BASE_URL}/bookings/locations`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Location[]) => {
        setLocations(data);
        const raw = sessionStorage.getItem("cinemac_pending_booking");
        if (!raw) return;
        sessionStorage.removeItem("cinemac_pending_booking");
        try {
          const p   = JSON.parse(raw);
          const loc = data.find((l) => l.id === p.locationId);
          if (!loc) return;
          setSelectedLocation(loc);
          const rm = loc.rooms.find((r) => r.id === p.roomId);
          if (!rm) return;
          setSelectedRoom(rm);
          setStartTime(new Date(p.startTime));
          setEndTime(new Date(p.endTime));
        } catch { /* ignore malformed data */ }
      })
      .catch(() => console.error("Failed to load locations"));
  }, []);

  // SignalR — refresh time slot availability when admin changes a booking
  useEffect(() => {
    const conn = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL.replace("/api", "")}/hubs/bookings`)
      .withAutomaticReconnect()
      .build();

    conn.start()
      .then(() => conn.on("ReceiveBookingUpdate", () => setRefreshKey((k) => k + 1)))
      .catch(() => {});

    return () => { conn.stop(); };
  }, []);

  const handleLocationSelect = (loc: Location) => {
    setSelectedLocation(loc);
    setSelectedRoom(null);
    setStartTime(null);
    setEndTime(null);
  };

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
    setStartTime(null);
    setEndTime(null);
  };

  const handleSlotSelect = useCallback((start: Date, end: Date) => {
    setStartTime(start);
    setEndTime(end);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("cinemac_token");
    if (!token) {
      if (selectedLocation && selectedRoom && startTime && endTime) {
        sessionStorage.setItem("cinemac_pending_booking", JSON.stringify({
          locationId: selectedLocation.id,
          roomId:     selectedRoom.id,
          startTime:  startTime.toISOString(),
          endTime:    endTime.toISOString(),
        }));
        sessionStorage.setItem("cinemac_redirect", "/bookings");
      }
      setErrorMsg("You need to login to make a booking. Redirecting…");
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    if (!selectedRoom || !startTime || !endTime) {
      setErrorMsg("Please complete all sections before booking.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const username = localStorage.getItem("cinemac_username") || "Guest";

    try {
      const res = await fetch(`${API_BASE_URL}/bookings`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          roomId:           selectedRoom.id,
          customerName:     username,
          customerEmail:    `${username.toLowerCase().replace(/\s+/g, "")}@cinemac.com`,
          startTime:        startTime.toISOString(),
          endTime:          endTime.toISOString(),
          playedMediaTitle: selectedMedia?.mediaTitle || "",
          playedMediaType:  selectedMedia?.mediaType  || "",
        }),
      });

      if (res.ok) {
        setIsSuccess(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const text = await res.text();
        setErrorMsg(`Booking failed: ${text}`);
      }
    } catch {
      setErrorMsg("A network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPrice = selectedRoom
    ? selectedRoom.pricingType === 1
      ? selectedRoom.price.toFixed(2)                              // flat rate
      : (selectedRoom.price * DURATION_HOURS).toFixed(2)          // per-hour × 3
    : "0.00";

  // ── Success screen ──────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(52,211,153,0.5)]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-12 h-12 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
          Booking Confirmed!
        </h1>
        <div className="text-gray-300 max-w-lg mb-8 bg-gray-900/50 p-6 rounded-2xl border border-gray-800 text-left space-y-3">
          <div className="flex justify-between text-sm"><span className="text-gray-400">Room</span>     <span className="font-bold text-white">{selectedRoom?.name}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-400">Location</span> <span className="font-bold text-white">{selectedLocation?.name}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-400">Date</span>     <span className="font-bold text-white">{startTime?.toDateString()}</span></div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Time</span>
            <span className="font-bold text-cinemac-blue">
              {startTime?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – {endTime?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <div className="flex justify-between text-sm"><span className="text-gray-400">Duration</span> <span className="font-bold text-white">3 Hours</span></div>
          <div className="flex justify-between text-sm border-t border-gray-800 pt-3">
            <span className="text-gray-400">Total Paid</span>
            <span className="font-black text-green-400">Rs. {totalPrice}</span>
          </div>
          {selectedMedia && (
            <div className="flex justify-between text-sm border-t border-gray-800 pt-3">
              <span className="text-gray-400">Media</span>
              <span className="font-bold text-purple-400 truncate max-w-[55%] text-right">{selectedMedia.mediaTitle}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg">
          <button onClick={() => window.location.reload()} className="flex-1 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">Another Booking</button>
          <button onClick={() => router.push("/profile")} className="flex-1 px-8 py-4 bg-gradient-to-r from-cinemac-blue to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20">View My Bookings</button>
          <button onClick={() => router.push("/")} className="flex-1 px-8 py-4 bg-gray-900 text-white border border-gray-700 font-bold rounded-xl hover:bg-gray-800 transition-colors">Go Home</button>
        </div>
      </div>
    );
  }

  // ── Booking form ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl w-full">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cinemac-blue via-purple-500 to-cinemac-purple">
            Book a Gaming Room
          </span>
        </h1>
        <p className="text-gray-400 text-lg">Reserve a private room for you and your friends.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">

        <LocationSelector
          locations={locations}
          selectedLocation={selectedLocation}
          onSelect={handleLocationSelect}
        />

        {selectedLocation && (
          <RoomSelector
            rooms={selectedLocation.rooms}
            selectedRoom={selectedRoom}
            onSelect={handleRoomSelect}
          />
        )}

        {selectedRoom && (
          <TimeSlotPicker
            key={refreshKey}
            roomId={selectedRoom.id}
            onSlotSelected={handleSlotSelect}
          />
        )}

        {selectedRoom && startTime && (
          <MediaSelector
            selectedMedia={selectedMedia}
            onSelect={(m) => setSelectedMedia(m.mediaId === selectedMedia?.mediaId ? null : m)}
          />
        )}

        {selectedRoom && startTime && endTime && (
          <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl font-bold mb-6">Booking Summary</h3>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/60 text-red-400 p-4 rounded-xl mb-6 text-sm">
                {errorMsg}
              </div>
            )}

            <div className="bg-black/50 p-6 rounded-2xl border border-gray-800 space-y-2.5 mb-8">
              <div className="flex justify-between text-sm"><span className="text-gray-400">Location</span> <span className="font-bold">{selectedLocation?.name}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Room</span>     <span className="font-bold">{selectedRoom.name}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Date</span>     <span className="font-bold">{startTime.toDateString()}</span></div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Time</span>
                <span className="font-bold text-cinemac-blue">
                  {startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – {endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Duration</span> <span className="font-bold">3 Hours</span></div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Pricing</span>
                <span className="font-bold text-gray-300">
                  {selectedRoom.pricingType === 1
                    ? `Rs. ${selectedRoom.price} (flat rate)`
                    : `Rs. ${selectedRoom.price} × 3h`}
                </span>
              </div>
              {selectedMedia && (
                <div className="flex justify-between text-sm border-t border-gray-800 pt-3">
                  <span className="text-gray-400">Media</span>
                  <span className="font-bold text-purple-400 truncate max-w-[50%] text-right">{selectedMedia.mediaTitle}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-800 pt-4 items-center">
                <span className="text-gray-400 text-sm">Total Price</span>
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                  Rs. {totalPrice}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-[0_0_30px_rgba(168,85,247,0.35)] transition-all
                ${isSubmitting
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-cinemac-purple to-purple-600 hover:scale-[1.02] text-white"}`}
            >
              {isSubmitting ? "Processing…" : "Confirm & Book Now"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default function BookingsPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden flex flex-col pb-20">
      <Navbar />
      <main className="flex-1 flex flex-col items-center pt-10 px-4 sm:px-6 md:px-10">
        <Suspense fallback={<div className="text-center p-20 text-cinemac-blue font-bold">Loading…</div>}>
          <BookingForm />
        </Suspense>
      </main>
    </div>
  );
}