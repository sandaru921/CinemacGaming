using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Cinemac.Api.Models.Booking
{
    public enum PricingType
    {
        PerHour = 0,
        PerBooking = 1
    }

    public class Room
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid LocationId { get; set; }
        public string Name { get; set; } = string.Empty;

        // New unified pricing fields
        public decimal Price { get; set; }
        public PricingType PricingType { get; set; } = PricingType.PerHour;

        // Navigation Properties
        [JsonIgnore]
        public Location? Location { get; set; }
        [JsonIgnore]
        public ICollection<RoomBooking> Bookings { get; set; } = new List<RoomBooking>();
    }
}
