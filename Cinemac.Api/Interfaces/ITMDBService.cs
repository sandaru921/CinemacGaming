using Cinemac.Api.Models;

namespace Cinemac.Api.Interfaces
{
    public interface ITMDBService
    {
        // 1. ලැයිස්තුව ලබා ගැනීමට
        Task<IEnumerable<Movie>> GetNetflixMoviesAsync();

        // 2. එක චිත්‍රපටයක විස්තර ලබා ගැනීමට
        Task<Movie> GetMovieDetailsAsync(int movieId);
    }
}