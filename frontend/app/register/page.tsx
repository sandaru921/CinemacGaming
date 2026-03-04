"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5211/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2000);
      } else {
        const msg = await res.text();
        setError(msg || "Registration failed. Please try a different username.");
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
            <h1 className="text-3xl font-black tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cinemac-blue to-purple-500">
                Join Cinemac
              </span>
            </h1>
            <p className="text-gray-400 mt-2 text-sm">Create an account to book gaming rooms.</p>
          </div>

          {success && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-500 py-3 px-4 rounded-xl mb-6 text-sm text-center font-bold">
              Account created successfully! Redirecting to login...
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 py-3 px-4 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Username</label>
              <input 
                required 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cinemac-blue transition-colors"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Email</label>
              <input 
                required 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cinemac-blue transition-colors"
                placeholder="you@example.com"
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
              disabled={loading || success}
              type="submit" 
              className={`w-full py-3 mt-4 rounded-xl font-bold transition-all
                ${(loading || success) ? 'bg-gray-700 text-gray-400' : 'bg-cinemac-blue hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30'}`}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
             Already have an account? <Link href="/login" className="text-cinemac-blue hover:underline font-bold">Sign In</Link>
          </div>

        </div>
      </main>
    </div>
  );
}
