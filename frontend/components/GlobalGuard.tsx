"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function GlobalGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // We only want to execute on the client side
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("cinemac_role");
      const isAdmin = role === "Admin";

      // Allow admins to view the login and register pages, or force them out?
      // Actually, if they are logged in as admin, they shouldn't see ANY public page.
      // If we want to allow them to "Logout", they can use the Admin Dashboard.
      
      // If Admin tries to access a non-admin route, redirect to dashboard immediately.
      if (isAdmin && !pathname?.startsWith("/admin")) {
        router.replace("/admin/dashboard");
      }
      
      // Also prevent logged-in admins from accessing /login and /register
      if (isAdmin && (pathname === "/login" || pathname === "/register")) {
        router.replace("/admin/dashboard");
      }
    }
  }, [pathname, router]);

  return null;
}
