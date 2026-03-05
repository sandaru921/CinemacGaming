import { movieService } from "../../services/movieService";
import Navbar from "../../components/Navbar";
import MovieCard from "../../components/MovieCard";
import Link from "next/link";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // Await searchParams as required in Next.js recent versions
  const params = await searchParams;
  const query = params.q || "";
  const movies = query ? await movieService.searchMovies(query) : [];

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      <Navbar />

      <main className="px-6 md:px-10 mt-10 mb-20 max-w-[1920px] mx-auto">
        {/* Back to Home Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span className="font-semibold">Back to Home</span>
        </Link>

        {query ? (
          <h1 className="text-3xl md:text-5xl font-extrabold mb-12 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            Search Results for <span className="text-cinemac-blue hover:text-cinemac-purple transition-colors">"{query}"</span>
          </h1>
        ) : (
          <h1 className="text-3xl md:text-5xl font-extrabold mb-12 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            Search Database
          </h1>
        )}

        {query && movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : query ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-900/50 rounded-3xl border border-gray-800 shadow-2xl mt-12">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20 text-gray-600 mb-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">No results found</h2>
            <p className="text-gray-400 text-center max-w-md">
              We couldn't find any movies matching "{query}". Try checking for typos or searching with different keywords.
            </p>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500 font-medium">Please enter a search term above to find movies and games.</p>
          </div>
        )}
      </main>
    </div>
  );
}
