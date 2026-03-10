"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Loader2, ChevronLeft, ChevronRight, X, User, Wifi, WifiOff,
  Edit2, Trash2, Save, Clock, MapPin, Copy, Check, Plus
} from "lucide-react";
import * as signalR from "@microsoft/signalr";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5211/api";
const HUB_URL  = process.env.NEXT_PUBLIC_HUB_URL      || "http://localhost:5211/hubs/booking";

const GRID_START_HOUR  = 9;
const GRID_END_HOUR    = 23;
const TOTAL_HOURS      = GRID_END_HOUR - GRID_START_HOUR;
const SLOTS_PER_HOUR   = 12;
const TOTAL_SLOTS      = TOTAL_HOURS * SLOTS_PER_HOUR;
const SLOT_MINUTES     = 5;

const allSlots = Array.from({ length: TOTAL_SLOTS }, (_, i) => i);

const slotToTime = (slot: number) => ({
  hour:   GRID_START_HOUR + Math.floor(slot / SLOTS_PER_HOUR),
  minute: (slot % SLOTS_PER_HOUR) * SLOT_MINUTES,
});

const dateToSlot = (d: Date): number => {
  const minutesFromStart = (d.getHours() - GRID_START_HOUR) * 60 + d.getMinutes();
  return Math.max(0, Math.min(TOTAL_SLOTS, Math.round(minutesFromStart / SLOT_MINUTES)));
};

const BOOKING_COLORS = {
  upcoming:  { bg: "bg-[#1a3a5c]", border: "border-[#4472C4]", text: "text-blue-300",  dot: "bg-blue-400",  label: "Upcoming"    },
  ongoing:   { bg: "bg-[#1a4a1a]", border: "border-[#4CAF50]", text: "text-green-300", dot: "bg-green-400", label: "Now Playing" },
  past:      { bg: "bg-[#2a2a2a]", border: "border-[#555555]", text: "text-gray-400",  dot: "bg-gray-500",  label: "Past"        },
  cancelled: { bg: "bg-[#3a1a1a]", border: "border-[#C00000]", text: "text-red-400",   dot: "bg-red-500",   label: "Cancelled"   },
};

const STATUS_OPTIONS = [
  { label: "Pending",   value: 0, color: "text-yellow-400 border-yellow-600 bg-yellow-900/20" },
  { label: "Confirmed", value: 1, color: "text-green-400  border-green-600  bg-green-900/20"  },
  { label: "Cancelled", value: 2, color: "text-red-400    border-red-600    bg-red-900/20"    },
];

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("adminToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const guidEquals = (a: string, b: string) => a?.toLowerCase() === b?.toLowerCase();

const toLocalDateString = (utcString: string): string => {
  const d = new Date(utcString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const getBookingState = (booking: any): keyof typeof BOOKING_COLORS => {
  const s = (booking.status ?? "").toString().toLowerCase();
  if (s === "cancelled" || s === "2") return "cancelled";
  const now = new Date(), start = new Date(booking.startTime), end = new Date(booking.endTime);
  if (now >= start && now < end) return "ongoing";
  if (now >= end) return "past";
  return "upcoming";
};

const toDatetimeLocal = (utcString: string): string => {
  const d = new Date(utcString);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

const formatSlotTime = (slot: number) => {
  const { hour, minute } = slotToTime(slot);
  const h12 = hour % 12 || 12;
  const ampm = hour < 12 ? "AM" : "PM";
  return minute === 0 ? `${h12}${ampm}` : `${h12}:${String(minute).padStart(2, "0")}${ampm}`;
};

const durationLabel = (startSlot: number, endSlot: number) => {
  const mins = (endSlot - startSlot) * SLOT_MINUTES;
  const h = Math.floor(mins / 60), m = mins % 60;
  return m > 0 ? (h > 0 ? `${h}h ${m}m` : `${m}m`) : `${h}h`;
};

interface EditForm {
  customerName: string; customerEmail: string; customerPhone: string;
  startTime: string; endTime: string; playedMediaTitle: string; playedMediaType: string;
}

interface AddForm extends EditForm {
  roomId: string;
  locationId: string;
}

const blankForm = (b: any): EditForm => ({
  customerName: b.customerName ?? "", customerEmail: b.customerEmail ?? "",
  customerPhone: b.customerPhone ?? "", startTime: toDatetimeLocal(b.startTime),
  endTime: toDatetimeLocal(b.endTime), playedMediaTitle: b.playedMediaTitle ?? "",
  playedMediaType: b.playedMediaType ?? "",
});

// ─────────────────────────────────────────────────────────────────────────────
interface RoomColumnProps {
  room: any;
  bookingsForRoom: any[];
  onSelectBooking: (b: any) => void;
  onEmptySlotClick: (room: any, slot: number) => void;
  nowSlot: number | null;
}

const RoomColumn = React.memo(function RoomColumn({
  room, bookingsForRoom, onSelectBooking, onEmptySlotClick, nowSlot,
}: RoomColumnProps) {
  const slotMap = useMemo(() => {
    const map = new Map<number, any>();
    bookingsForRoom.forEach((b) => {
      const s = (b.status ?? "").toString().toLowerCase();
      if (s === "cancelled" || s === "2") return;
      const start = dateToSlot(new Date(b.startTime));
      const end   = dateToSlot(new Date(b.endTime));
      for (let i = start; i < end; i++) map.set(i, b);
    });
    return map;
  }, [bookingsForRoom]);

  const bookingBlocks = useMemo(() => {
    const seen = new Set<string>();
    const blocks: { booking: any; startSlot: number; endSlot: number }[] = [];
    bookingsForRoom.forEach((b) => {
      const s = (b.status ?? "").toString().toLowerCase();
      if (s === "cancelled" || s === "2") return;
      if (seen.has(b.id)) return;
      seen.add(b.id);
      blocks.push({
        booking: b,
        startSlot: dateToSlot(new Date(b.startTime)),
        endSlot:   dateToSlot(new Date(b.endTime)),
      });
    });
    return blocks;
  }, [bookingsForRoom]);

  return (
    <div className="relative w-full h-full">
      {allSlots.map((slot) => {
        const isBooked = slotMap.has(slot);
        const isHourStart = slot % SLOTS_PER_HOUR === 0;
        return (
          <div
            key={slot}
            onClick={() => !isBooked && onEmptySlotClick(room, slot)}
            className={`absolute left-0 right-0 group transition-colors ${
              isBooked ? "" : "hover:bg-blue-600/20 cursor-crosshair z-0"
            }`}
            style={{
              top:    `${(slot / TOTAL_SLOTS) * 100}%`,
              height: `${(1 / TOTAL_SLOTS) * 100}%`,
              borderTop: isHourStart ? "1px solid rgba(55,65,81,0.5)" : undefined,
            }}
          >
             {!isBooked && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus size={8} className="text-blue-400" />
              </div>
            )}
          </div>
        );
      })}

      {nowSlot !== null && (
        <div
          className="absolute left-0 right-0 h-px bg-orange-500/60 z-10 pointer-events-none"
          style={{ top: `${(nowSlot / TOTAL_SLOTS) * 100}%` }}
        />
      )}

      {bookingBlocks.map(({ booking, startSlot, endSlot }) => {
        const state  = getBookingState(booking);
        const colors = BOOKING_COLORS[state];
        const topPct    = (startSlot / TOTAL_SLOTS) * 100;
        const heightPct = ((endSlot - startSlot) / TOTAL_SLOTS) * 100;
        return (
          <div
            key={booking.id}
            onClick={() => onSelectBooking(booking)}
            className={`absolute left-0.5 right-0.5 ${colors.bg} ${colors.border} border-l-[3px] rounded-sm cursor-pointer hover:brightness-125 transition-all shadow-md overflow-hidden flex flex-col p-1 z-10`}
            style={{ top: `${topPct}%`, height: `${heightPct}%` }}
          >
            <p className={`text-[5px] font-black uppercase tracking-widest ${colors.text} leading-tight`}>{colors.label}</p>
            <p className="text-[6px] font-bold text-white/60 leading-tight truncate">
              {formatSlotTime(startSlot)}–{formatSlotTime(endSlot)}
            </p>
            <p className="text-[9px] font-black text-white truncate uppercase leading-tight">{booking.customerName}</p>
            <div className="mt-auto flex justify-between items-end">
              <span className="text-[6px] text-white/40 font-bold">{durationLabel(startSlot, endSlot)}</span>
              <span className="text-[7px] font-black text-white/80 italic">{booking.totalPrice}/-</span>
            </div>
          </div>
        );
      })}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
export default function CinemaMasterDashboard() {
  const [bookings,            setBookings]            = useState<any[]>([]);
  const [locations,           setLocations]           = useState<any[]>([]);
  const [rooms,               setRooms]               = useState<any[]>([]);
  const [loading,             setLoading]             = useState(true);
  const [error,               setError]               = useState<string | null>(null);
  const [signalRStatus,       setSignalRStatus]       = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [selectedDate,        setSelectedDate]        = useState(new Date().toISOString().split("T")[0]);
  const [selectedBooking,     setSelectedBooking]     = useState<any | null>(null);
  const [activeLocationIndex, setActiveLocationIndex] = useState(0);
  const [nowTime,             setNowTime]             = useState(new Date());

  const [isEditMode,    setIsEditMode]    = useState(false);
  const [editForm,      setEditForm]      = useState<EditForm | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isSaving,      setIsSaving]      = useState(false);
  const [popupError,    setPopupError]    = useState<string | null>(null);
  const [idCopied,      setIdCopied]      = useState(false);

  // New Booking Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFromGrid, setIsFromGrid] = useState(false); // Track if click came from grid
  const [addForm, setNewAddForm] = useState<AddForm>({
    customerName: "", customerEmail: "", customerPhone: "",
    startTime: "", endTime: "", playedMediaTitle: "", playedMediaType: "",
    roomId: "", locationId: ""
  });

  const connectionRef     = useRef<signalR.HubConnection | null>(null);
  const locationSliderRef = useRef<HTMLDivElement>(null);
  const gridRef           = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const iv = setInterval(() => setNowTime(new Date()), 60_000);
    return () => clearInterval(iv);
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/AdminBookings`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setBookings(await res.json());
    } catch (e) { console.error("❌ refresh failed", e); }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const h = getAuthHeaders();
        const [lR, rR, bR] = await Promise.all([
          fetch(`${API_BASE}/admin/AdminLocations`, { headers: h }),
          fetch(`${API_BASE}/admin/AdminRooms`,     { headers: h }),
          fetch(`${API_BASE}/admin/AdminBookings`,  { headers: h }),
        ]);
        const parse = async (r: Response, lbl: string) => {
          if (r.status === 401) throw new Error(`Unauthorized (${lbl})`);
          if (!r.ok) throw new Error(`HTTP ${r.status} on ${lbl}`);
          const t = await r.text(); return t ? JSON.parse(t) : [];
        };
        const [l, rm, b] = await Promise.all([parse(lR,"Locations"), parse(rR,"Rooms"), parse(bR,"Bookings")]);
        setLocations(l); setRooms(rm); setBookings(b);
      } catch (e: any) { setError(e.message || "Failed to load"); }
      finally { setLoading(false); }
    })();
  }, [selectedDate]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const conn = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: () => token || "" })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();
    conn.on("ReceiveBookingUpdate", fetchBookings);
    conn.on("BookingDeleted", fetchBookings);
    conn.onreconnecting(() => setSignalRStatus("connecting"));
    conn.onreconnected(() => { setSignalRStatus("connected"); fetchBookings(); });
    conn.onclose(() => setSignalRStatus("disconnected"));
    conn.start().then(() => setSignalRStatus("connected")).catch(() => setSignalRStatus("disconnected"));
    connectionRef.current = conn;
    return () => { conn.stop(); };
  }, [fetchBookings]);

  useEffect(() => {
    if (selectedBooking) {
      setEditForm(blankForm(selectedBooking));
      setIsEditMode(false); setDeleteConfirm(false); setPopupError(null); setIdCopied(false);
    }
  }, [selectedBooking]);

  const allRoomsSorted = useMemo(() =>
    locations.flatMap((loc) =>
      rooms.filter((r) => guidEquals(r.locationId, loc.id))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((r) => ({ ...r, locationName: loc.name }))
    ), [locations, rooms]);

  const activeLocation = locations[activeLocationIndex];
  const activeRooms    = activeLocation
    ? allRoomsSorted.filter((r) => guidEquals(r.locationId, activeLocation.id))
    : allRoomsSorted;

  const isViewingToday = selectedDate === new Date().toISOString().split("T")[0];
  const nowSlot = useMemo(() =>
    isViewingToday ? dateToSlot(nowTime) : null,
    [nowTime, isViewingToday]);

  const todayBookings = useMemo(() =>
    bookings.filter((b) => toLocalDateString(b.startTime) === selectedDate),
    [bookings, selectedDate]);

  const stats = useMemo(() => ({
    ongoing:   todayBookings.filter((b) => getBookingState(b) === "ongoing").length,
    upcoming:  todayBookings.filter((b) => getBookingState(b) === "upcoming").length,
    past:      todayBookings.filter((b) => getBookingState(b) === "past").length,
    cancelled: todayBookings.filter((b) => getBookingState(b) === "cancelled").length,
  }), [todayBookings]);

  const bookingsByRoom = useMemo(() => {
    const map = new Map<string, any[]>();
    activeRooms.forEach((r) => map.set(r.id, []));
    todayBookings.forEach((b) => {
      const room = activeRooms.find((r) => r.name === b.roomName && r.locationName === b.locationName);
      if (room) map.get(room.id)?.push(b);
    });
    return map;
  }, [activeRooms, todayBookings]);

  const roomCount      = activeRooms.length;
  const headerFontSize = roomCount > 12 ? "text-[7px]" : roomCount > 8 ? "text-[9px]" : "text-[11px]";

  // ── Logic Changes ──
  const handleEmptySlotClick = (room: any, slot: number) => {
    const { hour, minute } = slotToTime(slot);
    const start = new Date(selectedDate);
    start.setHours(hour, minute, 0);

    const end = new Date(start);
    end.setHours(start.getHours() + 1);

    setIsFromGrid(true); // From grid
    setNewAddForm({
      customerName: "", customerEmail: "", customerPhone: "",
      playedMediaTitle: "", playedMediaType: "",
      startTime: toDatetimeLocal(start.toISOString()),
      endTime: toDatetimeLocal(end.toISOString()),
      roomId: room.id,
      locationId: room.locationId
    });
    setPopupError(null);
    setIsAddModalOpen(true);
  };

  const handleManualAddClick = () => {
    setIsFromGrid(false); // From manual button
    setNewAddForm({
      customerName: "", customerEmail: "", customerPhone: "",
      playedMediaTitle: "", playedMediaType: "",
      startTime: toDatetimeLocal(new Date().toISOString()),
      endTime: toDatetimeLocal(new Date(Date.now() + 3600000).toISOString()),
      roomId: rooms[0]?.id || "",
      locationId: locations[0]?.id || ""
    });
    setPopupError(null);
    setIsAddModalOpen(true);
  };

  const handleAddBooking = async () => {
    setIsSaving(true); setPopupError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/AdminBookings`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(addForm),
      });
      if (res.status === 409) throw new Error("Time slot overlaps with another booking.");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setIsAddModalOpen(false);
      await fetchBookings();
    } catch (e: any) { setPopupError(e.message); }
    finally { setIsSaving(false); }
  };

  const handleStatusChange = async (v: number) => {
    if (!selectedBooking) return;
    setIsSaving(true); setPopupError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/AdminBookings/${selectedBooking.id}/status`, {
        method: "PATCH", headers: getAuthHeaders(), body: JSON.stringify({ status: v }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const lbl = STATUS_OPTIONS.find((s) => s.value === v)?.label ?? String(v);
      setSelectedBooking({ ...selectedBooking, status: lbl });
      await fetchBookings();
    } catch (e: any) { setPopupError(e.message); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!selectedBooking) return;
    setIsSaving(true); setPopupError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/AdminBookings/${selectedBooking.id}`, {
        method: "DELETE", headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSelectedBooking(null); await fetchBookings();
    } catch (e: any) { setPopupError(e.message); setDeleteConfirm(false); }
    finally { setIsSaving(false); }
  };

  const handleSaveEdit = async () => {
    if (!selectedBooking || !editForm) return;
    setIsSaving(true); setPopupError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/AdminBookings/${selectedBooking.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          customerName:     editForm.customerName,
          customerEmail:    editForm.customerEmail  || null,
          customerPhone:    editForm.customerPhone  || null,
          startTime:        new Date(editForm.startTime).toISOString(),
          endTime:          new Date(editForm.endTime).toISOString(),
          playedMediaTitle: editForm.playedMediaTitle,
          playedMediaType:  editForm.playedMediaType,
        }),
      });
      if (res.status === 409) throw new Error("Time slot overlaps with another booking.");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = await res.json();
      setSelectedBooking({ ...selectedBooking, ...updated });
      setIsEditMode(false); await fetchBookings();
    } catch (e: any) { setPopupError(e.message); }
    finally { setIsSaving(false); }
  };

  const handleCopyId = () => {
    if (!selectedBooking) return;
    navigator.clipboard.writeText(selectedBooking.id);
    setIdCopied(true); setTimeout(() => setIdCopied(false), 2000);
  };

  const popupField = (key: keyof EditForm, label: string, type = "text", isAdd = false) => (
    <div className="flex flex-col gap-1">
      <label className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">{label}</label>
      {isAdd ? (
        <input type={type} value={addForm[key as keyof AddForm] ?? ""}
          onChange={(e) => setNewAddForm((f) => ({ ...f, [key]: e.target.value }))}
          className="bg-black/60 border border-gray-600 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors"
        />
      ) : isEditMode ? (
        <input type={type} value={editForm?.[key] ?? ""}
          onChange={(e) => setEditForm((f) => f ? { ...f, [key]: e.target.value } : f)}
          className="bg-black/60 border border-gray-600 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors"
        />
      ) : (
        <p className="text-sm font-bold text-white truncate">
          {(selectedBooking as any)?.[key] || <span className="text-gray-600 italic">—</span>}
        </p>
      )}
    </div>
  );

  return (
    <div className="h-screen w-screen overflow-hidden bg-black text-white flex flex-col font-sans">
      
      {/* HEADER */}
      <div className="bg-[#1a1a1a] border-b border-gray-800 px-3 py-2 shrink-0 flex items-center justify-between gap-2">
        <h1 className="text-lg font-black tracking-tighter text-blue-500 italic shrink-0">
          CINEMAC <span className="text-white not-italic">PRO</span>
        </h1>
        <div className="flex items-center gap-2 bg-black/40 border border-gray-800 rounded-lg px-3 py-1">
          {(Object.entries(BOOKING_COLORS) as any[]).map(([key, val]: any) => (
            <div key={key} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${val.dot} shrink-0`} />
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">{val.label}</span>
              <span className={`text-[8px] font-black ${val.text}`}>{(stats as any)[key] ?? 0}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {signalRStatus === "connected"    && <span className="flex items-center gap-1 text-emerald-400 text-[9px] font-black uppercase"><Wifi size={10}/><span className="animate-pulse">● LIVE</span></span>}
          {signalRStatus === "connecting"   && <span className="flex items-center gap-1 text-yellow-400 text-[9px] font-black uppercase"><Loader2 size={10} className="animate-spin"/> SYNC...</span>}
          {signalRStatus === "disconnected" && <span className="flex items-center gap-1 text-red-400 text-[9px] font-black uppercase"><WifiOff size={10}/> OFFLINE</span>}
        </div>
        <div className="flex items-center bg-black rounded-lg border border-gray-700 p-1 shrink-0">
          <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate()-1); setSelectedDate(d.toISOString().split("T")[0]); }} className="p-1 hover:text-blue-500 transition-colors"><ChevronLeft size={14}/></button>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent text-xs font-bold px-1 outline-none [color-scheme:dark] w-28"/>
          <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate()+1); setSelectedDate(d.toISOString().split("T")[0]); }} className="p-1 hover:text-blue-500 transition-colors"><ChevronRight size={14}/></button>
          <button onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])} className="ml-1 px-2 py-0.5 text-[9px] font-black text-blue-400 border border-blue-800 rounded hover:bg-blue-900/40 transition-colors">TODAY</button>
        </div>
        <button onClick={handleManualAddClick} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all shrink-0">+ New Booking</button>
      </div>

      {/* LOCATION SLIDER */}
      <div className="bg-[#111] border-b border-gray-800 px-3 py-1.5 shrink-0 flex items-center gap-2">
        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest shrink-0">Location:</span>
        <div ref={locationSliderRef} className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <button onClick={() => setActiveLocationIndex(-1)}
            className={`shrink-0 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all border ${activeLocationIndex === -1 ? "bg-blue-600 border-blue-500 text-white" : "bg-transparent border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"}`}>
            All ({allRoomsSorted.length} rooms)
          </button>
          {locations.map((loc, idx) => {
            const cnt = allRoomsSorted.filter((r) => guidEquals(r.locationId, loc.id)).length;
            const hasOngoing = todayBookings.filter((b) => b.locationName === loc.name).some((b) => getBookingState(b) === "ongoing");
            return (
              <button key={loc.id} onClick={() => setActiveLocationIndex(idx)}
                className={`shrink-0 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all border flex items-center gap-1.5 ${activeLocationIndex === idx ? "bg-blue-600 border-blue-500 text-white" : "bg-transparent border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"}`}>
                {hasOngoing && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>}
                📍 {loc.name} <span className="text-[8px] opacity-60">({cnt})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="flex-1 overflow-hidden flex bg-[#0a0a0a]">
        {loading && (
          <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-500" size={32}/>
          </div>
        )}

        <div className="w-[52px] shrink-0 relative bg-[#0d0d0d] border-r border-gray-800">
          <div className="h-[3vh] border-b border-gray-800 flex items-center justify-center">
            <span className="text-[8px] text-gray-600 font-bold uppercase">Time</span>
          </div>
          <div className="absolute left-0 right-0" style={{ top: "3vh", bottom: 0 }}>
            {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => {
              const hour = GRID_START_HOUR + i;
              const topPct = (i / TOTAL_HOURS) * 100;
              return (
                <div key={hour} className="absolute left-0 right-0 flex items-center justify-center"
                  style={{ top: `${topPct}%`, transform: "translateY(-50%)" }}>
                  <span className="text-[9px] font-mono font-bold text-gray-500">
                    {hour > 12 ? `${hour - 12}PM` : hour === 12 ? "12PM" : `${hour}AM`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="h-full flex flex-col" style={{ minWidth: `${activeRooms.length * 80}px` }}>
            <div className="shrink-0 flex border-b border-gray-800 bg-[#111]" style={{ height: "3vh" }}>
              {activeRooms.map((room) => (
                <div key={room.id} className={`flex-1 border-r border-gray-800 flex items-center justify-center font-black uppercase tracking-tight text-blue-100 truncate px-0.5 ${headerFontSize}`}>
                  {room.name}
                </div>
              ))}
            </div>

            <div ref={gridRef} className="flex-1 flex relative overflow-hidden">
              {Array.from({ length: TOTAL_HOURS - 1 }, (_, i) => (
                <div key={i} className="absolute left-0 right-0 border-t border-gray-800/50 pointer-events-none z-0" style={{ top: `${((i + 1) / TOTAL_HOURS) * 100}%` }} />
              ))}

              {nowSlot !== null && (
                <div className="absolute left-0 right-0 z-20 pointer-events-none flex items-center" style={{ top: `${(nowSlot / TOTAL_SLOTS) * 100}%` }}>
                  <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0 shadow-[0_0_6px_2px_rgba(249,115,22,0.6)]" />
                  <div className="flex-1 h-[1.5px] bg-orange-500 opacity-70" />
                </div>
              )}

              {activeRooms.map((room) => (
                <div key={room.id} className="flex-1 relative border-r border-gray-800/40 overflow-hidden">
                  <RoomColumn
                    room={room}
                    bookingsForRoom={bookingsByRoom.get(room.id) ?? []}
                    onSelectBooking={setSelectedBooking}
                    onEmptySlotClick={handleEmptySlotClick}
                    nowSlot={nowSlot}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ADD BOOKING MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
           <div className="bg-[#0f0f0f] border border-blue-900/40 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between bg-blue-900/20">
                <div className="flex items-center gap-3">
                   <div className="p-2 rounded-xl border border-blue-500 bg-blue-500/10"><Plus size={16} className="text-blue-400"/></div>
                   <div>
                     <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">New Entry</p>
                     <p className="font-black text-white text-sm">Create Booking</p>
                   </div>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg"><X size={18}/></button>
              </div>

              <div className="overflow-y-auto flex-1 p-5 space-y-4">
                {popupError && <div className="bg-red-900/40 border border-red-700/60 rounded-xl px-4 py-3 text-red-300 text-xs">⚠️ {popupError}</div>}
                
                {popupField("customerName", "Customer Name", "text", true)}
                <div className="grid grid-cols-2 gap-3">
                  {popupField("customerEmail", "Email", "email", true)}
                  {popupField("customerPhone", "Phone", "tel", true)}
                </div>

                {/* Conditional Location and Room fields */}
                <div className="grid grid-cols-2 gap-3">
                  {isFromGrid ? (
                    <>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                        <p className="text-[9px] text-gray-500 uppercase font-bold">Location</p>
                        <p className="text-sm font-bold">{locations.find(l => l.id === addForm.locationId)?.name || "N/A"}</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                        <p className="text-[9px] text-gray-500 uppercase font-bold">Room</p>
                        <p className="text-sm font-bold">{rooms.find(r => r.id === addForm.roomId)?.name || "N/A"}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Select Location</label>
                        <select 
                          value={addForm.locationId} 
                          onChange={(e) => {
                            const locId = e.target.value;
                            const firstRoom = rooms.find(r => r.locationId === locId);
                            setNewAddForm({...addForm, locationId: locId, roomId: firstRoom?.id || ""});
                          }} 
                          className="bg-black/60 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white outline-none">
                          {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Select Room</label>
                        <select 
                          value={addForm.roomId} 
                          onChange={(e) => setNewAddForm({...addForm, roomId: e.target.value})} 
                          className="bg-black/60 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white outline-none">
                          {rooms.filter(r => r.locationId === addForm.locationId).map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {popupField("startTime", "Start Time", "datetime-local", true)}
                  {popupField("endTime", "End Time", "datetime-local", true)}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {popupField("playedMediaTitle", "Media Title", "text", true)}
                  {popupField("playedMediaType", "Media Type", "text", true)}
                </div>
              </div>

              <div className="px-5 py-4 border-t border-gray-800 bg-black/40 flex gap-3">
                <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-300 text-xs font-black hover:bg-white/5 transition-colors">Cancel</button>
                <button onClick={handleAddBooking} disabled={isSaving} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center justify-center gap-2">
                  {isSaving ? <Loader2 size={12} className="animate-spin"/> : <Save size={12}/>} Create Booking
                </button>
              </div>
           </div>
        </div>
      )}

      {/* EDIT MODAL - (Keep as before) */}
      {selectedBooking && (() => {
        const state  = getBookingState(selectedBooking);
        const colors = BOOKING_COLORS[state];
        const currentStatusValue = STATUS_OPTIONS.find(
          (s) => s.label.toLowerCase() === (selectedBooking.status ?? "").toString().toLowerCase()
        )?.value ?? 1;

        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-[#0f0f0f] border border-gray-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className={`px-5 py-4 border-b border-gray-800 flex items-center justify-between shrink-0 ${colors.bg}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${colors.border} bg-black/30`}><User size={16} className={colors.text}/></div>
                  <div>
                    <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Details</p>
                    <p className="font-black text-white text-sm">{selectedBooking.customerName}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedBooking(null)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"><X size={18}/></button>
              </div>

              <div className="overflow-y-auto flex-1 p-5 space-y-5">
                {popupError && <div className="bg-red-900/40 border border-red-700/60 rounded-xl px-4 py-3 text-red-300 text-xs">⚠️ {popupError}</div>}
                <div className="grid grid-cols-1 gap-3">
                  {popupField("customerName",  "Customer Name")}
                  <div className="grid grid-cols-2 gap-3">
                    {popupField("customerEmail", "Email", "email")}
                    {popupField("customerPhone", "Phone", "tel")}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {popupField("startTime", "Start Time", "datetime-local")}
                  {popupField("endTime",   "End Time",   "datetime-local")}
                </div>
                {!isEditMode && (
                  <div>
                    <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-2">Change Status</p>
                    <div className="flex gap-2">
                      {STATUS_OPTIONS.map((s) => (
                        <button key={s.value} disabled={isSaving || currentStatusValue === s.value} onClick={() => handleStatusChange(s.value)}
                          className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${s.color} ${currentStatusValue === s.value ? "opacity-100 ring-1 ring-white/20" : "opacity-40 hover:opacity-80"}`}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-5 py-4 border-t border-gray-800 bg-black/40">
                {deleteConfirm ? (
                   <div className="flex items-center gap-3">
                     <button onClick={() => setDeleteConfirm(false)} className="px-4 py-2 rounded-xl border border-gray-700 text-gray-300 text-xs font-black">Cancel</button>
                     <button onClick={handleDelete} className="px-4 py-2 rounded-xl bg-red-700 text-white text-xs font-black">Yes, Delete</button>
                   </div>
                ) : isEditMode ? (
                  <div className="flex items-center gap-3">
                    <button onClick={() => setIsEditMode(false)} className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-300 text-xs font-black">Cancel</button>
                    <button onClick={handleSaveEdit} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-black flex items-center justify-center gap-2">Save Changes</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <button onClick={() => setDeleteConfirm(true)} className="p-2.5 rounded-xl border border-red-900/60 text-red-500"><Trash2 size={14}/></button>
                    <button onClick={() => setIsEditMode(true)} className="flex-1 py-2.5 rounded-xl border border-blue-700/60 text-blue-400 text-xs font-black flex items-center justify-center gap-2"><Edit2 size={12}/> Edit</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}