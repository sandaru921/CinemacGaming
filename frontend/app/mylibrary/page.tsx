import Navbar from "../../components/Navbar";

export default function MyLibraryPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center relative px-6 text-center py-20">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-yellow-500/10 rounded-full blur-[120px] mix-blend-screen"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-gray-300 backdrop-blur-md mb-4 mx-auto">
            <span className="flex h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></span>
            Personal Collection
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.1]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-orange-500">
              My Library
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg text-gray-400 font-light leading-relaxed">
            Your saved movies, purchased games, and custom watchlists are all synced here for quick access.
          </p>
          
          <div className="mt-12 p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-center justify-center gap-6 shadow-2xl">
             <div className="w-20 h-20 rounded-full bg-gray-900/80 flex items-center justify-center border border-gray-800 shadow-inner">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10 text-yellow-500">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
               </svg>
             </div>
             <div className="text-center">
               <h3 className="text-xl font-bold text-white mb-2">Your library is empty</h3>
               <p className="text-gray-400 text-sm">Start saving movies and games to build your collection.</p>
             </div>
             <button className="mt-4 px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 hover:scale-105 transition-all duration-300 shadow-lg">
               Sign In to Sync
             </button>
          </div>

        </div>
      </main>
    </div>
  );
}
