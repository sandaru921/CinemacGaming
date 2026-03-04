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
    public class AdminLocationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminLocationsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/admin/locations
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Location>>> GetLocations()
        {
            return await _context.Locations.Include(l => l.Rooms).ToListAsync();
        }

        // POST: api/admin/locations
        [HttpPost]
        public async Task<ActionResult<Location>> CreateLocation([FromBody] Location location)
        {
            location.Id = Guid.NewGuid();
            _context.Locations.Add(location);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetLocations), new { id = location.Id }, location);
        }

        // PUT: api/admin/locations/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLocation(Guid id, [FromBody] Location location)
        {
            if (id != location.Id) return BadRequest();

            _context.Entry(location).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!LocationExists(id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        // DELETE: api/admin/locations/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLocation(Guid id)
        {
            var location = await _context.Locations.FindAsync(id);
            if (location == null) return NotFound();

            // Rooms and Bookings will cascade delete based on EF Core config
            _context.Locations.Remove(location);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool LocationExists(Guid id)
        {
            return _context.Locations.Any(e => e.Id == id);
        }
    }
}
