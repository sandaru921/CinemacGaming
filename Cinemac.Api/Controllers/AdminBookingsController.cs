using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Cinemac.Api.Data;
using Cinemac.Api.Models.Booking;

namespace Cinemac.Api.Controllers
{
    [ApiController]
    [Route("api/admin/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminBookingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminBookingsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/admin/bookings
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
                    b.StartTime,
                    b.EndTime,
                    b.TotalPrice,
                    b.Status
                })
                .ToListAsync();

            return Ok(bookings);
        }

        public class UpdateStatusDto
        {
            public BookingStatus Status { get; set; }
        }

        // PUT: api/admin/bookings/{id}/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateBookingStatus(Guid id, [FromBody] UpdateStatusDto request)
        {
            var booking = await _context.RoomBookings.FindAsync(id);
            if (booking == null) return NotFound();

            booking.Status = request.Status;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/admin/bookings/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBooking(Guid id)
        {
            var booking = await _context.RoomBookings.FindAsync(id);
            if (booking == null) return NotFound();

            _context.RoomBookings.Remove(booking);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
