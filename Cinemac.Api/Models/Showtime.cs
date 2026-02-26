namespace Cinemac.Api.Models
{
    public class Showtime
    {
        public int Id { get; set; }
        
        // 1. දර්ශන වාරය පටන් ගන්නා දිනය සහ වේලාව
        public DateTime StartTime { get; set; }

        // 2. Foreign Key එක (Movie table එකට සම්බන්ධ වීමට)
        public int MovieId { get; set; }

        // 3. Navigation Property (C# code එක ඇතුළේදී Movie විස්තර කෙලින්ම ලබා ගැනීමට)
        public Movie? Movie { get; set; }
    }
}