namespace Cinemac.Api.Models
{
    public class Movie
    {
        // 1. අනිවාර්යයෙන්ම අවශ්‍ය ID එක (Primary Key)
        public int Id { get; set; }

        // 2. මූලික විස්තර
        public string Title { get; set; } = string.Empty;
        public string Genre { get; set; } = string.Empty;
        public string PosterUrl { get; set; } = string.Empty;

        // 3. ඔයා ඉල්ලපු අමතර විස්තර (More Details)
        public string Plot { get; set; } = string.Empty;
        public string Director { get; set; } = string.Empty;
        public string Cast { get; set; } = string.Empty; 

        // 4. Ratings (IMDb සහ වෙනත්)
        public double ImdbRating { get; set; }
        public double RottenTomatoesRating { get; set; } 
        public List<Showtime> Showtimes { get; set; } = new();
    }
}