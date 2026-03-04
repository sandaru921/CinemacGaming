using Microsoft.EntityFrameworkCore;
using Cinemac.Api.Models;
using Cinemac.Api.Models.Booking;

namespace Cinemac.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // මේවා තමයි database එකේ හැදෙන Tables
        public DbSet<Movie> Movies { get; set; }
        public DbSet<Showtime> Showtimes { get; set; }

        // Booking System Tables
        public DbSet<Location> Locations { get; set; }
        public DbSet<Room> Rooms { get; set; }
        public DbSet<RoomBooking> RoomBookings { get; set; }

        // Admin Security Table
        public DbSet<AdminUser> AdminUsers { get; set; }

        // Public Users Table
        public DbSet<User> Users { get; set; }
    }
}