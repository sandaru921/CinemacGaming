using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Cinemac.Api.Data;

namespace Cinemac.Api.Controllers
{
    [ApiController]
    [Route("api/admin/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminAnalyticsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminAnalyticsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<object>> GetAnalytics([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate, [FromQuery] Guid? locationId)
        {
            var query = _context.RoomBookings
                .Include(b => b.Room)
                .ThenInclude(r => r.Location)
                .AsQueryable();

            if (startDate.HasValue)
            {
                query = query.Where(b => b.StartTime >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(b => b.EndTime <= endDate.Value);
            }

            if (locationId.HasValue && locationId.Value != Guid.Empty)
            {
                query = query.Where(b => b.Room != null && b.Room.LocationId == locationId.Value);
            }

            var bookings = await query.ToListAsync();

            var totalRevenue = bookings.Sum(b => b.TotalPrice);
            var totalBookings = bookings.Count;

            var mostVisitedLocation = bookings
                .Where(b => b.Room != null && b.Room.Location != null)
                .GroupBy(b => b.Room!.Location!.Name)
                .OrderByDescending(g => g.Count())
                .Select(g => new { LocationName = g.Key, Visits = g.Count() })
                .FirstOrDefault();

            var rushHours = bookings
                .GroupBy(b => b.StartTime.Hour)
                .Select(g => new { Hour = g.Key, Count = g.Count() })
                .OrderBy(g => g.Hour)
                .ToList();

            var popularRooms = bookings
                .Where(b => b.Room != null)
                .GroupBy(b => b.Room!.Name)
                .Select(g => new { RoomName = g.Key, BookingsCount = g.Count() })
                .OrderByDescending(g => g.BookingsCount)
                .Take(5)
                .ToList();

            return Ok(new
            {
                TotalRevenue = totalRevenue,
                TotalBookings = totalBookings,
                MostVisitedLocation = mostVisitedLocation?.LocationName ?? "N/A",
                RushHours = rushHours,
                PopularRooms = popularRooms
            });
        }
    }
}
