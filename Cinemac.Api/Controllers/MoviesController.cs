using Cinemac.Api.Interfaces;
using Cinemac.Api.Models;
using Cinemac.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Cinemac.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // මෙතනදී URL එක වෙන්නේ api/movies කියන එකයි
    public class MoviesController(MovieService movieService, ITMDBService tmdbService) : ControllerBase
    {
        private readonly MovieService _movieService = movieService;
        private readonly ITMDBService _tmdbService = tmdbService;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Movie>>> GetMovies()
        {
            var movies = await _movieService.GetAllMoviesAsync();
            return Ok(movies);
        }
        // 1. Netflix ලැයිස්තුව ලබා දෙන Endpoint එක
      // The Netflix endpoint
[HttpGet("netflix")]
public async Task<ActionResult<IEnumerable<Movie>>> GetNetflixMovies([FromQuery] int page = 1)
{
    var movies = await _tmdbService.GetNetflixMoviesAsync(page);
    return Ok(movies);
}

// A dynamic endpoint that accepts ANY genre ID!
// E.g., /api/movies/genre/28 for Action, /api/movies/genre/27 for Horror
[HttpGet("genre/{genreId}")]
public async Task<ActionResult<IEnumerable<Movie>>> GetMoviesByGenre(int genreId, [FromQuery] int page = 1)
{
    // Pass the genreId directly to our service
    var movies = await _tmdbService.GetMoviesByGenreAsync(genreId, page); 
    return Ok(movies);
}

// Endpoint to handle the live search bar
[HttpGet("search")]
public async Task<ActionResult<IEnumerable<Movie>>> SearchMovies([FromQuery] string q, [FromQuery] int page = 1)
{
    if (string.IsNullOrWhiteSpace(q)) 
    {
        return Ok(new List<Movie>());
    }

    var movies = await _tmdbService.SearchMoviesAsync(q, page);
    return Ok(movies);
}

[HttpGet("{id}")]
public async Task<ActionResult<Movie>> GetMovieDetails(int id)
{
    var movie = await _tmdbService.GetMovieDetailsAsync(id);
    return Ok(movie);
}

    }
}