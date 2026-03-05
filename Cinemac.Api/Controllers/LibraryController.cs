using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Cinemac.Api.Data;
using Cinemac.Api.Models;
using System.Security.Claims;

namespace Cinemac.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // All endpoints require standard user authentication
    public class LibraryController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LibraryController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Library
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserLibraryItem>>> GetUserLibrary()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var library = await _context.UserLibraryItems
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.AddedAt)
                .ToListAsync();

            return Ok(library);
        }

        public class LibraryItemDto
        {
            public string MediaId { get; set; } = string.Empty;
            public string MediaTitle { get; set; } = string.Empty;
            public string MediaType { get; set; } = string.Empty;
            public string PosterUrl { get; set; } = string.Empty;
        }

        // POST: api/Library
        [HttpPost]
        public async Task<ActionResult<UserLibraryItem>> AddToLibrary([FromBody] LibraryItemDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            // Prevent duplicates
            var exists = await _context.UserLibraryItems
                .AnyAsync(x => x.UserId == userId && x.MediaId == dto.MediaId && x.MediaType == dto.MediaType);

            if (exists)
                return Conflict("Item is already in the library.");

            var newItem = new UserLibraryItem
            {
                UserId = userId,
                MediaId = dto.MediaId,
                MediaTitle = dto.MediaTitle,
                MediaType = dto.MediaType,
                PosterUrl = dto.PosterUrl,
                AddedAt = DateTime.UtcNow
            };

            _context.UserLibraryItems.Add(newItem);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUserLibrary), new { id = newItem.Id }, newItem);
        }

        // DELETE: api/Library/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> RemoveFromLibrary(int id)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var item = await _context.UserLibraryItems.FindAsync(id);
            if (item == null)
                return NotFound();

            if (item.UserId != userId)
                return Forbid();

            _context.UserLibraryItems.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/Library/bulk
        [HttpPost("bulk")]
        public async Task<IActionResult> BulkSyncLibrary([FromBody] List<LibraryItemDto> items)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            int addedCount = 0;

            // Simple loop to add missing ones
            foreach (var dto in items)
            {
                var exists = await _context.UserLibraryItems
                    .AnyAsync(x => x.UserId == userId && x.MediaId == dto.MediaId && x.MediaType == dto.MediaType);

                if (!exists)
                {
                    _context.UserLibraryItems.Add(new UserLibraryItem
                    {
                        UserId = userId,
                        MediaId = dto.MediaId,
                        MediaTitle = dto.MediaTitle,
                        MediaType = dto.MediaType,
                        PosterUrl = dto.PosterUrl,
                        AddedAt = DateTime.UtcNow
                    });
                    addedCount++;
                }
            }

            if (addedCount > 0)
            {
                await _context.SaveChangesAsync();
            }

            return Ok(new { SyncedItems = addedCount });
        }
    }
}
