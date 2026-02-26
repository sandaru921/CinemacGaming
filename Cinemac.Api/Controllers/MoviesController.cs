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
        [HttpGet("netflix")]
        public async Task<ActionResult<IEnumerable<Movie>>> GetNetflixMovies()
        {
            var movies = await _tmdbService.GetNetflixMoviesAsync();
            return Ok(movies);
        }
    }
}