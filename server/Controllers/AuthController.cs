using GroomingSalonApi.DTOs;
using GroomingSalonApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GroomingSalonApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public ActionResult<LoginResponseDto> Login(LoginRequestDto dto)
    {
        var result = _authService.Login(dto.Username, dto.Password);
        if (result is null)
        {
            return Unauthorized(new { error = "Invalid username or password." });
        }
        return Ok(result);
    }
}
