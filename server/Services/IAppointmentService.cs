using GroomingSalonApi.DTOs;

namespace GroomingSalonApi.Services;

public interface IAppointmentService
{
    Task<List<AppointmentDto>> GetAllAsync();
    Task<AppointmentDto> GetByIdAsync(int id);
    Task<AppointmentDto> CreateAsync(AppointmentUpsertDto dto);
    Task<AppointmentDto> UpdateAsync(int id, AppointmentUpsertDto dto);
    Task DeleteAsync(int id);
}
