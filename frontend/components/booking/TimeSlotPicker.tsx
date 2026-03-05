"use client";

import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5211/api";

interface TimeSlotPickerProps {
  roomId: string;
  onSlotSelected: (start: Date, end: Date, totalHours: number) => void;
}

interface BookingSlot {
  startTime: Date;
  endTime: Date;
}

export default function TimeSlotPicker({ roomId, onSlotSelected }: TimeSlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [durationHours, setDurationHours] = useState<number>(2.5);
  
  const [bookedSlots, setBookedSlots] = useState<BookingSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch booked slots for the selected date and room
  useEffect(() => {
    if (!roomId || !selectedDate) return;

    const fetchAvailability = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/bookings/availability?roomId=${roomId}&date=${selectedDate}`);
        if (!response.ok) throw new Error("Failed to fetch availability");
        
        const data = await response.json();
        
        // Parse dates from API
        const parsedSlots = data.map((b: any) => ({
          startTime: new Date(b.startTime),
          endTime: new Date(b.endTime)
        }));
        
        setBookedSlots(parsedSlots);
        setSelectedTime(""); // Reset time selection on date change
      } catch (err) {
        setError("Could not load availability. Please try again.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, [roomId, selectedDate]);

  // Generate available times (e.g., from 10:00 AM to 10:00 PM, every 30 mins)
  const generateTimeOptions = () => {
    const options = [];
    const startHour = 10;
    const endHour = 22; // 10 PM

    // We check if a proposed slot (Start + Duration) overlaps with any existing booked slots.
    for (let hour = startHour; hour < endHour; hour++) {
      for (let min of [0, 30]) {
        const timeString = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        
        // Construct standard JS Date for the exact proposed start and end
        const proposedStart = new Date(`${selectedDate}T${timeString}:00`);
        const proposedEnd = new Date(proposedStart.getTime() + durationHours * 60 * 60 * 1000);

        // Check if this proposed block overlaps with any booked block
        const isConflict = bookedSlots.some(booked => {
           return (proposedStart < booked.endTime && proposedEnd > booked.startTime);
        });

        // Also check if proposed end is past closing time (e.g., midnight)
        const closingTime = new Date(`${selectedDate}T23:59:59`);
        const isTooLate = proposedEnd > closingTime;

        if (!isConflict && !isTooLate) {
          options.push(timeString);
        }
      }
    }
    return options;
  };

  const availableTimeOptions = generateTimeOptions();

  // Whenever user selections change, notify parent component
  useEffect(() => {
    if (selectedDate && selectedTime && durationHours) {
      const start = new Date(`${selectedDate}T${selectedTime}:00`);
      const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
      onSlotSelected(start, end, durationHours);
    }
  }, [selectedDate, selectedTime, durationHours, onSlotSelected]);

  return (
    <div className="w-full mt-8 bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
      <h3 className="text-xl font-bold text-white mb-6 text-center sm:text-left">Select a Date & Time</h3>
      
      {isLoading && <p className="text-cinemac-blue text-center mb-4">Checking availability...</p>}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Date & Duration Selectors */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">Choose Date</label>
            <input 
              type="date" 
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]} // Cannot book in the past
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cinemac-blue transition-colors [color-scheme:dark]"
            />
          </div>

          <div>
             <label className="block text-sm font-semibold text-gray-400 mb-2">
               Duration ({durationHours} hours)
               <span className="ml-2 text-xs text-cinemac-purple bg-purple-500/20 px-2 py-0.5 rounded-full">Default 2.5h</span>
             </label>
             <div className="flex gap-2 bg-gray-900 p-2 rounded-xl border border-gray-700">
               {[2.5, 3.0, 3.5, 4.0, 4.5, 5.0].map(duration => (
                 <button
                   key={duration}
                   type="button"
                   onClick={() => {
                     setDurationHours(duration);
                     setSelectedTime(""); // Reset time if duration changes since availability might change
                   }}
                   className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${durationHours === duration ? 'bg-cinemac-blue text-white shadow-md' : 'text-gray-400 hover:bg-gray-800'}`}
                 >
                   {duration}h
                 </button>
               ))}
             </div>
             <p className="text-xs text-gray-500 mt-2">Note: Longer durations may reduce available start times.</p>
          </div>
        </div>

        {/* Time Selectors */}
        <div>
          <label className="block text-sm font-semibold text-gray-400 mb-2">Available Start Times</label>
          {availableTimeOptions.length === 0 ? (
            <div className="h-32 flex items-center justify-center bg-gray-900/50 rounded-xl border border-gray-800 text-sm text-gray-500">
              {isLoading ? 'Loading...' : 'No available slots for this duration on this date.'}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {availableTimeOptions.map((timeStr) => {
                // Convert 24h to 12h for display
                const [h, m] = timeStr.split(':');
                const hour = parseInt(h);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const displayHour = hour % 12 || 12;
                const displayStr = `${displayHour}:${m} ${ampm}`;

                return (
                  <button
                    key={timeStr}
                    type="button"
                    onClick={() => setSelectedTime(timeStr)}
                    className={`py-2 px-1 rounded-xl text-sm font-bold border transition-all
                      ${selectedTime === timeStr 
                        ? 'bg-gradient-to-r from-cinemac-blue to-purple-500 text-white border-transparent shadow-lg shadow-blue-500/20' 
                        : 'bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-800'
                      }`}
                  >
                    {displayStr}
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
