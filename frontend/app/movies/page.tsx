import Navbar from "../../components/Navbar";
import MovieRow from "../../components/MovieRow";
import { movieService } from "../../services/movieService";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch massive catalog of categories simultaneously avoiding sequential blocking delays
  const [
    trending,
    action,
    comedy,
    animation,
    horror,
    romance,
    scifi,
    thriller,
    crime,
    adventure
  ] = await Promise.all([
    movieService.getNetflixMovies(1),
    movieService.getMoviesByGenre(28, 1), // Action
    movieService.getMoviesByGenre(35, 1), // Comedy
    movieService.getMoviesByGenre(16, 1), // Animation
    movieService.getMoviesByGenre(27, 1), // Horror
    movieService.getMoviesByGenre(10749, 1), // Romance
    movieService.getMoviesByGenre(878, 1), // Sci-Fi
    movieService.getMoviesByGenre(53, 1), // Thriller
    movieService.getMoviesByGenre(80, 1), // Crime
    movieService.getMoviesByGenre(12, 1), // Adventure
  ]);

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      {/* 1. Navigation Bar */}
      <Navbar />

      {/* 2. Hero Banner */}
      <section className="px-6 md:px-10 mt-8">
        <div className="relative w-full h-[400px] rounded-3xl overflow-hidden bg-gradient-to-br from-purple-900 via-gray-900 to-black border border-gray-800 flex items-center p-8 md:p-16 shadow-2xl">
          <div className="z-10 max-w-2xl">
            <span className="inline-block px-3 py-1 mb-4 text-xs font-bold uppercase tracking-wider text-purple-300 bg-purple-900/50 rounded-full border border-purple-500/30">
              New Platform
            </span>
            <h2 className="text-5xl md:text-6xl font-extrabold text-white leading-tight">
              Cinemac <span className="text-transparent bg-clip-text bg-gradient-to-r from-cinemac-purple to-cinemac-blue">Gaming</span>
            </h2>
            <p className="mt-4 text-xl text-gray-300 font-light">
              Experience the best of both worlds. Dive into our massive library of premium movies and exclusive game drops.
            </p>
            <button className="mt-8 px-8 py-3 bg-gradient-to-r from-cinemac-purple to-purple-600 rounded-full shadow-lg shadow-purple-500/30 font-bold hover:scale-105 transition-all duration-300 text-white">
              Explore Now
            </button>
          </div>
          <div className="absolute right-0 top-0 h-full w-2/3 opacity-30 bg-gradient-to-l from-transparent to-transparent">
            {/* Soft glow effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500 rounded-full blur-[120px] opacity-20"></div>
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500 rounded-full blur-[100px] opacity-20"></div>
          </div>
        </div>
      </section>

      {/* 3. Movie Sections (Horizontal Scroll) */}
      <div className="px-6 md:px-10 mt-16 mb-20 space-y-10 max-w-[1920px] mx-auto">
        <MovieRow title="Netflix Exclusives & Trending" subtitle="The hottest picks right now." movies={trending} />
        <MovieRow title="Epic Adventures" subtitle="Embark on thrilling journeys." movies={adventure} />
        <MovieRow title="Action Blockbusters" subtitle="Explosions, chases, and total adrenaline." movies={action} />
        <MovieRow title="Sci-Fi & Fantasy" subtitle="Explore the unknown universe." movies={scifi} />
        <MovieRow title="Chilling Horror" subtitle="Keep the lights on." movies={horror} />
        <MovieRow title="Laugh Out Loud" subtitle="Top comedy selections." movies={comedy} />
        <MovieRow title="Gripping Thrillers" subtitle="Edge of your seat suspense." movies={thriller} />
        <MovieRow title="Crime & Mystery" subtitle="Solve the puzzle." movies={crime} />
        <MovieRow title="In the Mood for Love" subtitle="Romance and drama." movies={romance} />
        <MovieRow title="Family & Animation" subtitle="Fun for all ages." movies={animation} />
      </div>
    </div>
  );
}