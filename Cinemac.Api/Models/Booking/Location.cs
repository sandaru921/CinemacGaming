using System;
using System.Collections.Generic;

namespace Cinemac.Api.Models.Booking
{
    public class Location
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty; // e.g., "Colombo Branch", "Kandy Branch"

        // Navigation Property: One Location has Many Rooms
        public ICollection<Room> Rooms { get; set; } = new List<Room>();
    }
}
