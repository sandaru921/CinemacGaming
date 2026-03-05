import Navbar from "../../components/Navbar";
import Image from "next/image";
import Link from "next/link";
import AddToLibraryButton from "../../components/AddToLibraryButton";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5211/api";

type Game = {
  id: number;
  title: string;
  genre: string;
  description: string;
  posterUrl: string;
  developer: string;
  publisher: string;
  rating: number;
};

export default async function GamesPage() {
  let games: Game[] = [];

  try {
    const res = await fetch(`${API_BASE_URL}/Games`, { cache: "no-store" });
    if (res.ok) {
      games = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch games:", error);
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col relative px-6 md:px-10 py-10 max-w-[1920px] mx-auto w-full">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[120px] mix-blend-screen"></div>
        </div>

        <div className="relative z-10 space-y-8 w-full">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-gray-300 backdrop-blur-md mb-4">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            Cloud Gaming Hub
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.1]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cinemac-blue via-green-500 to-emerald-400">
              Discover Games
            </span>
          </h1>
          
          <p className="max-w-2xl text-lg text-gray-400 font-light leading-relaxed">
            Instantly stream blockbuster AAA titles directly to your screen. No downloads, no waiting. Just pure gaming.
          </p>
          
          <div className="mt-16">
            {games.length === 0 ? (
               <div className="mt-12 p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-center justify-center gap-6 shadow-2xl mx-auto max-w-2xl">
                 <div className="w-20 h-20 rounded-full bg-gray-900/80 flex items-center justify-center border border-gray-800 shadow-inner">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-green-500">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a1.5 1.5 0 01-1.5 1.5H6.94a1.5 1.5 0 00-1.127.5zM12 15.75a3 3 0 110-6 3 3 0 010 6z" />
                   </svg>
                 </div>
                 <div className="text-center">
                   <h3 className="text-xl font-bold text-white mb-2">Connecting to Game Servers...</h3>
                   <p className="text-gray-400 text-sm">We are currently curating the best titles for your library.</p>
                 </div>
               </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 gap-y-10 w-full animate-in fade-in duration-500">
                {games.map(game => (
                  <Link href={`/game/${game.id}`} key={game.id} className="group flex flex-col cursor-pointer border-transparent transition-all duration-300 hover:-translate-y-2">
                    <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-lg border border-gray-800 group-hover:border-green-500/50 group-hover:shadow-green-500/20">
                      {game.posterUrl ? (
                        <Image 
                          src={game.posterUrl} 
                          alt={game.title} 
                          fill 
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw" 
                          className="object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-900 flex items-center justify-center text-gray-500">No Image</div>
                      )}
                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Rating Badge */}
                      {game.rating > 0 && (
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold text-yellow-500 border border-yellow-500/30">
                          ★ {game.rating.toFixed(1)}
                        </div>
                      )}

                      {/* Add to Library Button */}
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <AddToLibraryButton 
                          mediaId={game.id.toString()}
                          mediaTitle={game.title}
                          mediaType="Game"
                          posterUrl={game.posterUrl}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-col">
                      <h4 className="font-bold text-lg leading-tight text-white group-hover:text-green-400 transition-colors truncate">{game.title}</h4>
                      <div className="flex items-center justify-between mt-1 text-sm">
                        <span className="text-gray-400 truncate max-w-[50%]">{game.genre}</span>
                        <span className="text-xs text-cinemac-blue font-bold uppercase truncate max-w-[50%] text-right">{game.developer}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
