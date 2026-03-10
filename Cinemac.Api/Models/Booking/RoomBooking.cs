using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Cinemac.Api.Models.Booking
{
    public class RoomBooking
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid RoomId { get; set; }

        // Customer Details
        [Required]
        public string CustomerName { get; set; } = string.Empty;
        
        // Email එක Web booking වලදී අනිවාර්ය වුවත්, WhatsApp වලදී optional විය හැක.
        public string? CustomerEmail { get; set; } 

        // WhatsApp හරහා එන බුකින් හඳුනා ගැනීමට සහ නැවත මැසේජ් යැවීමට
        public string? CustomerPhone { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

        public decimal TotalPrice { get; set; }

        // බුකින් එකේ තත්ත්වය (Pending, Confirmed, Cancelled)
        public BookingStatus Status { get; set; } = BookingStatus.Pending;

        // බුකින් එක ආවේ කොහෙන්ද? (Web, WhatsApp, Manual)
        public BookingSource Source { get; set; } = BookingSource.Web;

        // Media Details
        public string PlayedMediaTitle { get; set; } = string.Empty;
        public string PlayedMediaType { get; set; } = string.Empty; // "Movie" or "Game"

        // Audit Timestamps - Real-time sync වලදී දත්ත වල අලුත්ම තොරතුරු බැලීමට ඉතා වැදගත් වේ.
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

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

    public enum BookingSource
    {
        Web,
        WhatsApp,
        Manual,
        WalkIn,
        Admin
    }
}