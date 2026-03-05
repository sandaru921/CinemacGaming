using System;

namespace Cinemac.Api.Models
{
    public class UserLibraryItem
    {
        public int Id { get; set; }

        public Guid UserId { get; set; } // Link back to the logged-in User

        public string MediaId { get; set; } = string.Empty; // Store as string to support both numeric Game IDs and potential string Movie IDs from TMDB
        
        public string MediaTitle { get; set; } = string.Empty;
        
        public string MediaType { get; set; } = string.Empty; // "Movie" or "Game"
        
        public string PosterUrl { get; set; } = string.Empty;

        public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    }
}
