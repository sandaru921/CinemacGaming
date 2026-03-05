import Navbar from "../../../components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ExpandableDescription from "./ExpandableDescription";
import AddToLibraryButton from "../../../components/AddToLibraryButton";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5211/api";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function GameDetailsPage({ params }: PageProps) {
  const { id } = await params;
  let game = null;

  try {
    const res = await fetch(`${API_BASE_URL}/Games/${id}`, { cache: "no-store" });
    if (res.ok) {
      game = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch game details:", error);
  }

  if (!game) {
    return notFound();
  }

  const getYouTubeId = (urlOrId: string) => {
    if (!urlOrId) return "";
    const match = urlOrId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return (match && match[1]) ? match[1] : urlOrId.trim();
  };

  const mainTrailerId = game.youtubeTrailerKey ? getYouTubeId(game.youtubeTrailerKey) : "";

  const gameplayVideosList = game.gameplayVideoKeys 
    ? game.gameplayVideoKeys.split(',').map((k: string) => getYouTubeId(k)).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      <Navbar />

      <main className="relative pt-10 pb-20 px-6 md:px-10 max-w-[1920px] mx-auto z-10">
        
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-1/2 h-[500px] bg-green-500/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none -z-10"></div>

        {/* Back Button */}
        <Link href="/games" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span className="font-semibold">Back to Games</span>
        </Link>

        {/* Content Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          
          {/* Left Column: Poster & Actions (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="relative aspect-[2/3] w-full max-w-md mx-auto lg:max-w-none rounded-2xl overflow-hidden shadow-2xl shadow-green-900/20 border border-gray-800">
              {game.posterUrl ? (
                <Image
                  src={game.posterUrl}
                  alt={game.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gray-900 flex items-center justify-center text-gray-500">
                  No Poster Available
                </div>
              )}
            </div>

            <div className="flex gap-4 max-w-md mx-auto lg:max-w-none w-full">
               <button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-black font-black py-4 rounded-xl shadow-lg shadow-green-500/20 hover:scale-105 transition-transform flex items-center justify-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                 </svg>
                 Play Game
               </button>
               <AddToLibraryButton 
                 mediaId={game.id.toString()}
                 mediaTitle={game.title}
                 mediaType="Game"
                 posterUrl={game.posterUrl}
                 className="!p-4 !rounded-xl"
               />
            </div>
          </div>

          {/* Right Column: Details & Trailer (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                {game.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm font-medium">
                {game.rating > 0 && (
                  <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1 rounded-full">
                    <span>★</span>
                    <span>{game.rating.toFixed(1)} Rating</span>
                  </div>
                )}
                {game.genre && (
                  <div className="px-3 py-1 bg-gray-800 rounded-full border border-gray-700 text-gray-300">
                    {game.genre}
                  </div>
                )}
                {game.developer && (
                  <div className="px-3 py-1 bg-blue-500/10 text-cinemac-blue rounded-full border border-blue-500/20 font-bold uppercase">
                    Developer: {game.developer}
                  </div>
                )}
              </div>
            </div>

            {/* Trailer Video Player */}
            {mainTrailerId && (
              <div className="space-y-4 mt-8">
                <h3 className="text-xl font-bold text-white border-b border-gray-800 pb-2">Main Trailer</h3>
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-gray-800 bg-gray-900 group">
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${mainTrailerId}?autoplay=1&mute=1&loop=1&playlist=${mainTrailerId}&controls=1&showinfo=0&rel=0`}
                    title={`${game.title} Trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white border-b border-gray-800 pb-2">Description</h3>
              <ExpandableDescription text={game.description} />
            </div>

            {/* Gameplay Videos */}
            {gameplayVideosList.length > 0 && (
              <div className="space-y-4 mt-8">
                <h3 className="text-xl font-bold text-white border-b border-gray-800 pb-2">Gameplay Videos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {gameplayVideosList.map((videoKey: string, index: number) => (
                    <div key={index} className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg border border-gray-800 bg-gray-900">
                      <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${videoKey}?controls=1&showinfo=0&rel=0`}
                        title={`${game.title} Gameplay ${index + 1}`}
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        </div>
      </main>
    </div>
  );
}
