"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5211/api";

export interface LibraryItem {
  id?: number; // Only present if saved in DB
  mediaId: string;
  mediaTitle: string;
  mediaType: string;
  posterUrl: string;
}

interface LibraryContextType {
  library: LibraryItem[];
  addToLibrary: (item: Omit<LibraryItem, "id">) => Promise<void>;
  removeFromLibrary: (mediaId: string, mediaType: string) => Promise<void>;
  isInLibrary: (mediaId: string, mediaType: string) => boolean;
  refreshLibrary: () => Promise<void>;
  syncGuestLibrary: () => Promise<void>;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [library, setLibrary] = useState<LibraryItem[]>([]);

  const fetchDbLibrary = async () => {
    const token = localStorage.getItem("cinemac_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/Library`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLibrary(data);
      } else if (res.status === 401) {
        // Token is invalid or missing claims - force logout
        localStorage.removeItem("cinemac_token");
        localStorage.removeItem("cinemac_role");
        localStorage.removeItem("cinemac_username");
        localStorage.removeItem("adminToken");
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to fetch library", err);
    }
  };

  const loadLocalLibrary = () => {
    const local = localStorage.getItem("guest_library");
    if (local) {
      try {
        setLibrary(JSON.parse(local));
      } catch (e) {
        console.error("Fail to parse guest library");
      }
    } else {
      setLibrary([]);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("cinemac_token");
    if (token) {
      fetchDbLibrary();
    } else {
      loadLocalLibrary();
    }
  }, []); // Run once on mount

  const refreshLibrary = async () => {
    const token = localStorage.getItem("cinemac_token");
    if (token) {
      await fetchDbLibrary();
    } else {
      loadLocalLibrary();
    }
  };

  const addToLibrary = async (item: Omit<LibraryItem, "id">) => {
    const token = localStorage.getItem("cinemac_token");
    
    // Optimistic UI update
    setLibrary(prev => {
      if (prev.some(x => x.mediaId === item.mediaId && x.mediaType === item.mediaType)) return prev;
      return [item, ...prev];
    });

    if (token) {
      try {
        await fetch(`${API_BASE_URL}/Library`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
          },
          body: JSON.stringify(item)
        });
        await fetchDbLibrary(); // refresh to get real ID
      } catch (err) {
        console.error("Failed to add to DB", err);
      }
    } else {
      // Save locally
      const local = localStorage.getItem("guest_library");
      let currentLocal: LibraryItem[] = local ? JSON.parse(local) : [];
      if (!currentLocal.some(x => x.mediaId === item.mediaId && x.mediaType === item.mediaType)) {
        currentLocal = [item, ...currentLocal];
        localStorage.setItem("guest_library", JSON.stringify(currentLocal));
      }
    }
  };

  const removeFromLibrary = async (mediaId: string, mediaType: string) => {
    const token = localStorage.getItem("cinemac_token");
    
    // Find the item to get its real ID if it exists
    const item = library.find(x => x.mediaId === mediaId && x.mediaType === mediaType);
    
    // Optimistic update
    setLibrary(prev => prev.filter(x => !(x.mediaId === mediaId && x.mediaType === mediaType)));

    if (token && item?.id) {
      try {
        await fetch(`${API_BASE_URL}/Library/${item.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error("Failed to remove from DB", err);
      }
    } else if (!token) {
      const local = localStorage.getItem("guest_library");
      if (local) {
        let currentLocal: LibraryItem[] = JSON.parse(local);
        currentLocal = currentLocal.filter(x => !(x.mediaId === mediaId && x.mediaType === mediaType));
        localStorage.setItem("guest_library", JSON.stringify(currentLocal));
      }
    }
  };

  const isInLibrary = (mediaId: string, mediaType: string) => {
    return library.some(x => x.mediaId === mediaId && x.mediaType === mediaType);
  };

  const syncGuestLibrary = async () => {
    const token = localStorage.getItem("cinemac_token");
    if (!token) return;

    const local = localStorage.getItem("guest_library");
    if (!local) return; // Nothing to sync

    try {
      const items: LibraryItem[] = JSON.parse(local);
      if (items.length > 0) {
        const res = await fetch(`${API_BASE_URL}/Library/bulk`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
          },
          body: JSON.stringify(items)
        });

        if (res.ok) {
          localStorage.removeItem("guest_library");
          await fetchDbLibrary();
        }
      }
    } catch (err) {
      console.error("Failed to sync guest library", err);
    }
  };

  return (
    <LibraryContext.Provider value={{ library, addToLibrary, removeFromLibrary, isInLibrary, refreshLibrary, syncGuestLibrary }}>
      {children}
    </LibraryContext.Provider>
  );
}

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error("useLibrary must be used within a LibraryProvider");
  }
  return context;
};
