using Microsoft.EntityFrameworkCore;
using Cinemac.Api.Data;
using Cinemac.Api.Interfaces;
using Cinemac.Api.Repositories;
using Cinemac.Api.Services;

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

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();
app.MapControllers();

app.Run();
