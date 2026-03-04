"use client";

import { useEffect, useState } from "react";

export default function AdminRooms() {
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocId, setSelectedLocId] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomPrice, setNewRoomPrice] = useState("1000");

  const [loading, setLoading] = useState(true);

  const fetchLocationsAndRooms = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5211/api/admin/AdminLocations", {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
      });
      if (res.ok) {
         const data = await res.json();
         setLocations(data);
         if (data.length > 0 && !selectedLocId) setSelectedLocId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLocationsAndRooms(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocId || !newRoomName || !newRoomPrice) return;

    await fetch("http://localhost:5211/api/admin/AdminRooms", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("adminToken")}` 
      },
      body: JSON.stringify({ locationId: selectedLocId, name: newRoomName, basePricePerHour: parseFloat(newRoomPrice) })
    });
    setNewRoomName("");
    setNewRoomPrice("1000");
    fetchLocationsAndRooms();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this room? Bookings for it will be lost.")) return;

    await fetch(`http://localhost:5211/api/admin/AdminRooms/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
    });
    fetchLocationsAndRooms();
  };

  const selectedLocation = locations.find(l => l.id === selectedLocId);

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-black mb-8">Manage Rooms</h1>

      {loading ? (
        <div className="text-gray-500">Loading locations...</div>
      ) : locations.length === 0 ? (
        <div className="text-red-500">No locations found. Create a location first.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Create Form */}
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 h-fit space-y-6">
            <div>
               <h3 className="text-xl font-bold mb-4">Location Focus</h3>
               <select 
                 value={selectedLocId} 
                 onChange={e => setSelectedLocId(e.target.value)}
                 className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white outline-none"
               >
                 {locations.map(loc => (
                   <option key={loc.id} value={loc.id}>{loc.name}</option>
                 ))}
               </select>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <h3 className="text-xl font-bold mb-4">Add Room to {selectedLocation?.name}</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-400">Room Name</label>
                  <input required value={newRoomName} onChange={e => setNewRoomName(e.target.value)} className="w-full mt-2 bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-cinemac-blue outline-none" placeholder="e.g. VIP Gaming Room" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-400">Base Price (Per Hour)</label>
                  <input required type="number" min="0" step="100" value={newRoomPrice} onChange={e => setNewRoomPrice(e.target.value)} className="w-full mt-2 bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-cinemac-blue outline-none" placeholder="1000" />
                </div>
                <button type="submit" className="w-full bg-cinemac-blue text-white font-bold py-3 rounded-xl hover:bg-blue-600">Create Room</button>
              </form>
            </div>
          </div>

          {/* Existing Rooms */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-gray-400 mb-2">Rooms in {selectedLocation?.name} ({selectedLocation?.rooms?.length || 0})</h3>
            {selectedLocation?.rooms?.map((room: any) => (
              <div key={room.id} className="bg-gray-900 border border-gray-800 p-5 rounded-2xl flex items-center justify-between">
                 <div>
                    <h4 className="text-xl font-bold flex items-center gap-2">
                      {room.name}
                      {room.name.toLowerCase().includes('vip') && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full uppercase font-black">Premium</span>}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">ID: {room.id}</p>
                    <p className="text-sm text-green-400 font-bold mt-2">Rs. {room.basePricePerHour} / hour</p>
                 </div>
                 <button 
                   onClick={() => handleDelete(room.id)}
                   className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition"
                 >
                   Delete
                 </button>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
