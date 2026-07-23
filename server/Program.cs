using System.Text;
using GroomingSalonApi.Infrastructure;
using GroomingSalonApi.Infrastructure.Middleware;
using GroomingSalonApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

Console.WriteLine("=== DEBUG: environment variables ===");
foreach (System.Collections.DictionaryEntry e in Environment.GetEnvironmentVariables())
{
    var key = e.Key?.ToString() ?? "";
    Console.WriteLine($"{key} = {e.Value}");
}
Console.WriteLine("=== END DEBUG ===");

if (args.Length == 2 && args[0] == "--generate-hash")
{
    var hasher = new PasswordHasher<object>();
    Console.WriteLine(hasher.HashPassword(new object(), args[1]));
    return;
}

var builder = WebApplication.CreateBuilder(args);

const string CorsPolicy = "ClientApp";

var jwtSecret = builder.Configuration["Auth:JwtSecret"]
    ?? throw new InvalidOperationException("Auth:JwtSecret must be configured.");

builder.Services.AddControllers(options =>
{
    options.Filters.Add(new AuthorizeFilter());
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IOwnerService, OwnerService>();
builder.Services.AddScoped<IDogService, DogService>();
builder.Services.AddScoped<IAppointmentService, AppointmentService>();
builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        };
    });
builder.Services.AddAuthorization();

var allowedOrigins = (builder.Configuration["Cors:AllowedOrigins"] ?? "http://localhost:5173")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicy, policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();
    if (app.Environment.IsDevelopment())
    {
        DbSeeder.Seed(db);
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors(CorsPolicy);
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
