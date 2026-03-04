using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using Cinemac.Api.Data;
using Cinemac.Api.Models;

namespace Cinemac.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public class RegisterDto
        {
            public string Username { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        public class LoginDto
        {
            public string Username { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto request)
        {
            if (await _context.Users.AnyAsync(u => u.Username == request.Username || u.Email == request.Email))
            {
                return BadRequest("Username or Email already taken.");
            }

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Registration successful" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto request)
        {
            string role = "User";
            string username = string.Empty;

            // 1. Check if it is an Admin
            var adminUser = await _context.AdminUsers.FirstOrDefaultAsync(u => u.Username == request.Username);
            if (adminUser != null && BCrypt.Net.BCrypt.Verify(request.Password, adminUser.PasswordHash))
            {
                role = "Admin";
                username = adminUser.Username;
            }
            else
            {
                // 2. Check if it is a regular User
                var regularUser = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
                if (regularUser != null && BCrypt.Net.BCrypt.Verify(request.Password, regularUser.PasswordHash))
                {
                    role = regularUser.Role;
                    username = regularUser.Username;
                }
                else
                {
                    return Unauthorized("Invalid credentials.");
                }
            }

            // Create JWT Token
            var secretKey = _configuration["Jwt:SecretKey"] ?? "super_secret_fallback_key_that_must_be_long_1234567890";
            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

            var authClaims = new[]
            {
                new Claim(ClaimTypes.Name, username),
                new Claim(ClaimTypes.Role, role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"] ?? "CinemacApi",
                audience: _configuration["Jwt:Audience"] ?? "CinemacClients",
                expires: DateTime.UtcNow.AddHours(12),
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
            );

            return Ok(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token),
                expiration = token.ValidTo,
                role = role,
                username = username
            });
        }
    }
}
