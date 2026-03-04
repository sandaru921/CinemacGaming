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

       public async Task<IEnumerable<Movie>> GetNetflixMoviesAsync(int page = 1)
{
    // Added &page={page} to the URL
    var url = $"https://api.themoviedb.org/3/discover/movie?api_key={_apiKey}&with_networks=213&page={page}";
    
    var response = await _httpClient.GetFromJsonAsync<TMDBResponse>(url);
    
    return response?.Results.Select(m => new Movie
    {
        Id = m.Id,
        Title = m.Title,
        Plot = m.Overview,
        PosterUrl = $"https://image.tmdb.org/t/p/w500{m.PosterPath}",
        ImdbRating = m.VoteAverage
    }) ?? Enumerable.Empty<Movie>();
}

// Implement the new genre method
public async Task<IEnumerable<Movie>> GetMoviesByGenreAsync(int genreId, int page = 1)
{
    // TMDB uses 'with_genres=ID' to filter by genre, and we include the page parameter
    var url = $"https://api.themoviedb.org/3/discover/movie?api_key={_apiKey}&with_genres={genreId}&page={page}";
    
    var response = await _httpClient.GetFromJsonAsync<TMDBResponse>(url);
    
    // The mapping code is exactly the same!
    return response?.Results.Select(m => new Movie
    {
        Id = m.Id,
        Title = m.Title,
        Plot = m.Overview,
        PosterUrl = $"https://image.tmdb.org/t/p/w500{m.PosterPath}",
        ImdbRating = m.VoteAverage
    }) ?? Enumerable.Empty<Movie>();
}


public async Task<IEnumerable<Movie>> SearchMoviesAsync(string query, int page = 1)
{
    if (string.IsNullOrWhiteSpace(query))
        return Enumerable.Empty<Movie>();

    // Use TMDB's search/movie endpoint
    var url = $"https://api.themoviedb.org/3/search/movie?api_key={_apiKey}&query={Uri.EscapeDataString(query)}&page={page}";
    
    var response = await _httpClient.GetFromJsonAsync<TMDBResponse>(url);
    
    return response?.Results.Select(m => new Movie
    {
        Id = m.Id,
        Title = m.Title,
        Plot = m.Overview,
        PosterUrl = m.PosterPath != null ? $"https://image.tmdb.org/t/p/w500{m.PosterPath}" : string.Empty,
        ImdbRating = m.VoteAverage
    }) ?? Enumerable.Empty<Movie>();
}

        public async Task<Movie> GetMovieDetailsAsync(int movieId)
        {
            var url = $"https://api.themoviedb.org/3/movie/{movieId}?api_key={_apiKey}&append_to_response=videos";
            
            try 
            {
                var response = await _httpClient.GetFromJsonAsync<TMDBMovieDetailResponse>(url);
                
                if (response == null) return new Movie();
                
                // Find Youtube Trailer
                var trailer = response.Videos?.Results?.FirstOrDefault(v => v.Site == "YouTube" && v.Type == "Trailer");

                return new Movie
                {
                    Id = response.Id,
                    Title = response.Title,
                    Plot = response.Overview,
                    PosterUrl = response.PosterPath != null ? $"https://image.tmdb.org/t/p/w500{response.PosterPath}" : string.Empty,
                    ImdbRating = response.VoteAverage,
                    YoutubeTrailerKey = trailer?.Key ?? string.Empty
                };
            }
            catch(Exception)
            {
                return new Movie();
            }
        }
    }
}

// We need a specific class to catch the detailed response containing videos
public class TMDBMovieDetailResponse
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Overview { get; set; } = string.Empty;
    
    [System.Text.Json.Serialization.JsonPropertyName("poster_path")]
    public string? PosterPath { get; set; }
    
    [System.Text.Json.Serialization.JsonPropertyName("vote_average")]
    public double VoteAverage { get; set; }
    
    public TMDBVideosResponse? Videos { get; set; }
}

public class TMDBVideosResponse
{
    public List<TMDBVideo>? Results { get; set; }
}

public class TMDBVideo
{
    public string Key { get; set; } = string.Empty;
    public string Site { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
}