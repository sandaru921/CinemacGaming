using System.Text.Json.Serialization;

namespace Cinemac.Api.Models
{
    public class TMDBResponse
    {
        [JsonPropertyName("results")]
        public List<TMDBMovieDto> Results { get; set; } = new();
    }

    public class TMDBMovieDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("overview")]
        public string Overview { get; set; } = string.Empty;

        [JsonPropertyName("poster_path")]
        public string PosterPath { get; set; } = string.Empty;

        [JsonPropertyName("genre_ids")]
        public List<int> GenreIds { get; set; } = new();

        [JsonPropertyName("vote_average")]
        public double VoteAverage { get; set; }
    }
}