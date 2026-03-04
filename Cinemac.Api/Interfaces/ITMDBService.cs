using Cinemac.Api.Models;

namespace Cinemac.Api.Interfaces
{
public interface ITMDBService
    {
       // Accept the page number as a parameter, defaulting to 1
        Task<IEnumerable<Movie>> GetMoviesByGenreAsync(int genreId, int page = 1);

        // We'll keep the Netflix one, but let's make it support pagination too
        Task<IEnumerable<Movie>> GetNetflixMoviesAsync(int page = 1);

        // Required to search for movies dynamically from the Navbar
        Task<IEnumerable<Movie>> SearchMoviesAsync(string query, int page = 1);

        Task<Movie> GetMovieDetailsAsync(int movieId);
    }
}