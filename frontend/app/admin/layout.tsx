"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "../../components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const role = localStorage.getItem("cinemac_role");
    
    if (role !== "Admin") {
      router.replace("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router, pathname]);

  // Prevent flash of protected content before redirect
  if (isAuthenticated === null) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Admin...</div>;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row text-white font-sans">
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 bg-black overflow-y-auto w-full relative">
        {/* Dynamic Page Content */}
        <div className="p-4 sm:p-8">
           {children}
        </div>
      </main>
    </div>
  );
}
