using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Cinemac.Api.Data;
using Cinemac.Api.Models.Booking;
using Microsoft.AspNetCore.SignalR;      // ✅ ADD THIS
using Cinemac.Api.Hubs; 

namespace Cinemac.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<BookingHub> _hubContext;

        public BookingsController(AppDbContext context, IHubContext<BookingHub> hubContext)
        {
            _context = context;
             _hubContext = hubContext; 
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

            // Calculate price based on room's pricing type
            TimeSpan duration = request.EndTime - request.StartTime;
            decimal hours = (decimal)duration.TotalHours;
            
            decimal totalPrice = room.PricingType == PricingType.PerBooking
                ? room.Price  // flat rate regardless of duration
                : Math.Round(hours * room.Price, 2); // per-hour rate

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

             // ✅ ADD THIS — notify live grid after customer booking is saved
            await _hubContext.Clients.All.SendAsync(
                "ReceiveBookingUpdate",
                booking.Id,
                booking.Status.ToString()
            );
            Console.WriteLine($"[SignalR] New customer booking created: {booking.Id}");


            return CreatedAtAction(nameof(CreateBooking), new { id = booking.Id }, booking);
        }

        // GET: api/bookings/mybookings?email={email}
        [HttpGet("mybookings")]
        public async Task<IActionResult> GetUserBookings([FromQuery] string email)
        {
            if (string.IsNullOrEmpty(email))
            {
                return BadRequest("Email is required.");
            }

            var bookings = await _context.RoomBookings
                .Include(b => b.Room)
                .ThenInclude(r => r.Location)
                .Where(b => b.CustomerEmail.ToLower() == email.ToLower())
                .OrderByDescending(b => b.StartTime)
                .Select(b => new
                {
                    b.Id,
                    b.CustomerName,
                    b.CustomerEmail,
                    b.StartTime,
                    b.EndTime,
                    b.TotalPrice,
                    b.Status,
                    b.PlayedMediaTitle,
                    b.PlayedMediaType,
                    Room = b.Room == null ? null : new
                    {
                        b.Room.Id,
                        b.Room.Name,
                        b.Room.Price,
                        b.Room.PricingType,
                        Location = b.Room.Location == null ? null : new
                        {
                            b.Room.Location.Id,
                            b.Room.Location.Name
                        }
                    }
                })
                .ToListAsync();

            return Ok(bookings);
        }

        // PUT: api/bookings/{id}/cancel
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelBooking(Guid id)
        {
            var booking = await _context.RoomBookings.FindAsync(id);
            if (booking == null)
            {
                return NotFound("Booking not found.");
            }

            if (booking.Status == BookingStatus.Cancelled)
            {
                return BadRequest("Booking is already cancelled.");
            }

            booking.Status = BookingStatus.Cancelled;
            await _context.SaveChangesAsync();

            // ✅ ADD THIS — notify live grid after booking is cancelled
            await _hubContext.Clients.All.SendAsync(
                "ReceiveBookingUpdate",
                booking.Id,
                booking.Status.ToString()
            );
            Console.WriteLine($"[SignalR] Booking cancelled: {booking.Id}");

            return Ok(new { message = "Booking cancelled successfully." });
        }
    }
}
