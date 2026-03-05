import { Movie } from "../types/movie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5211/api";

export const movieService = {
  /**
   * Fetches the list of Netflix movies from the backend
   */
  async getNetflixMovies(page: number = 1): Promise<Movie[]> {
    try {
      // Adding revalidate: 3600 to cache the response for 1 hour (Next.js feature)
      // or use cache: 'no-store' if we want real-time updates always
      const res = await fetch(`${API_BASE_URL}/movies/netflix?page=${page}`, {
        next: { revalidate: 3600 },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch movies. Status: ${res.status}`);
      }
      return res.json();
    } catch (error) {
      console.error("Error in getNetflixMovies API call:", error);
      return []; // Return empty array on failure so UI does not break
    }
  },

  /**
   * Fetches movies by a specific genre ID
   */
  async getMoviesByGenre(genreId: number, page: number = 1): Promise<Movie[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/movies/genre/${genreId}?page=${page}`, {
        next: { revalidate: 3600 },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch movies. Status: ${res.status}`);
      }
      return res.json();
    } catch (error) {
      console.error(`Error in getMoviesByGenre (ID: ${genreId}) API call:`, error);
      return [];
    }
  },

  /**
   * Real-time search against the backend, no caching
   */
  async searchMovies(query: string, page: number = 1): Promise<Movie[]> {
    if (!query) return [];
    
    try {
      // Notice we do NOT use Next.js caching here because searches are highly dynamic
      const res = await fetch(`${API_BASE_URL}/movies/search?q=${encodeURIComponent(query)}&page=${page}`);

      if (!res.ok) {
        throw new Error(`Failed to search movies. Status: ${res.status}`);
      }
      return res.json();
    } catch (error) {
      console.error(`Error in searchMovies API call:`, error);
      return [];
    }
  },

  /**
   * Fetches specific movie details from backend (which hits TMDB for append_to_response=videos)
   */
  async getMovieDetails(id: string | number): Promise<Movie | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/movies/${id}`, {
        // use no-store or revalidate based on preference, revalidate might be good so we don't spam 
        next: { revalidate: 3600 },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch movie details. Status: ${res.status}`);
      }
      return res.json();
    } catch (error) {
      console.error(`Error in getMovieDetails API call:`, error);
      return null;
    }
  },
};
