import { movieService } from "../../../services/movieService";
import Navbar from "../../../components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function MovieDetailsPage({ params }: PageProps) {
  const { id } = await params; // Make sure to await params or use it properly depending on NEXT version
  const movie = await movieService.getMovieDetails(id);

  if (!movie) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      <Navbar />

      <main className="relative pt-10 pb-20 px-6 md:px-10 max-w-[1920px] mx-auto">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span className="font-semibold">Back to Home</span>
        </Link>

        {/* Content Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          
          {/* Left Column: Poster & Actions (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="relative aspect-[2/3] w-full max-w-md mx-auto lg:max-w-none rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/20 border border-gray-800">
              {movie.posterUrl ? (
                <Image
                  src={movie.posterUrl}
                  alt={movie.title}
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
               <button className="flex-1 bg-gradient-to-r from-cinemac-blue to-purple-600 text-white font-bold py-4 rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                 </svg>
                 Play Movie
               </button>
               <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors border border-gray-700">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                 </svg>
               </button>
            </div>
          </div>

          {/* Right Column: Details & Trailer (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                {movie.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm font-medium">
                {movie.imdbRating > 0 && (
                  <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1 rounded-full">
                    <span>★</span>
                    <span>{movie.imdbRating.toFixed(1)} IMDb</span>
                  </div>
                )}
                {movie.genre && (
                  <div className="px-3 py-1 bg-gray-800 rounded-full border border-gray-700 text-gray-300">
                    {movie.genre}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white border-b border-gray-800 pb-2">Synopsis</h3>
              <p className="text-gray-300 leading-relaxed text-lg font-light">
                {movie.plot || "No synopsis available for this title."}
              </p>
            </div>

            {/* Trailer Video Player */}
            {movie.youtubeTrailerKey && (
              <div className="space-y-4 mt-4">
                <h3 className="text-xl font-bold text-white border-b border-gray-800 pb-2">Official Trailer</h3>
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-gray-800 bg-gray-900 group">
                  {/* YouTube Iframe embedded with autoplay and mute by default to allow auto-play rules in most browsers */}
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${movie.youtubeTrailerKey}?autoplay=1&mute=1&loop=1&playlist=${movie.youtubeTrailerKey}&controls=1&showinfo=0&rel=0`}
                    title={`${movie.title} Trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
