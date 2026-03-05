"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5211/api";

type Game = {
  id: number;
  title: string;
  genre: string;
  description: string;
  posterUrl: string;
  developer: string;
  publisher: string;
  rating: number;
  youtubeTrailerKey: string;
  gameplayVideoKeys: string;
};

export default function AdminGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    genre: "",
    description: "",
    posterUrl: "",
    developer: "",
    publisher: "",
    rating: 0 as number | string,
    youtubeTrailerKey: "",
    gameplayVideoKeys: ""
  });

  const fetchGames = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE_URL}/admin/AdminGames`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGames(data);
      } else {
        setError("Failed to load games");
      }
    } catch (err) {
      setError("Error connecting to server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const openFormForAdd = () => {
    setIsEditMode(false);
    setCurrentId(null);
    setFormData({
      title: "",
      genre: "",
      description: "",
      posterUrl: "",
      developer: "",
      publisher: "",
      rating: 0 as number | string,
      youtubeTrailerKey: "",
      gameplayVideoKeys: ""
    });
    setIsModalOpen(true);
  };

  const openFormForEdit = (game: Game) => {
    setIsEditMode(true);
    setCurrentId(game.id);
    setFormData({
      title: game.title,
      genre: game.genre,
      description: game.description,
      posterUrl: game.posterUrl,
      developer: game.developer,
      publisher: game.publisher,
      rating: game.rating,
      youtubeTrailerKey: game.youtubeTrailerKey,
      gameplayVideoKeys: game.gameplayVideoKeys
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "rating" ? (value === "" ? "" : parseFloat(value)) : value
    }));
  };

  const saveGame = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      const headers = { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      };

      const payload = {
        ...formData,
        id: currentId || 0
      };

      let res;
      if (isEditMode) {
        res = await fetch(`${API_BASE_URL}/admin/AdminGames/${currentId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_BASE_URL}/admin/AdminGames`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        setIsModalOpen(false);
        fetchGames();
      } else {
        alert("Failed to save game");
      }
    } catch (err) {
      alert("Error saving game");
    }
  };

  const deleteGame = async (id: number) => {
    if (!confirm("Are you sure you want to delete this game?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE_URL}/admin/AdminGames/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchGames();
      } else {
        alert("Failed to delete game");
      }
    } catch (err) {
      alert("Error deleting game");
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">Game Management</h1>
        <button 
          onClick={openFormForAdd}
          className="bg-cinemac-blue text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-600 transition flex items-center gap-2 shadow-lg shadow-blue-500/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add New Game
        </button>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading games...</div>
        ) : games.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
             <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-500">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-.86-1.875-1.915-1.875s-1.915.84-1.915 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v.333c0 .284-.044.563-.129.828l-2.031 6.303H6.75a3.75 3.75 0 0 0-3.75 3.75v1.23a.75.75 0 0 0 .75.75h16.5a.75.75 0 0 0 .75-.75v-1.23a3.75 3.75 0 0 0-3.75-3.75h-3.009l-2.031-6.303a2.38 2.38 0 0 1-.129-.828v-.333Z" />
               </svg>
             </div>
             <p className="text-xl font-bold text-white mb-2">No Games Added Yet</p>
             <p className="text-gray-400">Click the Add New Game button to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-800 text-gray-400 text-sm">
                  <th className="p-4 rounded-tl-xl font-semibold">Game</th>
                  <th className="p-4 font-semibold">Developer</th>
                  <th className="p-4 font-semibold">Rating</th>
                  <th className="p-4 font-semibold">Media</th>
                  <th className="p-4 rounded-tr-xl font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {games.map(game => (
                  <tr key={game.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-16 bg-gray-800 rounded-md overflow-hidden relative flex-shrink-0">
                          {game.posterUrl ? (
                            <Image src={game.posterUrl} alt={game.title} fill className="object-cover" sizes="48px" />
                          ) : (
                            <span className="text-xs text-gray-500 m-auto mt-6 block text-center">No Pic</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white">{game.title}</p>
                          <p className="text-xs text-gray-400">{game.genre}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-semibold">{game.developer}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-yellow-500 font-bold bg-yellow-500/10 px-2 py-1 rounded-md text-sm whitespace-nowrap">★ {game.rating.toFixed(1)}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {game.youtubeTrailerKey && <span className="bg-red-500/20 text-red-500 text-xs px-2 py-1 rounded font-bold">Trailer</span>}
                        {game.gameplayVideoKeys && <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded font-bold">Gameplay</span>}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openFormForEdit(game)}
                          className="p-2 text-cinemac-blue hover:bg-blue-500/20 rounded-lg transition"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => deleteGame(game.id)}
                          className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Game Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex justify-between items-center z-10">
              <h2 className="text-2xl font-black">{isEditMode ? "Edit Game" : "Add New Game"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={saveGame} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-300 border-b border-gray-800 pb-2">Basic Information</h3>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-1">Title *</label>
                    <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-cinemac-blue transition" placeholder="e.g. Elden Ring" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-400 mb-1">Genre</label>
                      <input type="text" name="genre" value={formData.genre} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-cinemac-blue transition" placeholder="Action RPG" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-400 mb-1">Rating (out of 10)</label>
                      <input type="number" step="0.1" name="rating" value={formData.rating === "" ? "" : formData.rating} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-cinemac-blue transition" placeholder="9.5" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-1">Description</label>
                    <textarea rows={4} name="description" value={formData.description} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-cinemac-blue transition" placeholder="Game synopsis..."></textarea>
                  </div>
                </div>

                {/* Media & Dev Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-300 border-b border-gray-800 pb-2">Media & Credits</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-400 mb-1">Developer</label>
                      <input type="text" name="developer" value={formData.developer} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-cinemac-blue transition" placeholder="FromSoftware" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-400 mb-1">Publisher</label>
                      <input type="text" name="publisher" value={formData.publisher} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-cinemac-blue transition" placeholder="Bandai Namco" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-1">Poster Image URL</label>
                    <input type="text" name="posterUrl" value={formData.posterUrl} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-cinemac-blue transition" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-1">Main Trailer (YouTube ID)</label>
                    <input type="text" name="youtubeTrailerKey" value={formData.youtubeTrailerKey} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-cinemac-blue transition" placeholder="e.g. dQw4w9WgXcQ" />
                    <p className="text-xs text-gray-500 mt-1">Found in the youtube link: v=<strong>ID_HERE</strong></p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-1">Gameplay Videos (YouTube IDs)</label>
                    <input type="text" name="gameplayVideoKeys" value={formData.gameplayVideoKeys} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-cinemac-blue transition" placeholder="id1, id2, id3" />
                    <p className="text-xs text-gray-500 mt-1">Comma-separated list of youtube video IDs</p>
                  </div>
                </div>

              </div>

              <div className="pt-6 border-t border-gray-800 flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-bold bg-gray-800 hover:bg-gray-700 transition">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-3 rounded-xl font-bold bg-cinemac-blue text-white hover:bg-blue-600 transition shadow-lg shadow-blue-500/20">
                  {isEditMode ? "Save Changes" : "Create Game"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
