using CryovoidServer;
using CryovoidServer.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers(); // Use API controllers only
builder.Services.AddSingleton<GameService>();       // your game service
builder.Services.AddHostedService<SimulationService>(); // simulation loop

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // React dev server
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("ReactPolicy");

app.UseHttpsRedirection();

app.MapControllers(); // Map API controllers only

app.Run();
