"use client";

import { Room } from "./LocationSelector";

interface RoomSelectorProps {
  rooms: Room[];
  selectedRoom: Room | null;
  onSelect: (room: Room) => void;
}

export default function RoomSelector({ rooms, selectedRoom, onSelect }: RoomSelectorProps) {
  if (!rooms || rooms.length === 0) return null;

  return (
    <div className="w-full mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-xl font-bold text-white mb-4 text-center sm:text-left">Select a Room</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => {
          const isSelected = selectedRoom?.id === room.id;
          const isVIP = room.name.includes("VIP");
          
          return (
            <button
              key={room.id}
              type="button"
              onClick={() => onSelect(room)}
              className={`relative p-5 rounded-2xl border transition-all duration-300 flex flex-col items-start gap-2 overflow-hidden
                ${isSelected 
                  ? 'bg-purple-900/40 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30'
                }`}
            >
              {/* Highlight badge for VIP */}
              {isVIP && (
                <div className="absolute -right-6 top-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black text-[10px] font-black uppercase tracking-wider py-1 px-8 rotate-45 shadow-lg">
                  Premium
                </div>
              )}
              
              <div className={`p-2 rounded-lg ${isSelected ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-800 text-gray-400'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
                </svg>
              </div>

              <div className="text-left mt-2">
                <span className={`block font-bold text-lg ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                  {room.name}
                </span>
                <span className={`text-sm ${isSelected ? 'text-purple-300' : 'text-gray-500'}`}>
                  {room.pricingType === 1
                    ? `Rs. ${room.price} / booking`
                    : `Rs. ${room.price} / hour`}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
