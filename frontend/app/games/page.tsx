import Navbar from "../../components/Navbar";

export default function GamesPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center relative px-6 text-center py-20">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[120px] mix-blend-screen"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-gray-300 backdrop-blur-md mb-4 mx-auto">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            Cloud Gaming Hub
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.1]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cinemac-blue via-green-500 to-emerald-400">
              Discover Games
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg text-gray-400 font-light leading-relaxed">
            Instantly stream blockbuster AAA titles directly to your screen. No downloads, no waiting. Just pure gaming.
          </p>
          
          <div className="mt-12 p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-center justify-center gap-6 shadow-2xl">
             <div className="w-20 h-20 rounded-full bg-gray-900/80 flex items-center justify-center border border-gray-800 shadow-inner">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-green-500">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a1.5 1.5 0 01-1.5 1.5H6.94a1.5 1.5 0 00-1.127.5zM12 15.75a3 3 0 110-6 3 3 0 010 6z" />
               </svg>
             </div>
             <div className="text-center">
               <h3 className="text-xl font-bold text-white mb-2">Connecting to Game Servers...</h3>
               <p className="text-gray-400 text-sm">We are currently curating the best titles for your library.</p>
             </div>
             <button className="mt-4 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-black font-bold hover:scale-105 transition-all duration-300 shadow-lg shadow-green-500/20">
               Notify Me
             </button>
          </div>

        </div>
      </main>
    </div>
  );
}
