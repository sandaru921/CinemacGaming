using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Cinemac.Api.Models.Booking
{
    public class Room
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid LocationId { get; set; }
        public string Name { get; set; } = string.Empty; // e.g., "Room 1", "VIP Gaming Room"
        public decimal BasePricePerHour { get; set; }

        // Navigation Properties
        [JsonIgnore]
        public Location? Location { get; set; }
        [JsonIgnore]
        public ICollection<RoomBooking> Bookings { get; set; } = new List<RoomBooking>();
    }
}
