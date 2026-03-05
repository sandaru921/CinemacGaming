using System;
using System.Linq;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Cinemac.Api.Data;
using Cinemac.Api.Models.Booking;

namespace Cinemac.Api.Data
{
    public static class DbSeeder
    {
        public static void SeedLocationsAndRooms(IApplicationBuilder app)
        {
            using var scope = app.ApplicationServices.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            context.Database.EnsureCreated(); // Or rely on migrations

            // Seed Admin User
            if (!context.AdminUsers.Any())
            {
                context.AdminUsers.Add(new Cinemac.Api.Models.AdminUser
                {
                    Username = "admin",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!")
                });
                context.SaveChanges();
            }

            if (!context.Locations.Any())
            {
                var loc1 = new Location { Name = "Colombo Branch" };
                var loc2 = new Location { Name = "Kandy Branch" };

                context.Locations.AddRange(loc1, loc2);
                context.SaveChanges(); // Need IDs for rooms

                // 5 Rooms for Colombo
                context.Rooms.Add(new Room { LocationId = loc1.Id, Name = "Room A (Standard)", Price = 1000m, PricingType = PricingType.PerHour });
                context.Rooms.Add(new Room { LocationId = loc1.Id, Name = "Room B (Standard)", Price = 1000m, PricingType = PricingType.PerHour });
                context.Rooms.Add(new Room { LocationId = loc1.Id, Name = "Room C (Standard)", Price = 1000m, PricingType = PricingType.PerHour });
                context.Rooms.Add(new Room { LocationId = loc1.Id, Name = "Room D (VIP)", Price = 2500m, PricingType = PricingType.PerHour });
                context.Rooms.Add(new Room { LocationId = loc1.Id, Name = "Room E (VVIP)", Price = 4000m, PricingType = PricingType.PerHour });

                // 5 Rooms for Kandy
                context.Rooms.Add(new Room { LocationId = loc2.Id, Name = "Room A (Standard)", Price = 800m, PricingType = PricingType.PerHour });
                context.Rooms.Add(new Room { LocationId = loc2.Id, Name = "Room B (Standard)", Price = 800m, PricingType = PricingType.PerHour });
                context.Rooms.Add(new Room { LocationId = loc2.Id, Name = "Room C (Standard)", Price = 800m, PricingType = PricingType.PerHour });
                context.Rooms.Add(new Room { LocationId = loc2.Id, Name = "Room D (VIP)", Price = 2000m, PricingType = PricingType.PerHour });
                context.Rooms.Add(new Room { LocationId = loc2.Id, Name = "Room E (VVIP)", Price = 3500m, PricingType = PricingType.PerHour });

                context.SaveChanges();
            }
        }
    }
}
