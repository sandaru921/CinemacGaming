"use client";

import { useEffect, useState } from "react";

type AnalyticsData = {
  totalRevenue: number;
  totalBookings: number;
  mostVisitedLocation: string;
  rushHours: { hour: number; count: number }[];
  popularRooms: { roomName: string; bookingsCount: number }[];
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<AnalyticsData | null>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [error, setError] = useState("");
  
  const [filterLocation, setFilterLocation] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  // Fetch locations for filter dropdown
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch("http://localhost:5211/api/admin/AdminLocations", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setLocations(data);
        }
      } catch (err) {
        console.error("Failed to load locations", err);
      }
    };
    fetchLocations();
  }, []);

  // Fetch Analytics based on filters
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const headers = { Authorization: `Bearer ${token}` };

        const queryParams = new URLSearchParams();
        if (filterLocation) queryParams.append("locationId", filterLocation);
        if (filterStartDate) queryParams.append("startDate", filterStartDate);
        if (filterEndDate) queryParams.append("endDate", filterEndDate);

        const res = await fetch(`http://localhost:5211/api/admin/AdminAnalytics?${queryParams.toString()}`, { headers });

        if (!res.ok) throw new Error("Failed to load dashboard data");

        const data = await res.json();
        setStats(data);
        setError("");

      } catch (err) {
        setError("Could not load stats. Are you logged in?");
      }
    };

    fetchStats();
  }, [filterLocation, filterStartDate, filterEndDate]);

  // Max bookings for computing bar height
  const maxRushHourCount = stats?.rushHours?.reduce((max, r) => Math.max(max, r.count), 0) || 1;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
         <h1 className="text-3xl font-black">System Dashboard</h1>
         
         {/* Filters */}
         <div className="flex flex-wrap gap-4 bg-gray-900 p-4 rounded-xl border border-gray-800">
           <div className="flex flex-col">
             <label className="text-xs text-gray-400 font-bold mb-1">Start Date</label>
             <input type="date" className="bg-gray-800 border border-gray-700 text-white p-2 rounded-lg text-sm" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} />
           </div>
           <div className="flex flex-col">
             <label className="text-xs text-gray-400 font-bold mb-1">End Date</label>
             <input type="date" className="bg-gray-800 border border-gray-700 text-white p-2 rounded-lg text-sm" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} />
           </div>
           <div className="flex flex-col">
             <label className="text-xs text-gray-400 font-bold mb-1">Location</label>
             <select className="bg-gray-800 border border-gray-700 text-white p-2 rounded-lg text-sm" value={filterLocation} onChange={e => setFilterLocation(e.target.value)}>
               <option value="">All Locations</option>
               {locations.map(l => (
                 <option key={l.id} value={l.id}>{l.name}</option>
               ))}
             </select>
           </div>
         </div>
       </div>

       {error && <div className="text-red-500 mb-4">{error}</div>}

       {!stats ? (
         <div className="text-gray-400">Loading metrics...</div>
       ) : (
         <>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             
             {/* Total Revenue */}
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

             {/* Total Bookings */}
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

             {/* Most Visited Location */}
             <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-gray-400 font-bold mb-1">Top Location</p>
                  <h3 className="text-2xl font-black text-purple-400 truncate max-w-[150px]">{stats.mostVisitedLocation}</h3>
                </div>
                <div className="p-4 bg-purple-500/10 text-purple-400 rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
             </div>

           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* Rush Hours Bar Chart */}
             <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl">
               <h3 className="text-xl font-bold mb-6">Rush Hours</h3>
               {stats.rushHours.length === 0 ? (
                 <p className="text-gray-400">No data available.</p>
               ) : (
                 <div className="flex items-end space-x-2 h-64 mt-4">
                   {stats.rushHours.map(rh => (
                     <div key={rh.hour} className="flex flex-col items-center flex-1 group">
                       <span className="text-xs text-gray-500 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">{rh.count}</span>
                       <div 
                         className="w-full bg-cinemac-blue/80 group-hover:bg-cinemac-blue rounded-t-sm transition-all duration-300"
                         style={{ height: `${Math.max(10, (rh.count / maxRushHourCount) * 100)}%` }}
                       ></div>
                       <span className="text-xs text-gray-500 mt-2">{rh.hour}:00</span>
                     </div>
                   ))}
                 </div>
               )}
             </div>

             {/* Popular Rooms */}
             <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl">
               <h3 className="text-xl font-bold mb-6">Popular Rooms</h3>
               {stats.popularRooms.length === 0 ? (
                 <p className="text-gray-400">No data available.</p>
               ) : (
                 <ul className="space-y-4">
                   {stats.popularRooms.map((pr, idx) => (
                     <li key={idx} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                       <div className="flex items-center space-x-4">
                         <div className="w-10 h-10 rounded-full bg-cinemac-red/20 text-cinemac-red flex items-center justify-center font-bold">
                           #{idx + 1}
                         </div>
                         <span className="font-bold text-white text-lg">{pr.roomName}</span>
                       </div>
                       <div className="text-gray-400 font-bold">
                         {pr.bookingsCount} <span className="font-normal text-sm">Bookings</span>
                       </div>
                     </li>
                   ))}
                 </ul>
               )}
             </div>
           </div>
         </>
       )}
    </div>
  );
}
