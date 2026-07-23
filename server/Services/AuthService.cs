using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using GroomingSalonApi.DTOs;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace GroomingSalonApi.Services;

public class AuthService : IAuthService
{
    private readonly IConfiguration _config;
    private readonly PasswordHasher<object> _hasher = new();

    public AuthService(IConfiguration config)
    {
        _config = config;
    }

    public LoginResponseDto? Login(string username, string password)
    {
        var configUsername = _config["Auth:Username"];
        var configHash = _config["Auth:PasswordHash"];

        if (string.IsNullOrEmpty(configUsername) || string.IsNullOrEmpty(configHash))
        {
            throw new InvalidOperationException("Auth:Username and Auth:PasswordHash must be configured.");
        }

        if (!string.Equals(username, configUsername, StringComparison.Ordinal))
        {
            return null;
        }

        var result = _hasher.VerifyHashedPassword(new object(), configHash, password);
        if (result == PasswordVerificationResult.Failed)
        {
            return null;
        }

        var expiryHours = double.TryParse(_config["Auth:TokenExpiryHours"], out var hours) ? hours : 12;
        var expiresAt = DateTime.UtcNow.AddHours(expiryHours);
        var token = GenerateToken(username, expiresAt);

        return new LoginResponseDto { Token = token, Username = username, ExpiresAt = expiresAt };
    }

    private string GenerateToken(string username, DateTime expiresAt)
    {
        var secret = _config["Auth:JwtSecret"]
            ?? throw new InvalidOperationException("Auth:JwtSecret must be configured.");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[] { new Claim(ClaimTypes.Name, username) };

        var token = new JwtSecurityToken(
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
