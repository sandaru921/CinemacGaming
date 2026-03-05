"use client";

import Navbar from "../../components/Navbar";
import { useLibrary } from "../../contexts/LibraryContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MyLibrary() {
  const { library, removeFromLibrary } = useLibrary();
  const router = useRouter();

  const movies = library.filter(item => item.mediaType === "Movie");
  const games = library.filter(item => item.mediaType === "Game");

  const LibraryGrid = ({ items, title }: { items: typeof library, title: string }) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-6 pb-2 border-b border-gray-800 inline-block">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 animate-in fade-in duration-500">
          {items.map(item => (
            <div key={item.mediaId} className="group relative w-full aspect-[2/3] perspective-1000">
              <Link href={`/${item.mediaType.toLowerCase()}/${item.mediaId}`}>
                <div className="absolute inset-0 z-10 origin-center transition-all duration-300 ease-out hover:z-50 hover:scale-[1.15] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden bg-gray-900 border border-gray-800 hover:border-cinemac-blue">
                  
                  {item.posterUrl ? (
                    <Image
                      src={item.posterUrl}
                      alt={item.mediaTitle}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                      className="object-cover transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center p-4 text-center text-xs text-gray-500">
                      No Poster
                    </div>
                  )}
                  
                  {/* Hover Content */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent/20 opacity-100 lg:opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end p-4">
                     <div className="translate-y-0 lg:translate-y-4 opacity-100 lg:opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 delay-75">
                        <h4 className="text-sm font-bold text-white line-clamp-2 leading-tight drop-shadow-md">
                          {item.mediaTitle}
                        </h4>
                        
                        <div className="mt-3 flex gap-2 relative z-20" onClick={(e) => { e.preventDefault(); }}>
                          <button 
                            className="flex-1 bg-white text-black py-2.5 lg:py-1.5 rounded-md text-sm lg:text-xs font-bold hover:bg-gray-200 transition-colors"
                            onClick={() => router.push(`/bookings?media=${item.mediaId}&type=${item.mediaType}`)}
                          >
                            Book Room
                          </button>
                          <button 
                            onClick={() => removeFromLibrary(item.mediaId, item.mediaType)}
                            className="p-2.5 lg:p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-md transition-colors border border-red-500/50"
                            title="Remove from Library"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                     </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[1920px] mx-auto w-full px-6 md:px-10 py-10 relative">
        <div className="absolute top-0 right-0 w-1/3 h-[500px] bg-purple-500/10 rounded-full blur-[150px] mix-blend-screen pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-[500px] bg-blue-500/10 rounded-full blur-[150px] mix-blend-screen pointer-events-none -z-10"></div>

        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-cinemac-blue to-purple-500">Library</span>
          </h1>
          <p className="text-gray-400 mt-2 text-lg font-light">
            Your saved titles, ready to be played at Cinemac.
          </p>
        </div>

        {library.length === 0 ? (
          <div className="mt-20 p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-center justify-center gap-6 shadow-2xl mx-auto max-w-2xl text-center">
            <div className="w-20 h-20 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Your library is empty</h3>
              <p className="text-gray-400 text-sm">Save your favorite movies and games to easily select them during booking.</p>
            </div>
            <div className="flex gap-4 mt-4">
              <Link href="/movies" className="px-6 py-2 rounded-full bg-cinemac-blue hover:bg-blue-600 text-white font-bold transition-colors shadow-lg">Browse Movies</Link>
              <Link href="/games" className="px-6 py-2 rounded-full bg-green-600 hover:bg-green-500 text-white font-bold transition-colors shadow-lg">Browse Games</Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 z-10 relative">
            <LibraryGrid items={movies} title="Saved Movies" />
            <LibraryGrid items={games} title="Saved Games" />
          </div>
        )}

      </main>
    </div>
  );
}
