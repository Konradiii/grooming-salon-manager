using GroomingSalonApi.DTOs;

namespace GroomingSalonApi.Services;

public interface IDogService
{
    Task<List<DogDto>> GetAllAsync();
    Task<DogDto> GetByIdAsync(int id);
    Task<DogDto> CreateAsync(DogUpsertDto dto);
    Task<DogDto> UpdateAsync(int id, DogUpsertDto dto);
    Task DeleteAsync(int id);
}
