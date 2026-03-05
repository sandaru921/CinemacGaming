import Image from "next/image";
import Link from "next/link";
import { Movie } from "../types/movie";
import AddToLibraryButton from "./AddToLibraryButton";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <div className="group relative w-full aspect-[2/3] cursor-pointer perspective-1000">
      <Link href={`/movie/${movie.id}`}>
        <div className="absolute inset-0 z-10 origin-center transition-all duration-300 ease-out group-hover:z-50 group-hover:scale-[1.15] md:group-hover:scale-125 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden bg-gray-900 border-2 border-transparent group-hover:border-cinemac-purple">
          
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
              <div className="absolute top-2 right-2 z-10 rounded bg-yellow-500 px-2 py-0.5 text-[11px] font-extrabold text-black shadow-lg transition-opacity duration-300 group-hover:opacity-0">
                ★ {movie.imdbRating.toFixed(1)}
              </div>
            )}

            {/* Hover Content */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end p-4 md:p-5">
               <div className="translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 delay-75">
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
                  <div className="mt-3 flex gap-2 relative z-20" onClick={(e) => { e.preventDefault(); }}>
                    <button className="flex-1 bg-white text-black py-1.5 rounded-md text-xs font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                      </svg>
                      Play
                    </button>
                    <AddToLibraryButton 
                      mediaId={movie.id.toString()}
                      mediaTitle={movie.title}
                      mediaType="Movie"
                      posterUrl={movie.posterUrl}
                      className="!p-1.5 !rounded-md"
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
