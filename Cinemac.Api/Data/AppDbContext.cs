using Microsoft.EntityFrameworkCore;
using Cinemac.Api.Models;

namespace Cinemac.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // මේවා තමයි database එකේ හැදෙන Tables
        public DbSet<Movie> Movies { get; set; }
        public DbSet<Showtime> Showtimes { get; set; }
    }
}