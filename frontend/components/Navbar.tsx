"use client";

import { useState, useEffect, useRef } from "react";
import { Movie } from "../types/movie";
import { movieService } from "../services/movieService";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced Search Effect
  useEffect(() => {
    // If query is empty, clear results and stop
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);

    // Set a timeout to delay the API call (Debounce: 300ms)
    const timeoutId = setTimeout(async () => {
      try {
        const results = await movieService.searchMovies(searchQuery);
        setSearchResults(results.slice(0, 5)); // Limit to top 5 results for the dropdown
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    // Cleanup function cancels the timeout if the user types again before 300ms
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      alert(`Full search page for "${searchQuery}" coming soon!`);
    }
  };

  return (
    <nav className="flex items-center justify-between px-6 md:px-10 py-5 bg-black/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-900/50">
      
      {/* Left Area: Logo & Links */}
      <div className="flex items-center gap-10">
        <div className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cinemac-blue to-purple-500 cursor-pointer hover:opacity-80 transition-opacity">
          CINEMAC
        </div>
        <div className="hidden md:flex gap-8 text-sm font-semibold text-gray-400">
          <a href="#" className="hover:text-white transition-colors">Home</a>
          <a href="#" className="text-white border-b-2 border-cinemac-blue pb-1">Movies</a>
          <a href="#" className="hover:text-white transition-colors">Games</a>
          <a href="#" className="hover:text-white transition-colors">My Library</a>
        </div>
      </div>

      {/* Right Area: Search & Auth */}
      <div className="flex items-center gap-6" ref={dropdownRef}>
        
        {/* Search Bar Container */}
        <div className="relative hidden sm:block">
          <form onSubmit={handleSearchSubmit} className="flex items-center relative">
            <input 
              type="text" 
              placeholder="Search movies..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setShowDropdown(true)}
              className="bg-gray-900/80 border border-gray-700 text-sm text-white rounded-full pl-10 pr-4 py-2 focus:outline-none focus:border-cinemac-purple focus:ring-1 focus:ring-cinemac-purple w-[200px] lg:w-[280px] transition-all placeholder-gray-500"
            />
            <svg 
              className="w-4 h-4 text-gray-400 absolute left-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </form>

          {/* Autocomplete Dropdown */}
          {showDropdown && (
            <div className="absolute top-full mt-2 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {isSearching ? (
                <div className="p-4 text-sm text-gray-400 text-center animate-pulse">Searching...</div>
              ) : searchResults.length > 0 ? (
                <ul className="py-2">
                  {searchResults.map((movie) => (
                    <li key={movie.id} className="hover:bg-gray-800 transition-colors">
                      <Link href={`/movie/${movie.id}`} className="px-4 py-2 flex items-center gap-3 w-full" onClick={() => setShowDropdown(false)}>
                        <div className="relative w-10 h-14 bg-gray-800 rounded flex-shrink-0 overflow-hidden">
                          {movie.posterUrl ? (
                             <Image 
                               src={movie.posterUrl} 
                               alt={movie.title} 
                               fill 
                               sizes="40px"
                               className="object-cover" 
                             />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-500">No Img</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{movie.title}</p>
                          {movie.imdbRating > 0 && (
                            <p className="text-xs text-yellow-500 font-bold mt-0.5">★ {movie.imdbRating.toFixed(1)}</p>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                  <li className="px-4 py-2 text-center border-t border-gray-800 mt-1">
                     <button onClick={handleSearchSubmit} className="text-xs text-cinemac-blue hover:text-white font-semibold">
                       See all results
                     </button>
                  </li>
                </ul>
              ) : (
                <div className="p-4 text-sm text-gray-400 text-center">No movies found.</div>
              )}
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-gray-700 hidden sm:block"></div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <button className="px-5 py-2 border border-transparent hover:border-gray-700 rounded-full text-sm font-medium transition-colors">
            Sign In
          </button>
          <button className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold rounded-full text-sm transition-transform hover:scale-105 shadow-lg shadow-yellow-500/20">
            Sign Up
          </button>
        </div>
      </div>
    </nav>
  );
}
