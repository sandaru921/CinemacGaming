using System;
using System.Text.Json.Serialization;

namespace Cinemac.Api.Models.Booking
{
    public class RoomBooking
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        public Guid RoomId { get; set; }
        
        // Use a generic string for now if ASP.NET Core Identity isn't heavily enforced, or link it if it is.
        // For simplicity, we'll store the User's email or Name.
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;

        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        
        public decimal TotalPrice { get; set; }
        public BookingStatus Status { get; set; } = BookingStatus.Pending;

        // Navigation Property
        [JsonIgnore]
        public Room? Room { get; set; }
    }

    public enum BookingStatus
    {
        Pending,
        Confirmed,
        Cancelled
    }
}
