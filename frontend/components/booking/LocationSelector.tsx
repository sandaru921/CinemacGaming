"use client";

import { useState, useEffect } from "react";

// Types matching our backend
export interface Location {
  id: string;
  name: string;
  rooms: Room[];
}

export interface Room {
  id: string;
  locationId: string;
  name: string;
  price: number;
  pricingType: 0 | 1; // 0 = PerHour, 1 = PerBooking
}

interface LocationSelectorProps {
  locations: Location[];
  selectedLocation: Location | null;
  onSelect: (location: Location) => void;
}

export default function LocationSelector({ locations, selectedLocation, onSelect }: LocationSelectorProps) {
  return (
    <div className="w-full">
      <h3 className="text-xl font-bold text-white mb-4 text-center sm:text-left">Select a Location</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {locations.map((loc) => (
          <button
            key={loc.id}
            type="button"
            onClick={() => onSelect(loc)}
            className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-3
              ${selectedLocation?.id === loc.id 
                ? 'bg-cinemac-blue/20 border-cinemac-blue shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-8 h-8 ${selectedLocation?.id === loc.id ? 'text-cinemac-blue' : 'text-gray-400'}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span className={`font-bold text-lg ${selectedLocation?.id === loc.id ? 'text-white' : 'text-gray-300'}`}>
              {loc.name}
            </span>
            <span className="text-xs text-gray-500">{loc.rooms?.length || 0} gaming rooms</span>
          </button>
        ))}
      </div>
    </div>
  );
}
