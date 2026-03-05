"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import { useLibrary } from "../../contexts/LibraryContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5211/api";

export default function Login() {
  const { syncGuestLibrary } = useLibrary();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        const data = await res.json();
        
        // Save auth data
        localStorage.setItem("cinemac_token", data.token);
        localStorage.setItem("cinemac_role", data.role);
        localStorage.setItem("cinemac_username", data.username);
        
        // Sync any offline library items
        await syncGuestLibrary();

        // Check for redirect hint
        const redirectUrl = sessionStorage.getItem("cinemac_redirect");
        if (redirectUrl) {
          sessionStorage.removeItem("cinemac_redirect");
          router.push(redirectUrl);
          return;
        }

        // Conditional Redirect
        if (data.role === "Admin") {
           // Provide fallback admin token so existing code doesn't break
           localStorage.setItem("adminToken", data.token); 
           router.push("/admin/dashboard");
        } else {
           router.push("/");
        }

      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("Network error connecting to API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-900 border border-gray-800 p-8 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white tracking-tight">Welcome Back</h1>
            <p className="text-gray-400 mt-2 text-sm">Sign in to your Cinemac account.</p>
          </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 py-3 px-4 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">Username</label>
            <input 
              required 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cinemac-blue transition-colors"
              placeholder="e.g. admin"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">Password</label>
            <input 
              required 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cinemac-blue transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className={`w-full py-3 mt-4 rounded-xl font-bold transition-all
              ${loading ? 'bg-gray-700 text-gray-400' : 'bg-cinemac-blue hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30'}`}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
           Don't have an account? <Link href="/register" className="text-cinemac-blue hover:underline font-bold">Sign Up</Link>
        </div>
      </div>
     </main>
    </div>
  );
}
