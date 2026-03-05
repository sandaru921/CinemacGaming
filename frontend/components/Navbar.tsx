"use client";

import { useState, useEffect, useRef } from "react";
import { Movie } from "../types/movie";
import { movieService } from "../services/movieService";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();

  const [searchPlaceholder, setSearchPlaceholder] = useState("Search movies...");
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("User");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamic Search Placeholder based on current route
    if (pathname?.startsWith("/movies") || pathname?.startsWith("/movie/")) setSearchPlaceholder("Search movies...");
    else if (pathname?.startsWith("/games")) setSearchPlaceholder("Search games...");
    else if (pathname?.startsWith("/mylibrary")) setSearchPlaceholder("Search your library...");
    else if (pathname?.startsWith("/bookings")) setSearchPlaceholder("Search bookings...");
  }, [pathname]);

  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check Auth State on mount
  useEffect(() => {
    const token = localStorage.getItem("cinemac_token");
    const storedUser = localStorage.getItem("cinemac_username");
    if (token) {
      setIsAuthenticated(true);
      if (storedUser) setUsername(storedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("cinemac_token");
    localStorage.removeItem("cinemac_role");
    localStorage.removeItem("cinemac_username");
    localStorage.removeItem("adminToken");
    setIsAuthenticated(false);
    setShowProfileDropdown(false);
  };

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
      setShowMobileMenu(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <nav className="flex items-center justify-between px-4 md:px-10 py-4 bg-black/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-900/50">
        
        {/* Left Area: Hamburger & Logo */}
        <div className="flex items-center gap-4 md:gap-10">
          <button 
            className="md:hidden text-white p-3 hover:bg-white/10 rounded-xl transition"
            onClick={() => setShowMobileMenu(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          <div className="text-xl md:text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cinemac-blue to-purple-500 cursor-pointer hover:opacity-80 transition-opacity">
            CINEMAC
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex gap-8 text-sm font-semibold text-gray-400">
            <Link 
              href="/" 
              className={(pathname === "/" || pathname === "") ? "text-white border-b-2 border-cinemac-blue pb-1" : "hover:text-white transition-colors"}
            >
              Home
            </Link>
            <Link 
              href="/movies" 
              className={pathname?.startsWith("/movie") ? "text-white border-b-2 border-cinemac-blue pb-1" : "hover:text-white transition-colors"}
            >
              Movies
            </Link>
            <Link 
              href="/games" 
              className={pathname?.startsWith("/games") ? "text-white border-b-2 border-cinemac-blue pb-1" : "hover:text-white transition-colors"}
            >
              Games
            </Link>
            <Link 
              href="/bookings" 
              className={pathname?.startsWith("/bookings") ? "text-white border-b-2 border-cinemac-blue pb-1" : "hover:text-white transition-colors"}
            >
              Bookings
            </Link>
            <Link 
              href="/mylibrary" 
              className={pathname?.startsWith("/mylibrary") ? "text-white border-b-2 border-cinemac-blue pb-1" : "hover:text-white transition-colors"}
            >
              My Library
            </Link>
          </div>
        </div>

      {/* Right Area: Search & Auth */}
      <div className="flex items-center gap-6" ref={dropdownRef}>
        
        {/* Search Bar Container */}
        <div className="relative hidden sm:block">
          <form onSubmit={handleSearchSubmit} className="flex items-center relative">
            <input 
              type="text" 
              placeholder={searchPlaceholder}
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
                      <Link href={`/movie/${movie.id}`} className="px-4 py-3 flex items-center gap-3 w-full" onClick={() => setShowDropdown(false)}>
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
                  <li className="px-4 py-3 text-center border-t border-gray-800 mt-1">
                     <button onClick={handleSearchSubmit} className="text-sm p-2 w-full text-cinemac-blue hover:text-white font-bold">
                       See all results
                     </button>
                  </li>
                </ul>
              ) : (
                <div className="p-4 text-sm text-gray-400 text-center">No results found.</div>
              )}
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-gray-700 hidden sm:block"></div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3" ref={profileRef}>
          {isAuthenticated ? (
            <div className="relative">
              <button 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 p-1.5 pl-2 pr-4 bg-gray-900 rounded-full border border-gray-700 hover:border-cinemac-blue transition-colors focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cinemac-blue to-purple-500 flex items-center justify-center text-sm font-black shadow-inner">
                  {username.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-bold text-gray-200 hidden md:block">{username}</span>
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-800">
                    <p className="text-xs text-gray-400">Signed in as</p>
                    <p className="text-sm font-bold truncate">{username}</p>
                  </div>
                  
                  <Link 
                    href="/profile"
                    onClick={() => setShowProfileDropdown(false)}
                    className="block w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white font-bold transition-colors border-b border-gray-800"
                  >
                    My Profile
                  </Link>

                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-gray-800 font-bold transition-colors flex items-center gap-2"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="px-5 py-2 border border-transparent hover:border-gray-700 rounded-full text-sm font-medium transition-colors hidden sm:block">
                Sign In
              </Link>
              <Link href="/register" className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold rounded-full text-sm transition-transform hover:scale-105 shadow-lg shadow-yellow-500/20">
                Sign Up
              </Link>
            </>
          )}
        </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col md:hidden animate-in fade-in duration-200">
          <div className="flex justify-end p-4">
            <button 
              onClick={() => setShowMobileMenu(false)}
              className="text-white p-3 hover:bg-white/10 rounded-xl transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 px-8 py-4 space-y-8 overflow-y-auto">
             
             {/* Mobile Search */}
             <div className="relative">
               <form onSubmit={(e) => { handleSearchSubmit(e); setShowMobileMenu(false); }} className="relative">
                  <input 
                    type="text" 
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-10 pr-4 py-4 focus:outline-none focus:border-cinemac-purple text-lg"
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
               </form>
               
               {/* Mobile Search Results */}
               {searchQuery.trim() && (
                <div className="mt-4 w-full bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
                  {isSearching ? (
                    <div className="p-4 text-sm text-gray-400 text-center animate-pulse">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    <ul className="py-2">
                      {searchResults.map((movie) => (
                        <li key={movie.id} className="hover:bg-gray-800 transition-colors">
                          <Link href={`/movie/${movie.id}`} className="px-4 py-3 flex items-center gap-3 w-full" onClick={() => setShowMobileMenu(false)}>
                            <div className="relative w-10 h-14 bg-gray-800 rounded flex-shrink-0 overflow-hidden">
                              {movie.posterUrl ? (
                                 <Image src={movie.posterUrl} alt={movie.title} fill sizes="40px" className="object-cover" />
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
                      <li className="px-4 py-3 text-center border-t border-gray-800 mt-1">
                         <button onClick={(e) => { handleSearchSubmit(e); setShowMobileMenu(false); }} className="text-sm p-2 w-full text-cinemac-blue hover:text-white font-bold">
                           See all results
                         </button>
                      </li>
                    </ul>
                  ) : (
                    <div className="p-4 text-sm text-gray-400 text-center">No results found.</div>
                  )}
                </div>
               )}
             </div>

             <nav className="flex flex-col gap-6 text-2xl font-bold">
                <Link href="/" onClick={() => setShowMobileMenu(false)} className={pathname === "/" ? "text-cinemac-blue" : "text-white"}>Home</Link>
                <Link href="/movies" onClick={() => setShowMobileMenu(false)} className={pathname?.startsWith("/movie") ? "text-cinemac-blue" : "text-white"}>Movies</Link>
                <Link href="/games" onClick={() => setShowMobileMenu(false)} className={pathname?.startsWith("/games") ? "text-cinemac-blue" : "text-white"}>Games</Link>
                <Link href="/bookings" onClick={() => setShowMobileMenu(false)} className={pathname?.startsWith("/bookings") ? "text-cinemac-blue" : "text-white"}>Bookings</Link>
                <Link href="/mylibrary" onClick={() => setShowMobileMenu(false)} className={pathname?.startsWith("/mylibrary") ? "text-cinemac-blue" : "text-white"}>My Library</Link>
             </nav>
             
             <div className="pt-8 border-t border-gray-800">
               {!isAuthenticated && (
                 <div className="flex flex-col gap-4">
                    <Link href="/login" onClick={() => setShowMobileMenu(false)} className="w-full text-center py-4 rounded-xl border border-gray-700 text-white font-bold">Sign In</Link>
                    <Link href="/register" onClick={() => setShowMobileMenu(false)} className="w-full text-center py-4 rounded-xl bg-cinemac-blue text-white font-bold">Sign Up</Link>
                 </div>
               )}
             </div>
          </div>
        </div>
      )}
    </>
  );
}
