"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "../../components/Navbar";
import LocationSelector, { Location, Room } from "../../components/booking/LocationSelector";
import RoomSelector from "../../components/booking/RoomSelector";
import TimeSlotPicker from "../../components/booking/TimeSlotPicker";
import { useRouter } from "next/navigation";

export default function BookingsPage() {
  const router = useRouter();
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

  // 1. Fetch Locations & Rooms on Mount
  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await fetch("http://localhost:5211/api/bookings/locations");
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

    // Auto-fill not needed manually anymore
  }, []);

  // Handlers
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
          durationHours
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
      endTime: endTime.toISOString()
    };

    try {
      const res = await fetch("http://localhost:5211/api/bookings", {
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

  // Calculate Price preview
  const totalPrice = selectedRoom && durationHours ? (selectedRoom.basePricePerHour * durationHours).toFixed(2) : "0.00";

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-black text-white font-sans flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(34,197,94,0.4)] animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-12 h-12 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Booking Confirmed!</h1>
          <p className="text-gray-400 max-w-lg mb-8 text-lg">
            Your {durationHours}h gaming session in {selectedRoom?.name} at {selectedLocation?.name} has been successfully booked.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors"
          >
            Book Another Room
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden flex flex-col pb-20">
      <Navbar />

      <main className="flex-1 flex flex-col items-center pt-10 px-4 sm:px-6 md:px-10">
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
            
            {/* Step 1: Location */}
            <LocationSelector 
              locations={locations} 
              selectedLocation={selectedLocation} 
              onSelect={handleLocationSelect} 
            />

            {/* Step 2: Room */}
            {selectedLocation && (
              <RoomSelector 
                rooms={selectedLocation.rooms} 
                selectedRoom={selectedRoom} 
                onSelect={handleRoomSelect} 
              />
            )}

            {/* Step 3: Time Slot */}
            {selectedRoom && (
              <TimeSlotPicker 
                roomId={selectedRoom.id} 
                onSlotSelected={handleSlotSelect} 
              />
            )}

            {/* Step 4: Checkout / Details */}
            {selectedRoom && startTime && (
              <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <h3 className="text-2xl font-bold mb-6">Final Details</h3>
                 
                 {errorMsg && (
                   <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl mb-6">
                     {errorMsg}
                   </div>
                 )}

                 <div className="grid grid-cols-1 md:grid-cols-1 gap-10">
                   {/* Summary Details spanning full width now */}

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
      </main>
    </div>
  );
}
