"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BookingCard from "../../components/booking/BookingCard";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5211/api";

function getStatusColor(status: number): string {
  switch (status) {
    case 0: return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
    case 1: return "bg-green-500/20 text-green-500 border-green-500/50";
    case 2: return "bg-red-500/20 text-red-500 border-red-500/50";
    case 3: return "bg-blue-500/20 text-blue-500 border-blue-500/50";
    default: return "bg-gray-500/20 text-gray-400 border-gray-500/50";
  }
}

function getStatusText(status: number): string {
  switch (status) {
    case 0: return "Pending";
    case 1: return "Confirmed";
    case 2: return "Cancelled";
    case 3: return "Completed";
    default: return "Unknown";
  }
}

export default function ProfilePage() {
  const router = useRouter();
  const [username, setUsername] = useState("User");
  const [email, setEmail] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("cinemac_token");
    const storedUsername = localStorage.getItem("cinemac_username");
    if (!token) {
      router.push("/login");
      return;
    }
    if (storedUsername) {
      setUsername(storedUsername);
      setEmail(`${storedUsername.toLowerCase().replace(" ", "")}@cinemac.com`);
    }
  }, [router]);

  useEffect(() => {
    if (!email) return;
    async function fetchBookings() {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/bookings/mybookings?email=${encodeURIComponent(email)}`);
        if (res.ok) {
          const data = await res.json();
          setBookings(data);
        }
      } catch (err) {
        console.error("Failed to fetch bookings", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBookings();
  }, [email]);

  // Auto-dismiss cancelled bookings after 2 minutes
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    bookings.forEach((booking) => {
      if (booking.status === 2) {
        // Find when this booking was last in the list — schedule removal after 2 minutes
        const timer = setTimeout(() => {
          setBookings((prev) => prev.filter((b) => b.id !== booking.id));
          setSelectedBooking((prev: any) => prev?.id === booking.id ? null : prev);
        }, 2 * 60 * 1000);
        timers.push(timer);
      }
    });
    return () => timers.forEach(clearTimeout);
  }, [bookings]);

  const handleLogout = () => {
    localStorage.removeItem("cinemac_token");
    localStorage.removeItem("cinemac_role");
    localStorage.removeItem("cinemac_username");
    localStorage.removeItem("adminToken");
    router.push("/");
  };

  const cancelBooking = async (bookingId: string) => {
    setIsCancelling(true);
    setShowCancelConfirm(false);
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
        method: "PUT",
      });
      if (res.ok) {
        setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: 2 } : b));
        setSelectedBooking((prev: any) => prev ? { ...prev, status: 2 } : prev);
      } else {
        alert("Failed to cancel booking.");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred while cancelling.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col pb-20">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-10 pt-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">

          {/* Sidebar */}
          <div className="w-full md:w-1/3 lg:w-1/4 bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl sticky top-24">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cinemac-blue to-purple-600 flex items-center justify-center text-4xl font-black shadow-lg shadow-purple-500/20 mb-4">
                {username.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-bold">{username}</h2>
              <p className="text-gray-400 text-sm mb-6">{email}</p>
              <button
                onClick={handleLogout}
                className="w-full py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-xl transition-colors border border-red-500/20"
              >
                Log Out
              </button>
            </div>
          </div>

          {/* Bookings List */}
          <div className="w-full md:w-2/3 lg:w-3/4">
            <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
              <h1 className="text-3xl font-black">My Bookings</h1>
              <Link href="/bookings" className="text-sm font-bold text-cinemac-blue hover:text-blue-400">
                + New Booking
              </Link>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-cinemac-blue border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">No bookings yet</h3>
                <p className="text-gray-400 mb-6">You haven&apos;t made any room reservations yet.</p>
                <Link
                  href="/bookings"
                  className="inline-block bg-cinemac-blue text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors"
                >
                  Book a Room Now
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {bookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onClick={setSelectedBooking}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Booking Detail Popup */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            <button
              onClick={() => { setSelectedBooking(null); setShowCancelConfirm(false); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-full p-2 transition-colors z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-8">
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-4 border ${getStatusColor(selectedBooking.status)}`}>
                {getStatusText(selectedBooking.status)}
              </div>
              <h2 className="text-2xl font-black mb-1">{selectedBooking.room?.location?.name}</h2>
              <p className="text-cinemac-blue font-bold text-lg mb-6">{selectedBooking.room?.name}</p>

              <div className="space-y-3 bg-black/50 rounded-2xl p-6 border border-gray-800 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Date</span>
                  <span className="font-bold">{new Date(selectedBooking.startTime).toDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Time</span>
                  <span className="font-bold text-cinemac-blue">
                    {new Date(selectedBooking.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –{" "}
                    {new Date(selectedBooking.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-800 pt-3">
                  <span className="text-gray-400 text-sm">Total Price</span>
                  <span className="font-black text-xl text-green-400">Rs. {selectedBooking.totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {selectedBooking.playedMediaTitle && (
                <div className="mb-6">
                  <p className="text-gray-400 text-xs font-bold uppercase mb-2">Selected Media</p>
                  <div className="flex items-center gap-3 bg-purple-900/10 border border-purple-500/20 p-4 rounded-2xl">
                    <div className="w-10 h-10 rounded bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-white">{selectedBooking.playedMediaTitle}</p>
                      <p className="text-xs text-gray-400 uppercase font-semibold">{selectedBooking.playedMediaType}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                {selectedBooking.status !== 2 && new Date(selectedBooking.startTime) > new Date() && (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    disabled={isCancelling}
                    className={`flex-1 py-4 rounded-xl font-bold transition-all border ${
                      isCancelling
                        ? "bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed"
                        : "bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500 hover:text-white"
                    }`}
                  >
                    {isCancelling ? "Cancelling..." : "Cancel Booking"}
                  </button>
                )}
                <button
                  onClick={() => { setSelectedBooking(null); setShowCancelConfirm(false); }}
                  className="flex-1 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>

              {/* Cancel Confirmation Dialog */}
              {showCancelConfirm && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-3xl z-10 animate-in fade-in duration-200">
                  <div className="bg-gray-900 border border-red-500/30 rounded-2xl p-6 mx-4 text-center shadow-2xl">
                    <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7 text-red-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-black mb-1">Cancel Booking?</h3>
                    <p className="text-gray-400 text-sm mb-6">This action cannot be undone. The time slot will be freed up for others.</p>
                    <div className="flex gap-3">
                      <button onClick={() => setShowCancelConfirm(false)} className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors">
                        Keep It
                      </button>
                      <button onClick={() => cancelBooking(selectedBooking.id)} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors">
                        Yes, Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
