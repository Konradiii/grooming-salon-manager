using GroomingSalonApi.DTOs;

namespace GroomingSalonApi.Services;

public interface IOwnerService
{
    Task<List<OwnerDto>> GetAllAsync();
    Task<OwnerDto> GetByIdAsync(int id);
    Task<OwnerDto> CreateAsync(OwnerUpsertDto dto);
    Task<OwnerDto> UpdateAsync(int id, OwnerUpsertDto dto);
    Task DeleteAsync(int id);
}
