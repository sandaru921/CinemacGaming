"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";

const API_BASE_URL   = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5211/api";
const DURATION_HOURS = 3;
const OPEN_HOUR      = 9;
const CLOSE_HOUR     = 23;
const TOTAL_MINUTES  = (CLOSE_HOUR - OPEN_HOUR) * 60; // 840

interface TimeSlotPickerProps {
  roomId: string;
  onSlotSelected: (start: Date, end: Date) => void;
}
interface BookedSlot { startTime: Date; endTime: Date; }
interface BookedSeg  { startMin: number; endMin: number; }
type SlotStatus = "available" | "blocked" | "overflow" | "past_close";

// ── Helpers ───────────────────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, "0");

const fmtMin = (min: number): string => {
  const total = OPEN_HOUR * 60 + Math.min(Math.max(min, 0), TOTAL_MINUTES);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h % 12 || 12}:${pad(m)} ${h >= 12 ? "PM" : "AM"}`;
};

const minToTimeStr = (min: number): string => {
  const total = OPEN_HOUR * 60 + min;
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
};

const timeStrToMin = (t: string): number | null => {
  const [hStr, mStr] = t.split(":");
  const h = parseInt(hStr, 10), m = parseInt(mStr ?? "0", 10);
  if (isNaN(h) || isNaN(m)) return null;
  const min = (h - OPEN_HOUR) * 60 + m;
  return min >= 0 && min < TOTAL_MINUTES ? min : null;
};

const toSegs = (slots: BookedSlot[]): BookedSeg[] =>
  slots
    .map((b) => ({
      startMin: (b.startTime.getHours() - OPEN_HOUR) * 60 + b.startTime.getMinutes(),
      endMin:   (b.endTime.getHours()   - OPEN_HOUR) * 60 + b.endTime.getMinutes(),
    }))
    .filter((s) => s.endMin > 0 && s.startMin < TOTAL_MINUTES)
    .map((s) => ({ startMin: Math.max(0, s.startMin), endMin: Math.min(TOTAL_MINUTES, s.endMin) }));

const checkStatus = (startMin: number, segs: BookedSeg[]): { status: SlotStatus; msg: string | null } => {
  const endMin = startMin + DURATION_HOURS * 60;
  if (startMin < 0 || startMin >= TOTAL_MINUTES)
    return { status: "blocked", msg: `Choose a time between ${fmtMin(0)} and ${fmtMin(TOTAL_MINUTES - DURATION_HOURS * 60)}.` };
  if (endMin > TOTAL_MINUTES)
    return { status: "past_close", msg: `A 3-hour session from ${fmtMin(startMin)} ends after closing (${fmtMin(TOTAL_MINUTES)}).` };
  for (const s of segs) {
    if (startMin >= s.startMin && startMin < s.endMin)
      return { status: "blocked", msg: `This time is already booked until ${fmtMin(s.endMin)}.` };
    if (startMin < s.startMin && endMin > s.startMin)
      return {
        status: "overflow",
        msg: `A booking starts at ${fmtMin(s.startMin)} (until ${fmtMin(s.endMin)}). A 3-hour session from here would overlap — choose an earlier time or a different room.`,
      };
  }
  return { status: "available", msg: null };
};

// ── Timeline ─────────────────────────────────────────────────────────────────

interface TimelineProps {
  segs: BookedSeg[];
  selectedMin: number | null;
  status: SlotStatus | null;
  todayMin: number | null;
  onSelect: (min: number) => void;
}

function Timeline({ segs, selectedMin, status, todayMin, onSelect }: TimelineProps) {
  const barRef    = useRef<HTMLDivElement>(null);
  const [dragMin, setDragMin]   = useState<number | null>(null);
  const isDragging              = useRef(false);

  const pctToMin = useCallback((clientX: number): number => {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    // snap to 15-min increments
    return Math.min(TOTAL_MINUTES - 1, Math.round((ratio * TOTAL_MINUTES) / 15) * 15);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    barRef.current?.setPointerCapture(e.pointerId);
    const m = pctToMin(e.clientX);
    setDragMin(m);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    setDragMin(pctToMin(e.clientX));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const m = pctToMin(e.clientX);
    setDragMin(null);
    onSelect(m);
  };

  const selEnd = selectedMin !== null
    ? Math.min(selectedMin + DURATION_HOURS * 60, TOTAL_MINUTES)
    : null;

  const previewMin = dragMin;
  const previewEnd = previewMin !== null
    ? Math.min(previewMin + DURATION_HOURS * 60, TOTAL_MINUTES)
    : null;

  const winBg =
    status === "available" ? "rgba(59,130,246,0.25)"
    : status === "overflow" ? "rgba(249,115,22,0.25)"
    : "rgba(239,68,68,0.25)";
  const winBorder =
    status === "available" ? "#3b82f6"
    : status === "overflow" ? "#f97316"
    : "#ef4444";

  // tooltip left position clamped so it never overflows the bar
  const tooltipLeft = (min: number) => `clamp(28px, ${(min / TOTAL_MINUTES) * 100}%, calc(100% - 28px))`;

  const hours = Array.from({ length: CLOSE_HOUR - OPEN_HOUR + 1 }, (_, i) => i);

  return (
    <div className="select-none touch-none">
      {/* ── Bar ── */}
      <div
        ref={barRef}
        className="relative h-20 sm:h-16 rounded-xl border border-gray-700 bg-gray-900 cursor-crosshair overflow-hidden"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => { isDragging.current = false; setDragMin(null); }}
      >
        {/* free base */}
        <div className="absolute inset-0 bg-emerald-950/40" />

        {/* hour grid */}
        {hours.slice(1).map((i) => (
          <div key={i} className="absolute top-0 bottom-0 w-px bg-gray-700/25 pointer-events-none"
            style={{ left: `${(i / (CLOSE_HOUR - OPEN_HOUR)) * 100}%` }} />
        ))}

        {/* booked segments */}
        {segs.map((s, i) => (
          <div key={i}
            className="absolute top-0 bottom-0 bg-red-900/80 border-l border-r border-red-700/60 flex items-center justify-center overflow-hidden pointer-events-none"
            style={{ left: `${(s.startMin / TOTAL_MINUTES) * 100}%`, width: `${((s.endMin - s.startMin) / TOTAL_MINUTES) * 100}%` }}
          >
            {s.endMin - s.startMin >= 45 && (
              <span className="text-[7px] text-red-300 font-black uppercase tracking-widest">BOOKED</span>
            )}
          </div>
        ))}

        {/* drag/hover live preview */}
        {previewMin !== null && previewEnd !== null && (
          <div className="absolute top-0 bottom-0 border-l border-r border-white/30 bg-white/10 pointer-events-none"
            style={{ left: `${(previewMin / TOTAL_MINUTES) * 100}%`, width: `${((previewEnd - previewMin) / TOTAL_MINUTES) * 100}%` }}
          />
        )}

        {/* confirmed selection window */}
        {selectedMin !== null && selEnd !== null && previewMin === null && (
          <div className="absolute top-0 bottom-0 border-l-2 border-r-2 pointer-events-none"
            style={{ left: `${(selectedMin / TOTAL_MINUTES) * 100}%`, width: `${((selEnd - selectedMin) / TOTAL_MINUTES) * 100}%`, backgroundColor: winBg, borderColor: winBorder }}
          >
            {selEnd - selectedMin >= 120 && (
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black tracking-widest"
                style={{ color: winBorder }}>
                {fmtMin(selectedMin)} – {fmtMin(selEnd)}
              </span>
            )}
          </div>
        )}

        {/* now line */}
        {todayMin !== null && todayMin >= 0 && todayMin <= TOTAL_MINUTES && (
          <div className="absolute top-0 bottom-0 w-0.5 bg-orange-500 z-10 pointer-events-none"
            style={{ left: `${(todayMin / TOTAL_MINUTES) * 100}%` }}>
            <div className="absolute -top-0.5 -left-[3px] w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_6px_2px_rgba(249,115,22,0.7)]" />
          </div>
        )}

        {/* drag tooltip */}
        {previewMin !== null && (
          <div className="absolute bottom-1.5 z-30 pointer-events-none bg-black/90 border border-gray-500 text-white text-[9px] font-black px-2 py-1 rounded-lg -translate-x-1/2 whitespace-nowrap shadow-lg"
            style={{ left: tooltipLeft(previewMin) }}>
            {fmtMin(previewMin)} → {fmtMin(Math.min(previewMin + DURATION_HOURS * 60, TOTAL_MINUTES))}
          </div>
        )}
      </div>

      {/* Hour labels */}
      <div className="relative mt-2 h-4">
        {hours.map((i) => {
          const h   = OPEN_HOUR + i;
          const pct = (i / (CLOSE_HOUR - OPEN_HOUR)) * 100;
          const lbl = h === 12 ? "12P" : h > 12 ? `${h - 12}P` : `${h}A`;
          if (i % 2 !== 0) return null;
          return (
            <span key={h} className="absolute text-[9px] text-gray-600 font-mono -translate-x-1/2"
              style={{ left: `${pct}%` }}>{lbl}</span>
          );
        })}
      </div>

      {/* Instruction */}
      <p className="text-center text-[11px] text-gray-600 mt-1.5">
        {previewMin !== null
          ? <span className="text-gray-300 font-medium">Release to select {fmtMin(previewMin)}</span>
          : "Tap or drag on the bar to pick a start time"}
      </p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function TimeSlotPicker({ roomId, onSlotSelected }: TimeSlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedMin,  setSelectedMin]  = useState<number | null>(null);
  const [manualTime,   setManualTime]   = useState("");
  const [bookedSlots,  setBookedSlots]  = useState<BookedSlot[]>([]);
  const [isLoading,    setIsLoading]    = useState(false);
  const [fetchError,   setFetchError]   = useState<string | null>(null);

  const segs       = toSegs(bookedSlots);
  const statusInfo = selectedMin !== null ? checkStatus(selectedMin, segs) : null;
  const isToday    = selectedDate === new Date().toISOString().split("T")[0];
  const todayMin   = isToday
    ? (new Date().getHours() - OPEN_HOUR) * 60 + new Date().getMinutes()
    : null;

  const lastStart  = TOTAL_MINUTES - DURATION_HOURS * 60;
  const quickSlots = Array.from({ length: lastStart / 30 + 1 }, (_, i) => i * 30);
  const freeCount  = quickSlots.filter((m) => checkStatus(m, segs).status === "available").length;

  useEffect(() => {
    if (!roomId || !selectedDate) return;
    let cancelled = false;
    setIsLoading(true);
    setFetchError(null);
    setSelectedMin(null);
    setManualTime("");

    fetch(`${API_BASE_URL}/bookings/availability?roomId=${roomId}&date=${selectedDate}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: any[]) => {
        if (cancelled) return;
        setBookedSlots(data.map((b) => ({ startTime: new Date(b.startTime), endTime: new Date(b.endTime) })));
      })
      .catch(() => { if (!cancelled) setFetchError("Could not load availability. Please try again."); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [roomId, selectedDate]);

  const applyMin = useCallback((min: number) => {
    setSelectedMin(min);
    setManualTime(minToTimeStr(min));
    const { status } = checkStatus(min, toSegs(bookedSlots));
    if (status === "available") {
      const start = new Date(`${selectedDate}T${minToTimeStr(min)}:00`);
      onSlotSelected(start, new Date(start.getTime() + DURATION_HOURS * 3_600_000));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookedSlots, selectedDate, onSlotSelected]);

  const handleManualChange = (value: string) => {
    setManualTime(value);
    const min = timeStrToMin(value);
    if (min === null) { setSelectedMin(null); return; }
    applyMin(min);
  };

  const selectedStart = selectedMin !== null && statusInfo?.status === "available"
    ? new Date(`${selectedDate}T${minToTimeStr(selectedMin)}:00`) : null;
  const selectedEnd = selectedStart
    ? new Date(selectedStart.getTime() + DURATION_HOURS * 3_600_000) : null;

  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <h3 className="text-lg sm:text-xl font-bold text-white">Select Date & Time</h3>
        <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-bold px-3 py-1.5 rounded-full">
          <Clock size={11} /> Fixed 3-hour session
        </div>
      </div>

      {fetchError && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 text-red-300 text-sm mb-5 text-center">
          {fetchError}
        </div>
      )}

      {/* ── Date + Manual time ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <div>
          <label className="block text-sm font-semibold text-gray-400 mb-2">Date</label>
          <input
            type="date"
            value={selectedDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-cinemac-blue transition-colors [color-scheme:dark]"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-400 mb-2">
            Start Time
            <span className="ml-1.5 text-[10px] font-normal text-gray-600 hidden sm:inline">
              {pad(OPEN_HOUR)}:00 – {pad(CLOSE_HOUR - DURATION_HOURS)}:00
            </span>
          </label>
          <input
            type="time"
            value={manualTime}
            min={`${pad(OPEN_HOUR)}:00`}
            max={`${pad(CLOSE_HOUR - DURATION_HOURS)}:00`}
            onChange={(e) => handleManualChange(e.target.value)}
            className={`w-full bg-gray-900 border rounded-xl px-4 py-3.5 text-white font-bold text-base focus:outline-none transition-colors [color-scheme:dark] ${
              statusInfo?.status === "available"
                ? "border-emerald-600 focus:border-emerald-500"
                : statusInfo
                ? "border-red-800 focus:border-red-700"
                : "border-gray-700 focus:border-cinemac-blue"
            }`}
          />
        </div>
      </div>

      {/* ── Status banner ── */}
      {statusInfo && selectedMin !== null && (
        <div className={`mb-5 rounded-xl px-4 py-3 flex items-start gap-3 ${
          statusInfo.status === "available"
            ? "bg-emerald-900/25 border border-emerald-700/40"
            : "bg-orange-950/60 border border-orange-700/40"
        }`}>
          {statusInfo.status === "available"
            ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            : <AlertCircle  size={16} className="text-orange-400 shrink-0 mt-0.5" />}
          <p className={`text-sm leading-snug font-medium ${statusInfo.status === "available" ? "text-emerald-300" : "text-orange-300"}`}>
            {statusInfo.status === "available"
              ? <>Available — session runs <strong className="text-white">{fmtMin(selectedMin)} → {fmtMin(selectedMin + DURATION_HOURS * 60)}</strong></>
              : statusInfo.msg}
          </p>
        </div>
      )}

      {/* ── Timeline ── */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-y-1.5 mb-3">
          <label className="text-sm font-semibold text-gray-400">Availability Timeline</label>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-950 border border-emerald-800/60" /> Free
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-red-900/80 border border-red-700/60" /> Booked
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-blue-500/30 border border-blue-500" /> Your 3h
            </span>
            {isToday && (
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Now
              </span>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="h-20 sm:h-16 bg-gray-900/50 rounded-xl border border-gray-800 flex items-center justify-center">
            <p className="text-sm text-blue-400 animate-pulse">Checking availability…</p>
          </div>
        ) : (
          <Timeline
            segs={segs}
            selectedMin={selectedMin}
            status={statusInfo?.status ?? null}
            todayMin={todayMin}
            onSelect={applyMin}
          />
        )}
      </div>

      {/* ── Quick select ── */}
      {!isLoading && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Quick Select</label>
            <span className={`text-xs font-semibold ${freeCount > 0 ? "text-emerald-500" : "text-red-500"}`}>
              {freeCount > 0 ? `${freeCount} slot${freeCount !== 1 ? "s" : ""} free` : "Fully booked"}
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-2">
            {quickSlots.map((min) => {
              const { status } = checkStatus(min, segs);
              const isSel = selectedMin === min;

              const style =
                status === "blocked"
                  ? "bg-red-950/40 border-red-900/40 text-red-700/60 line-through cursor-not-allowed"
                  : status === "overflow"
                  ? "bg-orange-950/30 border-orange-800/50 text-orange-500 hover:border-orange-600 cursor-pointer active:scale-95"
                  : status === "past_close"
                  ? "opacity-20 cursor-not-allowed border-gray-800 text-gray-700"
                  : isSel
                  ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25 scale-[1.04]"
                  : "bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-800 cursor-pointer active:scale-95";

              return (
                <button
                  key={min}
                  type="button"
                  disabled={status === "blocked" || status === "past_close"}
                  onClick={() => applyMin(min)}
                  title={status !== "available" && status !== "past_close" ? (checkStatus(min, segs).msg ?? undefined) : undefined}
                  className={`py-3 sm:py-2 rounded-xl text-xs font-bold border transition-all duration-150 relative ${style}`}
                >
                  {fmtMin(min)}
                  {status === "overflow" && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-orange-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Confirmed summary ── */}
      {selectedStart && selectedEnd && (
        <div className="mt-5 bg-blue-600/10 border border-blue-600/25 rounded-xl px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-in fade-in duration-200">
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Confirmed Session</p>
            <p className="text-white font-black text-lg">
              {selectedStart.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              <span className="text-gray-500 mx-2">→</span>
              {selectedEnd.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div className="sm:text-right flex sm:flex-col items-center sm:items-end gap-3 sm:gap-0">
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest sm:mb-1">Duration</p>
            <p className="text-blue-400 font-black text-lg">3 Hours</p>
          </div>
        </div>
      )}
    </div>
  );
}