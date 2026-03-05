"use client";

import Image from "next/image";
import Link from "next/link";
import { Movie } from "../types/movie";
import AddToLibraryButton from "./AddToLibraryButton";
import { useState, useEffect } from "react";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const [isTouched, setIsTouched] = useState(false);

  useEffect(() => {
    const handleOutsideTouch = () => setIsTouched(false);
    document.addEventListener("touchstart", handleOutsideTouch);
    return () => document.removeEventListener("touchstart", handleOutsideTouch);
  }, []);

  return (
    <div 
      className="group relative w-full aspect-[2/3] cursor-pointer perspective-1000"
      onTouchStart={(e) => e.stopPropagation()}
    >
      <Link 
        href={`/movie/${movie.id}`}
        onClick={(e) => {
          if (typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0)) {
            if (!isTouched) {
              e.preventDefault();
              setIsTouched(true);
            }
          }
        }}
      >
        <div className={`absolute inset-0 z-10 origin-center transition-all duration-300 ease-out rounded-xl overflow-hidden bg-gray-900 border-2 ${
          isTouched 
            ? 'z-50 scale-[1.15] md:scale-125 -translate-y-2 shadow-[0_20px_40px_rgba(0,0,0,0.8)] border-cinemac-purple' 
            : 'border-transparent group-hover:border-cinemac-purple group-hover:z-50 group-hover:scale-[1.15] md:group-hover:scale-125 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)]'
        }`}>
          
          <div className="relative w-full h-full">
            {movie.posterUrl ? (
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                className="object-cover transition-transform duration-500"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center p-4 text-center text-xs text-gray-500">
                No Poster
              </div>
            )}
            
            {/* Rating Badge */}
            {movie.imdbRating > 0 && (
              <div className={`absolute top-2 right-2 z-10 rounded bg-yellow-500 px-2 py-0.5 text-[11px] font-extrabold text-black shadow-lg transition-opacity duration-300 ${isTouched ? 'opacity-0' : 'group-hover:opacity-0'}`}>
                ★ {movie.imdbRating.toFixed(1)}
              </div>
            )}

            {/* Hover Content */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent/20 transition-opacity duration-300 flex flex-col justify-end p-4 md:p-5 ${isTouched ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
               <div className={`transition-all duration-300 delay-75 ${isTouched ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'}`}>
                  <h4 className="text-sm md:text-base font-bold text-white line-clamp-2 leading-tight drop-shadow-md">
                    {movie.title}
                  </h4>
                  
                  <div className="flex items-center gap-2 mt-2 text-[10px] md:text-xs font-semibold">
                    <span className="text-green-400">{movie.releaseYear || 'New'}</span>
                    {movie.imdbRating > 0 && (
                      <span className="flex items-center text-yellow-500 drop-shadow-md">
                        ★ {movie.imdbRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  
                  {movie.plot && (
                    <p className="mt-2 text-[10px] md:text-xs text-gray-300 line-clamp-3 leading-snug">
                      {movie.plot}
                    </p>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="mt-3 flex relative z-20" onClick={(e) => e.preventDefault()}>
                    <AddToLibraryButton 
                      mediaId={movie.id.toString()}
                      mediaTitle={movie.title}
                      mediaType="Movie"
                      posterUrl={movie.posterUrl}
                      fullWidth={true}
                      className="!py-2 lg:!py-1.5 !rounded-md !text-sm lg:!text-xs h-auto"
                    />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

