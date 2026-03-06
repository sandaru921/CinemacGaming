"use client";

import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5211/api";

export default function AdminLocations() {
  const [locations, setLocations] = useState<any[]>([]);
  const [newLocName, setNewLocName] = useState("");
  const [newMapUrl, setNewMapUrl] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);


  const fetchLocations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/AdminLocations`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
      });
      if (res.ok) setLocations(await res.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchLocations(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName) return;

    // Create location with name and Google Map URL
    const res = await fetch(`${API_BASE_URL}/admin/AdminLocations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`
      },
      body: JSON.stringify({ name: newLocName, googleMapUrl: newMapUrl })
    });
    const createdLocation = await res.json();

    // Upload image if selected
    if (newImageFile && createdLocation?.id) {
      const form = new FormData();
      form.append("file", newImageFile);
      await fetch(`${API_BASE_URL}/admin/AdminLocations/${createdLocation.id}/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
        body: form
      });
    }

    // Reset fields
    setNewLocName("");
    setNewMapUrl("");
    setNewImageFile(null);
    fetchLocations();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This deletes all associated rooms and bookings.")) return;

    await fetch(`${API_BASE_URL}/admin/AdminLocations/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
    });
    fetchLocations();
  };

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-black mb-8">Manage Locations</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create Form */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 h-fit">
          <h3 className="text-xl font-bold mb-4">Add New Location</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-400">Location Name</label>
              <input 
                value={newLocName} 
                onChange={e => setNewLocName(e.target.value)} 
                className="w-full mt-2 bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-cinemac-blue outline-none" 
                placeholder="e.g. Galle Branch" 
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-400">Google Map URL</label>
              <input 
                value={newMapUrl} 
                onChange={e => setNewMapUrl(e.target.value)} 
                className="w-full mt-2 bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-cinemac-blue outline-none"
                placeholder="https://maps.google.com/..."
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-400">Location Image</label>
              <input 
                type="file"
                accept="image/*"
                onChange={e => setNewImageFile(e.target.files?.[0] || null)}
                className="w-full mt-2 text-white"
              />
            </div>
            <button type="submit" className="w-full bg-cinemac-blue text-white font-bold py-3 rounded-xl hover:bg-blue-600">Create</button>
          </form>
        </div>

        {/* Existing Locations */}
        <div className="lg:col-span-2 space-y-4">
          {locations.map(loc => (
            <div key={loc.id} className="bg-gray-900 border border-gray-800 p-5 rounded-2xl flex items-center justify-between">
               <div className="flex items-center gap-4">
                  {loc.imageUrl && (
                    <img src={loc.imageUrl} alt={loc.name} className="w-12 h-12 object-cover rounded" />
                  )}
                  <div>
                    <h4 className="text-xl font-bold">{loc.name}</h4>
                    <p className="text-sm text-gray-500">{loc.id}</p>
                    {loc.googleMapUrl && (
                      <a href={loc.googleMapUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-cinemac-blue mt-1 block">View on Map</a>
                    )}
                    <p className="text-xs text-cinemac-blue mt-1">{loc.rooms?.length || 0} Rooms defined</p>
                  </div>
               </div>
               <button 
                 onClick={() => handleDelete(loc.id)}
                 className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition"
               >
                 Delete
               </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
