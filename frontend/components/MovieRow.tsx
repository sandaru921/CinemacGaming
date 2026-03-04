"use client";

import { useRef } from "react";
import { Movie } from "../types/movie";
import MovieCard from "./MovieCard";

interface MovieRowProps {
  title: string;
  subtitle?: string;
  movies: Movie[];
}

export default function MovieRow({ title, subtitle, movies }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  // Optional: Add scroll buttons for desktop, but native trackpad/touch horizontal scroll works great natively
  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth + 100 : scrollLeft + clientWidth - 100;
      rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <section className="relative group/row">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h3 className="text-2xl md:text-3xl font-bold">{title}</h3>
          {subtitle && <p className="text-gray-400 mt-1 text-sm font-medium">{subtitle}</p>}
        </div>
        <button className="text-sm font-semibold text-cinemac-blue hover:text-white transition-colors">
          View All
        </button>
      </div>

      {/* Navigation Buttons (visible only on hover on desktop) */}
      <button 
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black p-3 rounded-full opacity-0 group-hover/row:opacity-100 transition-opacity hidden md:block backdrop-blur-sm border border-gray-700 -ml-4"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-white">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <div 
        ref={rowRef}
        className="flex overflow-x-auto gap-4 md:gap-6 py-12 -my-10 px-4 -mx-4 md:px-8 md:-mx-8 scrollbar-hide snap-x"
      >
        {movies.map((movie) => (
          <div key={movie.id} className="min-w-[140px] md:min-w-[200px] lg:min-w-[240px] snap-start shrink-0">
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>

      <button 
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black p-3 rounded-full opacity-0 group-hover/row:opacity-100 transition-opacity hidden md:block backdrop-blur-sm border border-gray-700 -mr-4"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-white">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

    </section>
  );
}
