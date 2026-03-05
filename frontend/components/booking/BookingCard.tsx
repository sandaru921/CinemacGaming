"use client";

import { useEffect, useRef } from "react";

interface BookingCardProps {
  booking: any;
  onClick: (booking: any) => void;
}

function getStatusColor(status: number): string {
  switch (status) {
    case 0: return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
    case 1: return "bg-green-500/20 text-green-500 border-green-500/50";
    case 2: return "bg-red-500/20 text-red-500 border-red-500/50";
    case 3: return "bg-blue-500/20 text-blue-500 border-blue-500/50";
    default: return "bg-gray-500/20 text-gray-400 border-gray-500/50";
  }
}

function getStatusText(status: number, isPast: boolean): string {
  if (status === 1 && isPast) return "Completed";
  switch (status) {
    case 0: return "Pending";
    case 1: return "Confirmed";
    case 2: return "Cancelled";
    case 3: return "Completed";
    default: return "Unknown";
  }
}

export default function BookingCard({ booking, onClick }: BookingCardProps) {
  const startTime = new Date(booking.startTime);
  const endTime = new Date(booking.endTime);
  const isPast = endTime < new Date();

  return (
    <div
      onClick={() => onClick(booking)}
      className={`bg-gray-900 border border-gray-800 rounded-2xl p-5 cursor-pointer transition-all
        ${isPast || booking.status === 2 ? "opacity-60" : "hover:border-gray-500 hover:bg-gray-900/80 hover:shadow-lg"}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: status + location + room */}
        <div className="min-w-0">
          <div className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm border inline-block mb-2 ${getStatusColor(booking.status)}`}>
            {getStatusText(booking.status, isPast)}
          </div>
          <h3 className="font-bold text-white truncate">{booking.room?.location?.name || "Unknown Location"}</h3>
          <p className="text-cinemac-blue text-sm font-semibold">{booking.room?.name || "Unknown Room"}</p>
        </div>

        {/* Right: price + date */}
        <div className="text-right shrink-0">
          <p className="font-black text-green-400">Rs. {booking.totalPrice.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">{startTime.toLocaleDateString()}</p>
          <p className="text-xs text-gray-500">
            {startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –{" "}
            {endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>

      {booking.playedMediaTitle && (
        <div className="mt-3 flex items-center gap-2 bg-purple-900/10 border border-purple-500/20 px-3 py-2 rounded-xl">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-purple-400 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
          </svg>
          <span className="text-xs font-semibold text-white truncate">{booking.playedMediaTitle}</span>
          <span className="text-[10px] text-gray-500 uppercase ml-auto shrink-0">{booking.playedMediaType}</span>
        </div>
      )}
    </div>
  );
}
