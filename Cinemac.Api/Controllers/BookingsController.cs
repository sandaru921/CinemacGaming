using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Cinemac.Api.Data;
using Cinemac.Api.Models.Booking;

namespace Cinemac.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BookingsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/bookings/locations
        [HttpGet("locations")]
        public async Task<ActionResult<IEnumerable<Location>>> GetLocations()
        {
            return await _context.Locations
                .Include(l => l.Rooms)
                .ToListAsync();
        }

        // GET: api/bookings/availability?roomId={id}&date={date}
        [HttpGet("availability")]
        public async Task<ActionResult<IEnumerable<RoomBooking>>> GetAvailability([FromQuery] Guid roomId, [FromQuery] DateTime date)
        {
            // PostgreSQL requires explicit UTC types
            var startOfDay = DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);
            var endOfDay = startOfDay.AddDays(1);

            return await _context.RoomBookings
                .Where(b => b.RoomId == roomId 
                         && b.StartTime >= startOfDay 
                         && b.StartTime < endOfDay 
                         && b.Status != BookingStatus.Cancelled)
                .OrderBy(b => b.StartTime)
                .ToListAsync();
        }

        public class CreateBookingDto
        {
            public Guid RoomId { get; set; }
            public string CustomerName { get; set; } = string.Empty;
            public string CustomerEmail { get; set; } = string.Empty;
            public DateTime StartTime { get; set; }
            public DateTime EndTime { get; set; }
            public string PlayedMediaTitle { get; set; } = string.Empty;
            public string PlayedMediaType { get; set; } = string.Empty;
        }

        // POST: api/bookings
        [HttpPost]
        public async Task<ActionResult<RoomBooking>> CreateBooking([FromBody] CreateBookingDto request)
        {
            var room = await _context.Rooms.FindAsync(request.RoomId);
            if (room == null)
            {
                return NotFound("Room not found.");
            }

            if (request.EndTime <= request.StartTime)
            {
                return BadRequest("EndTime must be after StartTime.");
            }

            // Check for overlap to prevent double bookings
            var overlappingBooking = await _context.RoomBookings
                .Where(b => b.RoomId == request.RoomId 
                         && b.Status != BookingStatus.Cancelled
                         && b.StartTime < request.EndTime
                         && b.EndTime > request.StartTime)
                .FirstOrDefaultAsync();

            if (overlappingBooking != null)
            {
                return Conflict("The requested time slot is unavailable. It overlaps with an existing booking.");
            }

            // Calculate exact duration
            TimeSpan duration = request.EndTime - request.StartTime;
            decimal hours = (decimal)duration.TotalHours;
            
            // For example, if BasePricePerHour is 1000, 2.5 hours = 2500
            decimal totalPrice = Math.Round(hours * room.BasePricePerHour, 2);

            var booking = new RoomBooking
            {
                RoomId = request.RoomId,
                CustomerName = request.CustomerName,
                CustomerEmail = request.CustomerEmail,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                TotalPrice = totalPrice,
                Status = BookingStatus.Confirmed,
                PlayedMediaTitle = request.PlayedMediaTitle,
                PlayedMediaType = request.PlayedMediaType
            };

            _context.RoomBookings.Add(booking);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(CreateBooking), new { id = booking.Id }, booking);
        }
    }
}
