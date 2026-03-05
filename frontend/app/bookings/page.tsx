"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Navbar from "../../components/Navbar";
import LocationSelector, { Location, Room } from "../../components/booking/LocationSelector";
import RoomSelector from "../../components/booking/RoomSelector";
import TimeSlotPicker from "../../components/booking/TimeSlotPicker";
import MediaSelector from "../../components/booking/MediaSelector";
import { useRouter, useSearchParams } from "next/navigation";
import { useLibrary, LibraryItem } from "../../contexts/LibraryContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5211/api";

function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { library } = useLibrary();
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  
  // Time/Duration State
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [durationHours, setDurationHours] = useState<number>(0);

  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Media Selection State
  const [selectedMedia, setSelectedMedia] = useState<LibraryItem | null>(null);

  // Auto-select media if coming from My Library (?media=xxx&type=yyy)
  useEffect(() => {
    const mediaId = searchParams?.get("media");
    const mediaType = searchParams?.get("type");
    if (mediaId && mediaType && library.length > 0 && !selectedMedia) {
      const match = library.find(i => i.mediaId === mediaId && i.mediaType === mediaType);
      if (match) {
        setSelectedMedia(match);
      }
    }
  }, [searchParams, library]);

  // 1. Fetch Locations & Rooms on Mount
  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await fetch(`${API_BASE_URL}/bookings/locations`);
        if (res.ok) {
          const data = await res.json();
          setLocations(data);
          
          // Restore pending booking if exists
          const pendingRaw = sessionStorage.getItem("cinemac_pending_booking");
          if (pendingRaw) {
            try {
              const pending = JSON.parse(pendingRaw);
              const loc = data.find((l: any) => l.id === pending.locationId);
              if (loc) {
                setSelectedLocation(loc);
                const rm = loc.rooms.find((r: any) => r.id === pending.roomId);
                if (rm) {
                  setSelectedRoom(rm);
                  setStartTime(new Date(pending.startTime));
                  setEndTime(new Date(pending.endTime));
                  setDurationHours(pending.durationHours);
                }
              }
            } catch (e) {}
            sessionStorage.removeItem("cinemac_pending_booking");
          }
        }
      } catch (err) {
        console.error("Failed to load locations", err);
      }
    }
    fetchLocations();
  }, []);

  const handleLocationSelect = (loc: Location) => {
    setSelectedLocation(loc);
    setSelectedRoom(null);
    setStartTime(null);
  };

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
    setStartTime(null);
  };

  const handleSlotSelect = useCallback((start: Date, end: Date, duration: number) => {
    setStartTime(start);
    setEndTime(end);
    setDurationHours(duration);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auth Check Intercept
    const token = localStorage.getItem("cinemac_token");
    if (!token) {
      if (selectedLocation && selectedRoom && startTime && endTime) {
        const pendingBooking = {
          locationId: selectedLocation.id,
          roomId: selectedRoom.id,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          durationHours,
          mediaId: selectedMedia?.mediaId || null,
          mediaType: selectedMedia?.mediaType || null
        };
        sessionStorage.setItem("cinemac_pending_booking", JSON.stringify(pendingBooking));
        sessionStorage.setItem("cinemac_redirect", "/bookings");
      }
      
      setErrorMsg("You need to login to make a booking. Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
      return;
    }

    if (!selectedRoom || !startTime || !endTime) {
      setErrorMsg("Please complete all sections before booking.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const username = localStorage.getItem("cinemac_username") || "Guest";

    const payload = {
      roomId: selectedRoom.id,
      customerName: username,
      customerEmail: `${username.toLowerCase().replace(" ", "")}@cinemac.com`,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      playedMediaTitle: selectedMedia?.mediaTitle || "",
      playedMediaType: selectedMedia?.mediaType || ""
    };

    try {
      const res = await fetch(`${API_BASE_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsSuccess(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const errText = await res.text();
        setErrorMsg(`Booking failed: ${errText}`);
      }
    } catch (err) {
      setErrorMsg("A network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPrice = selectedRoom && durationHours
    ? selectedRoom.pricingType === 1
      ? selectedRoom.price.toFixed(2)                          // flat rate
      : (selectedRoom.price * durationHours).toFixed(2)       // per hour
    : "0.00";

  if (isSuccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(52,211,153,0.5)]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-12 h-12 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Booking Confirmed!</h1>
        <div className="text-gray-300 max-w-lg mb-8 text-base bg-gray-900/50 p-6 rounded-2xl border border-gray-800 text-left space-y-3">
          <div className="flex justify-between"><span className="text-gray-400">Room</span><span className="font-bold text-white">{selectedRoom?.name}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Location</span><span className="font-bold text-white">{selectedLocation?.name}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Date</span><span className="font-bold text-white">{startTime?.toDateString()}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Time</span><span className="font-bold text-cinemac-blue">{startTime?.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})} – {endTime?.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Duration</span><span className="font-bold text-white">{durationHours}h</span></div>
          <div className="flex justify-between border-t border-gray-800 pt-3"><span className="text-gray-400">Total Paid</span><span className="font-black text-green-400">Rs. {selectedRoom ? (selectedRoom.pricingType === 1 ? selectedRoom.price.toFixed(2) : (selectedRoom.price * durationHours).toFixed(2)) : "0.00"}</span></div>
          {selectedMedia && (
            <div className="flex justify-between border-t border-gray-800 pt-3"><span className="text-gray-400">Media</span><span className="font-bold text-purple-400 truncate max-w-[55%] text-right">{selectedMedia.mediaTitle}</span></div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg">
          <button 
            onClick={() => window.location.reload()}
            className="flex-1 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
          >
            Another Booking
          </button>
          <button 
            onClick={() => router.push("/profile")}
            className="flex-1 px-8 py-4 bg-gradient-to-r from-cinemac-blue to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20"
          >
            View My Bookings
          </button>
          <button 
            onClick={() => router.push("/")}
            className="flex-1 px-8 py-4 bg-gray-900 text-white border border-gray-700 font-bold rounded-xl hover:bg-gray-800 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

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
        {selectedRoom && startTime && (
          <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
             <h3 className="text-2xl font-bold mb-6">Final Details</h3>
             {errorMsg && (
               <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl mb-6">
                 {errorMsg}
               </div>
             )}
             <div className="grid grid-cols-1 md:grid-cols-1 gap-10">
               <div className="bg-black/50 p-6 rounded-2xl border border-gray-800 flex flex-col justify-between">
                 <div>
                    <div className="flex justify-between text-sm mb-2"><span className="text-gray-400">Location</span> <span className="font-bold">{selectedLocation?.name}</span></div>
                    <div className="flex justify-between text-sm mb-2"><span className="text-gray-400">Room</span> <span className="font-bold">{selectedRoom.name}</span></div>
                    <div className="flex justify-between text-sm mb-2"><span className="text-gray-400">Date</span> <span className="font-bold">{startTime.toDateString()}</span></div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Time</span> 
                      <span className="font-bold text-cinemac-blue">
                         {startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {endTime?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-4"><span className="text-gray-400">Duration</span> <span className="font-bold">{durationHours} Hours</span></div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Pricing</span>
                      <span className="font-bold text-gray-300">
                        {selectedRoom.pricingType === 1
                          ? `Rs. ${selectedRoom.price} (flat rate)`
                          : `Rs. ${selectedRoom.price} × ${durationHours}h`}
                      </span>
                    </div>
                    {selectedMedia && (
                      <div className="flex justify-between text-sm mb-2 border-t border-gray-800 pt-2">
                        <span className="text-gray-400">Selected Media</span> 
                        <span className="font-bold text-purple-400 truncate max-w-[50%] text-right">{selectedMedia.mediaTitle}</span>
                      </div>
                    )}
                 </div>
                 <div className="border-t border-gray-800 pt-4 flex justify-between items-end">
                    <span className="text-gray-400">Total Price</span>
                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                      Rs. {totalPrice}
                    </span>
                 </div>
               </div>
             </div>
             <button 
               disabled={isSubmitting}
               type="submit" 
               className={`w-full mt-8 py-4 rounded-xl font-bold text-lg shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all
                ${isSubmitting ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-cinemac-purple to-purple-600 hover:scale-[1.02] text-white'}`}
             >
               {isSubmitting ? 'Processing Booking...' : 'Confirm & Book Now'}
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
        <Suspense fallback={<div className="text-center p-20 text-cinemac-blue font-bold">Loading booking forms...</div>}>
          <BookingForm />
        </Suspense>
      </main>
    </div>
  );
}
