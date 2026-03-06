"use client";

import Link from "next/link";
import Navbar from "../components/Navbar";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/* ─── Animated Particle Canvas ─── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const NUM = 80;
    const particles = Array.from({ length: NUM }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.6 + 0.1,
      color: Math.random() > 0.5 ? "59,130,246" : "168,85,247",
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
        ctx.fill();
      });

      // Draw subtle connection lines
      for (let i = 0; i < NUM; i++) {
        for (let j = i + 1; j < NUM; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(120,100,255,${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}

/* ─── Scrolling Film Strip ─── */
const FILM_ITEMS = [
  { label: "Action", emoji: "💥" },
  { label: "Sci-Fi", emoji: "🚀" },
  { label: "Horror", emoji: "👻" },
  { label: "RPG", emoji: "⚔️" },
  { label: "Drama", emoji: "🎭" },
  { label: "FPS", emoji: "🎯" },
  { label: "Comedy", emoji: "😂" },
  { label: "Racing", emoji: "🏎️" },
  { label: "Thriller", emoji: "🔪" },
  { label: "Sports", emoji: "⚽" },
];
const DOUBLED = [...FILM_ITEMS, ...FILM_ITEMS];

function FilmStrip() {
  return (
    <div className="relative w-full overflow-hidden py-4 border-y border-white/5">
      {/* gradient masks */}
      <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
      <div className="flex animate-scroll-left gap-0">
        {DOUBLED.map((item, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-36 h-20 flex flex-col items-center justify-center gap-1 border-x border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition-colors"
          >
            <span className="text-2xl">{item.emoji}</span>
            <span className="text-xs uppercase tracking-widest font-bold text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Glowing Feature Card ─── */
function FeatureCard({
  icon, title, desc, gradient, delay,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  gradient: string;
  delay: string;
}) {
  return (
    <div
      className="group relative p-8 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:border-white/20 transition-all duration-500 overflow-hidden"
      style={{ animationDelay: delay }}
    >
      {/* hover glow */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 ${gradient} blur-2xl`} />
      
      <div className={`w-14 h-14 rounded-2xl ${gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-xl font-black text-white mb-3">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

/* ─── Counter animation ─── */
function StatCounter({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const step = target / 60;
          const timer = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(start));
          }, 16);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cinemac-blue to-purple-500 mb-2">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-gray-500 uppercase tracking-widest font-semibold">{label}</div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function LandingPage() {
  const router = useRouter();
 const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const handleEnded = () => {
      setTimeout(() => {
        vid.play();
      }, 3000);
    };
    vid.addEventListener('ended', handleEnded);
    return () => {
      vid.removeEventListener('ended', handleEnded);
    };
  }, []);


  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden flex flex-col">
      <Navbar />

      {/* ── HERO ── */}
      <main className="relative flex flex-col items-center justify-center text-center px-6 min-h-screen">
        {/* Video background */}
        <video
          ref={videoRef}
          src="https://res.cloudinary.com/ddyrfscxm/video/upload/q_auto,f_auto/v1772776004/cinemac_banner_2_wadyx5.mov"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Tint overlay */}
        <div className="absolute inset-0 bg-black/40" />
        <ParticleCanvas />

        {/* Deep glow blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[700px] h-[700px] bg-blue-600/8 rounded-full blur-[160px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm font-semibold text-gray-300 backdrop-blur-md animate-fade-in-up">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
            </span>
            Now Open — Book Your Room Today
          </div>

          {/* Headline */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.95] animate-fade-in-up" style={{ textShadow: '0 0 8px rgba(0,0,0,0.8)' }}>
            <span className="block text-white/90">Cinema</span>
         <span className="block text-white/70 bg-clip-text bg-gradient-to-r from-cyan-200 via-blue-300 to-indigo-200 drop-shadow-[0_0_15px_rgba(165,243,252,0.6)]">
  Gaming
</span>
            <span className="block text-white/50">Reimagined</span>
          </h1>

          {/* Subheadline */}
          <p className="max-w-xl mx-auto text-lg md:text-xl text-gray-100 leading-relaxed animate-fade-in-up" style={{ textShadow: '0 0 8px rgba(0,0,0,0.8)' }}>
            Private gaming rooms. Blockbuster screenings. One experience built for those who demand the best.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in-up">
            <button
              onClick={() => router.push("/bookings")}
              className="relative group px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-extrabold rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(99,102,241,0.5)] hover:shadow-[0_0_60px_rgba(99,102,241,0.7)] hover:scale-105 transition-all duration-300 w-full sm:w-auto"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity" />
              <span className="relative flex items-center justify-center gap-2 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-.53 14.03a.75.75 0 001.06 0l3-3a.75.75 0 10-1.06-1.06l-1.72 1.72V8.25a.75.75 0 00-1.5 0v5.69l-1.72-1.72a.75.75 0 00-1.06 1.06l3 3z" clipRule="evenodd" />
                </svg>
                Book a Room
              </span>
            </button>

            <button
              onClick={() => router.push("/movies")}
              className="px-10 py-4 bg-white/5 border border-white/15 text-white font-bold rounded-2xl hover:bg-white/10 hover:border-white/30 transition-all duration-300 backdrop-blur-md w-full sm:w-auto flex items-center justify-center gap-2 hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 pointer-events-none">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375V5.625A2.625 2.625 0 018.625 3h6.75A2.625 2.625 0 0118 5.625v12.75c0 .621.504 1.125 1.125 1.125h1.5M9 7.5h6m-6 3h6m-6 3h6M6 21h12" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <span className="pointer-events-none">Browse Movies</span>
            </button>

            <button
              onClick={() => router.push("/games")}
              className="px-10 py-4 bg-white/5 border border-white/15 text-white font-bold rounded-2xl hover:bg-white/10 hover:border-white/30 transition-all duration-300 backdrop-blur-md w-full sm:w-auto flex items-center justify-center gap-2 hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 pointer-events-none">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.563.563 0 01-.563.563H9.813a.563.563 0 01-.563-.563v0c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875S5.49 5.464 5.49 6.5c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.563.563 0 01-.563.563H2.813a.563.563 0 01-.563-.563v0c0-1.63.878-3.06 2.188-3.843M14.25 6.087V21m0-14.913C14.025 6.5 13.785 6.5 13.5 6.5h-3c-.285 0-.525 0-.75.087M14.25 21H9.75" />
              </svg>
              <span className="pointer-events-none">Browse Games</span>
            </button>
          </div>

          {/* Scroll cue */}
          <div className="flex flex-col items-center mt-6 animate-bounce opacity-40">
            <span className="text-xs uppercase tracking-widest text-gray-500 mb-2">Scroll</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>
      </main>

      {/* ── FILM STRIP ── */}
      <FilmStrip />

      {/* ── STATS ── */}
      <section className="py-24 px-6 border-b border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <StatCounter target={12} suffix="+" label="Gaming Rooms" />
          <StatCounter target={500} suffix="+" label="Happy Gamers" />
          <StatCounter target={1000} suffix="+" label="Movies Available" />
          <StatCounter target={50} suffix="+" label="Game Titles" />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-blue-400 font-bold mb-4">Why Cinemac</p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight">
              Everything under one roof
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              gradient="bg-gradient-to-br from-blue-600 to-cyan-500"
              delay="0ms"
              title="Private Gaming Rooms"
              desc="Exclusively yours for the entire session. No strangers, no noise — just you, your crew, and the ultimate setup."
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3" />
                </svg>
              }
            />
            <FeatureCard
              gradient="bg-gradient-to-br from-purple-600 to-pink-500"
              delay="80ms"
              title="Blockbuster Screenings"
              desc="Cinema-grade screens and surround sound inside your private room. Watch anything from your library, exactly when you want."
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                </svg>
              }
            />
            <FeatureCard
              gradient="bg-gradient-to-br from-green-500 to-emerald-400"
              delay="160ms"
              title="Instant Online Booking"
              desc="Pick your room, choose your time slot, and confirm in under 60 seconds. No phone calls, no queues."
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              }
            />
            <FeatureCard
              gradient="bg-gradient-to-br from-orange-500 to-red-500"
              delay="240ms"
              title="VIP Lounge Rooms"
              desc="Premium rooms with luxury seating, ultra-wide displays, and priority service for those special occasions."
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              }
            />
            <FeatureCard
              gradient="bg-gradient-to-br from-violet-600 to-indigo-500"
              delay="320ms"
              title="Unified Media Library"
              desc="Add movies and games to your personal library and bring them to any session across any of our branches."
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                </svg>
              }
            />
            <FeatureCard
              gradient="bg-gradient-to-br from-teal-500 to-cyan-400"
              delay="400ms"
              title="Multiple Locations"
              desc="Growing across Sri Lanka. Find us in Colombo, Kandy, and more cities coming soon."
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      {/* ── EXPERIENCE SPLIT ── */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Cinema */}
          <div onClick={() => router.push("/movies")} className="relative group rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-blue-950/60 to-black p-10 hover:border-blue-500/40 transition-all duration-500 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="text-6xl mb-6 pointer-events-none">🎬</div>
            <h3 className="text-3xl font-black mb-4 text-white pointer-events-none">Cinema Experience</h3>
            <p className="text-gray-400 mb-8 leading-relaxed pointer-events-none">Watch the latest blockbusters or timeless classics in a private, noise-free screening room with professional-grade display technology.</p>
            <span className="inline-flex items-center gap-2 font-bold text-blue-400 group-hover:text-blue-300 transition-colors group-hover:gap-3 pointer-events-none">
              Browse Movies
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </div>

          {/* Gaming */}
          <div onClick={() => router.push("/games")} className="relative group rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-purple-950/60 to-black p-10 hover:border-purple-500/40 transition-all duration-500 cursor-pointer mt-0">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="text-6xl mb-6 pointer-events-none">🎮</div>
            <h3 className="text-3xl font-black mb-4 text-white pointer-events-none">Gaming Experience</h3>
            <p className="text-gray-400 mb-8 leading-relaxed pointer-events-none">Dominate with top-tier peripherals, premium racing rigs, and a library of 50+ titles ranging from indie gems to AAA blockbusters.</p>
            <span className="inline-flex items-center gap-2 font-bold text-purple-400 group-hover:text-purple-300 transition-colors group-hover:gap-3 pointer-events-none">
              Browse Games
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto relative">
          {/* glowing background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-3xl blur-3xl" />
          <div className="relative border border-white/10 rounded-3xl p-12 md:p-20 text-center bg-black/60 backdrop-blur-md overflow-hidden">
            {/* decorative circles */}
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl" />

            <p className="text-xs uppercase tracking-[0.3em] text-purple-400 font-bold mb-4">Ready to play?</p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              Your session awaits.
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-10 text-lg">
              Reserve your private room in under a minute. Choose your duration, pick your media, and step into the experience.
            </p>
            <Link
              href="/bookings"
              className="inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-extrabold rounded-2xl text-lg shadow-[0_0_50px_rgba(99,102,241,0.5)] hover:shadow-[0_0_80px_rgba(99,102,241,0.7)] hover:scale-105 transition-all duration-300"
            >
              Book Now — It&apos;s Free to Register
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-10 px-6 text-center">
        <p className="text-sm text-gray-600">© {new Date().getFullYear()} Cinemac Gaming. All rights reserved.</p>
        <p className="text-xs text-gray-700 mt-1">Colombo · Kandy · Sri Lanka</p>
      </footer>
    </div>
  );
}
