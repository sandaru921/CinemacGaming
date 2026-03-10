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
            public decimal Price { get; set; }
            public PricingType PricingType { get; set; } = PricingType.PerHour;
        }

         // ✅ GET: api/admin/AdminRooms
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Room>>> GetRooms()
        {
            var rooms = await _context.Rooms
                .Include(r => r.Location)
                .OrderBy(r => r.Name)
                .ToListAsync();
            return Ok(rooms);
        }

        // ✅ GET: api/admin/AdminRooms/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Room>> GetRoom(Guid id)
        {
            var room = await _context.Rooms
                .Include(r => r.Location)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (room == null) return NotFound();
            return Ok(room);
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
                Price = request.Price,
                PricingType = request.PricingType
            };

            _context.Rooms.Add(room);
            await _context.SaveChangesAsync();

            return Ok(room);
        }

        // PUT: api/admin/rooms/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRoom(Guid id, [FromBody] CreateRoomDto request)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null) return NotFound();

            room.Name = request.Name;
            room.Price = request.Price;
            room.PricingType = request.PricingType;

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
