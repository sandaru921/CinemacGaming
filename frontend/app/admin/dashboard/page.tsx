"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalLocations: 0,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const headers = { Authorization: `Bearer ${token}` };

        const [bookingsRes, locationsRes] = await Promise.all([
          fetch("http://localhost:5211/api/admin/AdminBookings", { headers }),
          fetch("http://localhost:5211/api/admin/AdminLocations", { headers })
        ]);

        if (!bookingsRes.ok || !locationsRes.ok) throw new Error("Failed to load dashboard data");

        const bookingsData = await bookingsRes.json();
        const locationsData = await locationsRes.json();

        // Calculate Revenue
        const revenue = bookingsData
          .filter((b: any) => b.status === 1 || b.status === "Confirmed" || b.status === 0 || b.status === "Pending") 
          .reduce((sum: number, b: any) => sum + b.totalPrice, 0);

        setStats({
          totalBookings: bookingsData.length,
          totalRevenue: revenue,
          totalLocations: locationsData.length
        });

      } catch (err) {
        setError("Could not load stats. Are you logged in?");
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
       <h1 className="text-3xl font-black mb-8">System Dashboard</h1>

       {error && <div className="text-red-500 mb-4">{error}</div>}

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         
         <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
            <div>
              <p className="text-gray-400 font-bold mb-1">Total Revenue</p>
              <h3 className="text-3xl font-black text-green-400">Rs. {stats.totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="p-4 bg-green-500/10 text-green-500 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
         </div>

         <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
            <div>
              <p className="text-gray-400 font-bold mb-1">Total Bookings</p>
              <h3 className="text-3xl font-black text-cinemac-blue">{stats.totalBookings}</h3>
            </div>
            <div className="p-4 bg-blue-500/10 text-cinemac-blue rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
              </svg>
            </div>
         </div>

         <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
            <div>
              <p className="text-gray-400 font-bold mb-1">Locations</p>
              <h3 className="text-3xl font-black text-purple-400">{stats.totalLocations} Active</h3>
            </div>
            <div className="p-4 bg-purple-500/10 text-purple-400 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
         </div>

       </div>
    </div>
  );
}
