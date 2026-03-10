using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Cinemac.Api.Data;
using Cinemac.Api.Models.Booking;
using Cinemac.Api.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Cinemac.Api.Controllers
{
    [ApiController]
    [Route("api/admin/[controller]")]
    // [Authorize(Roles = "Admin")]
    public class AdminBookingsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<BookingHub> _hubContext;

        public AdminBookingsController(AppDbContext context, IHubContext<BookingHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetAllBookings()
        {
            var bookings = await _context.RoomBookings
                .Include(b => b.Room)
                .ThenInclude(r => r.Location)
                .OrderByDescending(b => b.StartTime)
                .Select(b => new
                {
                    b.Id,
                    LocationName = b.Room.Location.Name,
                    RoomName = b.Room.Name,
                    b.CustomerName,
                    b.CustomerEmail,
                    b.CustomerPhone,
                    b.StartTime,
                    b.EndTime,
                    b.TotalPrice,
                    Status = b.Status.ToString(),
                    b.PlayedMediaTitle,
                    b.PlayedMediaType,
                    Source = b.Source.ToString(),
                    b.CreatedAt,
                    b.UpdatedAt
                })
                .ToListAsync();

            return Ok(bookings);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBooking(Guid id, [FromBody] UpdateBookingRequest request)
        {
            var booking = await _context.RoomBookings
                .Include(b => b.Room)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null) return NotFound();

            if (request.EndTime <= request.StartTime)
                return BadRequest("EndTime must be after StartTime.");

            // Check for overlap with other bookings in the same room (exclude self)
            var overlap = await _context.RoomBookings
                .AnyAsync(b =>
                    b.Id != id &&
                    b.RoomId == booking.RoomId &&
                    b.Status != BookingStatus.Cancelled &&
                    b.StartTime < request.EndTime &&
                    b.EndTime > request.StartTime);

            if (overlap)
                return Conflict("The requested time slot overlaps with an existing booking.");

            // Recalculate price
            var room = booking.Room!;
            TimeSpan duration = request.EndTime - request.StartTime;
            decimal hours = (decimal)duration.TotalHours;
            decimal totalPrice = room.PricingType == PricingType.PerBooking
                ? room.Price
                : Math.Round(hours * room.Price, 2);

            booking.CustomerName = request.CustomerName;
            booking.CustomerEmail = request.CustomerEmail;
            booking.CustomerPhone = request.CustomerPhone;
            booking.StartTime = request.StartTime;
            booking.EndTime = request.EndTime;
            booking.PlayedMediaTitle = request.PlayedMediaTitle ?? string.Empty;
            booking.PlayedMediaType = request.PlayedMediaType ?? string.Empty;
            booking.TotalPrice = totalPrice;
            booking.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveBookingUpdate", id, booking.Status.ToString());

            return Ok(new
            {
                booking.Id,
                booking.CustomerName,
                booking.CustomerEmail,
                booking.CustomerPhone,
                booking.StartTime,
                booking.EndTime,
                booking.TotalPrice,
                Status = booking.Status.ToString(),
                booking.PlayedMediaTitle,
                booking.PlayedMediaType,
                booking.UpdatedAt
            });
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateStatusRequest request)
        {
            var booking = await _context.RoomBookings.FindAsync(id);
            if (booking == null) return NotFound();

            booking.Status = request.Status;
            booking.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            string statusString = request.Status.ToString();
            await _hubContext.Clients.All.SendAsync("ReceiveBookingUpdate", id, statusString);

            return Ok(new { message = "Status updated", currentStatus = statusString });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBooking(Guid id)
        {
            var booking = await _context.RoomBookings.FindAsync(id);
            if (booking == null) return NotFound();

            _context.RoomBookings.Remove(booking);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("BookingDeleted", id);

            return NoContent();
        }

        public class UpdateStatusRequest
        {
            public BookingStatus Status { get; set; }
        }

        public class UpdateBookingRequest
        {
            public string CustomerName { get; set; } = string.Empty;
            public string? CustomerEmail { get; set; }
            public string? CustomerPhone { get; set; }
            public DateTime StartTime { get; set; }
            public DateTime EndTime { get; set; }
            public string? PlayedMediaTitle { get; set; }
            public string? PlayedMediaType { get; set; }
        }
    }
}