export interface Movie {
  id: number;
  title: string;
  genre: string;
  posterUrl: string;
  plot: string;
  director: string;
  cast: string;
  imdbRating: number;
  rottenTomatoesRating: number;
  youtubeTrailerKey?: string;
}
