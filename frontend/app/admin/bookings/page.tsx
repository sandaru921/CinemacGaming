"use client";

import { useEffect, useState } from "react";

export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Status Enum Map: 0 = Pending, 1 = Confirmed, 2 = Cancelled

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5211/api/admin/AdminBookings", {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
      });
      if (res.ok) {
         setBookings(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleStatusChange = async (id: string, newStatusStr: string) => {
    const statusMap: Record<string, number> = { "Pending": 0, "Confirmed": 1, "Cancelled": 2 };
    const statusInt = statusMap[newStatusStr];

    if (statusInt === undefined) return;

    if (newStatusStr === "Cancelled") {
      if (!confirm("Cancelling this will free up the time slot. Confirm?")) return;
    }

    try {
      await fetch(`http://localhost:5211/api/admin/AdminBookings/${id}/status`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}` 
        },
        body: JSON.stringify({ status: statusInt })
      });
      fetchBookings();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this transaction record?")) return;

    await fetch(`http://localhost:5211/api/admin/AdminBookings/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
    });
    fetchBookings();
  };

  if (loading) return <div className="text-white">Loading bookings...</div>;

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <h1 className="text-3xl font-black mb-2">Transaction & Security Desk</h1>
      <p className="text-gray-400 mb-8">Override time slots, double-bookings, and track revenue payments.</p>

      {bookings.length === 0 ? (
        <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 text-center text-gray-500">
           No transactions recorded yet.
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-black/50 border-b border-gray-800">
                 <tr>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Location & Room</th>
                    <th className="px-6 py-4">Slot Time</th>
                    <th className="px-6 py-4">Revenue</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                 </tr>
              </thead>
              <tbody>
                 {bookings.map((b) => {
                   const start = new Date(b.startTime);
                   const end = new Date(b.endTime);
                   const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

                   // Parse numerical enum sent from backend
                   let currentStatus = "Unknown";
                   if (b.status === 0) currentStatus = "Pending";
                   if (b.status === 1) currentStatus = "Confirmed";
                   if (b.status === 2) currentStatus = "Cancelled";

                   return (
                     <tr key={b.id} className={`border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${currentStatus === 'Cancelled' ? 'opacity-50' : ''}`}>
                       <td className="px-6 py-4">
                         <div className="font-bold text-white">{b.customerName}</div>
                         <div className="text-xs text-gray-500">{b.customerEmail}</div>
                       </td>
                       <td className="px-6 py-4">
                         <div className="font-semibold">{b.roomName}</div>
                         <div className="text-xs text-cinemac-blue">{b.locationName}</div>
                       </td>
                       <td className="px-6 py-4">
                         <div className="text-white whitespace-nowrap">{start.toLocaleDateString()}</div>
                         <div className="text-xs font-mono mt-1 text-gray-400">
                           {start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </div>
                         <div className="text-[10px] bg-gray-800 px-2 py-0.5 rounded-full inline-block mt-1">
                           {duration}h Duration
                         </div>
                       </td>
                       <td className="px-6 py-4 font-black text-green-400">
                         Rs. {b.totalPrice.toLocaleString()}
                       </td>
                       <td className="px-6 py-4 text-center">
                         <select 
                           value={currentStatus}
                           onChange={(e) => handleStatusChange(b.id, e.target.value)}
                           className={`text-xs font-bold py-1 px-3 rounded-full border outline-none cursor-pointer appearance-none text-center
                             ${currentStatus === 'Confirmed' ? 'bg-green-500/10 border-green-500/50 text-green-500' : 
                               currentStatus === 'Cancelled' ? 'bg-red-500/10 border-red-500/50 text-red-500' : 
                               'bg-yellow-500/10 border-yellow-500/50 text-yellow-500'}`}
                         >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Cancelled">Cancelled</option>
                         </select>
                       </td>
                       <td className="px-6 py-4 text-right">
                         <button 
                           onClick={() => handleDelete(b.id)}
                           className="text-red-500 hover:text-red-400 font-bold text-xs bg-red-500/10 px-3 py-1.5 rounded-lg"
                         >
                           WIPE
                         </button>
                       </td>
                     </tr>
                   );
                 })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
