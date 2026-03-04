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
    public class AdminRoomsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminRoomsController(AppDbContext context)
        {
            _context = context;
        }

        public class CreateRoomDto
        {
            public Guid LocationId { get; set; }
            public string Name { get; set; } = string.Empty;
            public decimal BasePricePerHour { get; set; }
        }

        // POST: api/admin/rooms
        [HttpPost]
        public async Task<ActionResult<Room>> CreateRoom([FromBody] CreateRoomDto request)
        {
            var locationExists = await _context.Locations.AnyAsync(l => l.Id == request.LocationId);
            if (!locationExists) return NotFound("Location not found.");

            var room = new Room
            {
                Id = Guid.NewGuid(),
                LocationId = request.LocationId,
                Name = request.Name,
                BasePricePerHour = request.BasePricePerHour
            };

            _context.Rooms.Add(room);
            await _context.SaveChangesAsync();

            return Ok(room);
        }

        // PUT: api/admin/rooms/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRoom(Guid id, [FromBody] Room request)
        {
            if (id != request.Id) return BadRequest();

            var room = await _context.Rooms.FindAsync(id);
            if (room == null) return NotFound();

            room.Name = request.Name;
            room.BasePricePerHour = request.BasePricePerHour;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/admin/rooms/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoom(Guid id)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null) return NotFound();

            _context.Rooms.Remove(room);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
