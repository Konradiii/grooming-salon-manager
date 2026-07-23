using GroomingSalonApi.DTOs;

namespace GroomingSalonApi.Services;

public interface IAuthService
{
    LoginResponseDto? Login(string username, string password);
}
