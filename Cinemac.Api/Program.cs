using Microsoft.EntityFrameworkCore;
using Cinemac.Api.Data;
using Cinemac.Api.Interfaces;
using Cinemac.Api.Repositories;
using Cinemac.Api.Services;
using Cinemac.Api.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Cinemac.Api.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Connection String එක කියවා ගැනීම
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Postgres පාවිච්චි කරන ලෙස App එකට පැවසීම
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// Add services to the container.
builder.Services.AddSignalR();
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Repository එක Register කිරීම
builder.Services.AddScoped<IMovieRepository, MovieRepository>();

// Service එක Register කිරීම
builder.Services.AddScoped<MovieService>();

// HttpClient එක Register කිරීම
builder.Services.AddHttpClient();

// TMDBService එක Register කිරීම
builder.Services.AddScoped<ITMDBService, TMDBService>();

// ImageService (Cloudinary) Register කිරීම
builder.Services.AddScoped<IImageService, CloudinaryService>();

// ✅ CORS — specific origins required when using AllowCredentials (SignalR needs this)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:3000",
                "https://localhost:3000",
                "https://cinemac-gaming.vercel.app"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials(); // ✅ required for SignalR WebSocket
    });
});

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

    // ✅ Allow SignalR to read JWT from query string (needed for WebSocket transport)
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

var app = builder.Build();

// Seed initial data
Cinemac.Api.Data.DbSeeder.SeedLocationsAndRooms(app);

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend"); // ✅ CORS before Authentication and MapHub

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<BookingHub>("/hubs/bookings"); // ✅ single hub registration, consistent URL

app.Run();