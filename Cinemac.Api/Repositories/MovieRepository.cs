using Cinemac.Api.Data;
using Cinemac.Api.Interfaces;
using Cinemac.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Cinemac.Api.Repositories
{
    public class MovieRepository : IMovieRepository
    {
        private readonly AppDbContext _context;

        public MovieRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Movie>> GetAllMoviesAsync()
        {
            // Stored Procedure එක call කරන විදිය
            return await _context.Movies
                .FromSqlRaw("SELECT * FROM get_all_movies()")
                .ToListAsync();
        }
    }
}