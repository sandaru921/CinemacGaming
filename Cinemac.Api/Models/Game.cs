using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Cinemac.Api.Models
{
    public class Game
    {
        public int Id { get; set; }
        
        [Required]
        public string Title { get; set; } = string.Empty;
        
        public string Genre { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        
        public string PosterUrl { get; set; } = string.Empty;
        
        public string Developer { get; set; } = string.Empty;
        
        public string Publisher { get; set; } = string.Empty;
        
        // e.g., 9.5 out of 10
        public double Rating { get; set; }
        
        // For the main trailer
        public string YoutubeTrailerKey { get; set; } = string.Empty;

        // Comma-separated list of youtube keys for gameplay videos, or serialized JSON list if preferred.
        public string GameplayVideoKeys { get; set; } = string.Empty;
    }
}
