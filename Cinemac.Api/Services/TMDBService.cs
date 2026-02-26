using Cinemac.Api.Interfaces;
using Cinemac.Api.Models;
using System.Net.Http.Json;

namespace Cinemac.Api.Services
{
    public class TMDBService : ITMDBService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey = "2509a324eb289bb275e0bf066cb63ad6";

        public TMDBService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<IEnumerable<Movie>> GetNetflixMoviesAsync()
        {
            // Netflix Network ID එක වෙන්නේ 213
            var url = $"https://api.themoviedb.org/3/discover/movie?api_key={_apiKey}&with_networks=213";
            
            var response = await _httpClient.GetFromJsonAsync<TMDBResponse>(url);
            
            // TMDB දත්ත අපේ Movie Model එකට පරිවර්තනය කිරීම (Mapping)
            return response?.Results.Select(m => new Movie
            {
                Id = m.Id,
                Title = m.Title,
                Plot = m.Overview,
                PosterUrl = $"https://image.tmdb.org/t/p/w500{m.PosterPath}",
                ImdbRating = m.VoteAverage
            }) ?? Enumerable.Empty<Movie>();
        }

        public async Task<Movie> GetMovieDetailsAsync(int movieId)
        {
            // මෙතනදී අපි චිත්‍රපටයේ Director/Cast ලබාගැනීමේ කේතය පසුව ලියමු
            return new Movie(); 
        }
    }
}