using Microsoft.EntityFrameworkCore;
using Cinemac.Api.Data;
using Cinemac.Api.Interfaces;
using Cinemac.Api.Repositories;
using Cinemac.Api.Services;
using Cinemac.Api.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);



// Connection String එක කියවා ගැනීම
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Postgres පාවිච්චි කරන ලෙස App එකට පැවසීම
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 1. Repository එක Register කිරීම
// කවුරුහරි IMovieRepository එකක් ඉල්ලුවොත් MovieRepository එකක් ලබා දෙන්න
builder.Services.AddScoped<IMovieRepository, MovieRepository>();

// 2. Service එක Register කිරීම
builder.Services.AddScoped<MovieService>();

// 1. HttpClient එක Register කිරීම (API එකකට කතා කරන්න මේක අනිවාර්යයි)
builder.Services.AddHttpClient();

// 2. TMDBService එක Register කිරීම
builder.Services.AddScoped<ITMDBService, TMDBService>();

// 3. ImageService (Cloudinary) Register කිරීම
builder.Services.AddScoped<IImageService, CloudinaryService>();

// Configure JWT Authentication
var jwtSecret = builder.Configuration["Jwt:SecretKey"] ?? "super_secret_fallback_key_that_must_be_long_1234567890";
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "CinemacApi",
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "CinemacClients",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
    };
});

var app = builder.Build();

// Seed initial bookings data (Locations & 5 Rooms)
Cinemac.Api.Data.DbSeeder.SeedLocationsAndRooms(app);

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Enable CORS for frontend
app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
