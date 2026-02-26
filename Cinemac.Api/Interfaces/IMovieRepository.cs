using Cinemac.Api.Models;

namespace Cinemac.Api.Interfaces
{
    public interface IMovieRepository
    {
        // සියලුම චිත්‍රපට ලබාගැනීමේ ගිවිසුම
        Task<IEnumerable<Movie>> GetAllMoviesAsync();
    }
}