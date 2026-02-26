using Cinemac.Api.Interfaces;
using Cinemac.Api.Models;

namespace Cinemac.Api.Services
{
    public class MovieService
    {
        private readonly IMovieRepository _repository;

        public MovieService(IMovieRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<Movie>> GetAllMoviesAsync()
        {
            // මෙතැනදී අපිට ඕනෙ නම් දත්ත filter කරන්න හෝ වෙනස් කරන්න පුළුවන්
            return await _repository.GetAllMoviesAsync();
        }
    }
}