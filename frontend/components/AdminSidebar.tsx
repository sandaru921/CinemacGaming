"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("cinemac_token");
    localStorage.removeItem("cinemac_role");
    localStorage.removeItem("cinemac_username");
    router.push("/login");
  };

  const links = [
    { 
      name: "Dashboard", 
      path: "/admin/dashboard", 
      icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" 
    },
    { 
      name: "Locations", 
      path: "/admin/locations", 
      icon: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" 
    },
    { 
      name: "Rooms", 
      path: "/admin/rooms", 
      icon: "M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7" 
    },
    { 
      name: "All Bookings", 
      path: "/admin/bookings", 
      icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" 
    },
    { 
      name: "Live Excel Grid", 
      path: "/admin/live-grid", 
      icon: "M3.75 3v15a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25V3m-19.5 0h19.5" 
    },
    { 
      name: "Games", 
      path: "/admin/games", 
      icon: "M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-.86-1.875-1.915-1.875s-1.915.84-1.915 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v.333c0 .284-.044.563-.129.828l-2.031 6.303H6.75a3.75 3.75 0 0 0-3.75 3.75v1.23a.75.75 0 0 0 .75.75h16.5a.75.75 0 0 0 .75-.75v-1.23a3.75 3.75 0 0 0-3.75-3.75h-3.009l-2.031-6.303a2.38 2.38 0 0 1-.129-.828v-.333Z" 
    }
  ];

  return (
    <>
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col hidden md:flex h-full">
        <div className="h-20 flex items-center px-8 border-b border-gray-800">
          <Link href="/" className="text-xl font-black text-white hover:text-cinemac-blue transition">
            CINEMAC<span className="text-cinemac-blue">ADMIN</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {links.map(link => {
            const isActive = pathname.startsWith(link.path);
            return (
              <Link 
                key={link.name} 
                href={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                  isActive 
                    ? 'bg-cinemac-blue text-white shadow-lg shadow-blue-500/20' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
                </svg>
                {link.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden h-16 border-b border-gray-800 flex items-center px-4 bg-gray-900 justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowMobileSidebar(true)}
            className="p-3 -ml-2 text-white hover:bg-white/10 rounded-xl transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <span className="font-black text-lg text-white">CINEMAC<span className="text-cinemac-blue">ADMIN</span></span>
        </div>
        
        <button onClick={handleLogout} className="text-xs font-bold text-red-500 bg-red-500/10 px-3 py-1.5 rounded-lg">
          Log Out
        </button>
      </header>

      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex md:hidden animate-in fade-in duration-200">
          <aside className="w-64 bg-gray-900 h-full border-r border-gray-800 flex flex-col animate-in slide-in-from-left duration-300">
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
              <span className="font-black text-lg text-white">Menu</span>
              <button 
                onClick={() => setShowMobileSidebar(false)} 
                className="p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
              {links.map(link => {
                const isActive = pathname.startsWith(link.path);
                return (
                  <Link 
                    key={link.name} 
                    href={link.path}
                    onClick={() => setShowMobileSidebar(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm rounded-xl font-bold transition-all ${
                      isActive 
                        ? 'bg-cinemac-blue text-white shadow-lg shadow-blue-500/20' 
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
                    </svg>
                    {link.name}
                  </Link>
                )
              })}
            </nav>
          </aside>
          <div className="flex-1" onClick={() => setShowMobileSidebar(false)}></div>
        </div>
      )}
    </>
  );
}