using GroomingSalonApi.DTOs;
using GroomingSalonApi.Entities;
using GroomingSalonApi.Exceptions;
using GroomingSalonApi.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace GroomingSalonApi.Services;

public class AppointmentService : IAppointmentService
{
    private readonly ApplicationDbContext _context;

    public AppointmentService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<AppointmentDto>> GetAllAsync()
    {
        var appointments = await _context.Appointments
            .Include(a => a.Dog).ThenInclude(d => d.Owner)
            .OrderBy(a => a.StartTime)
            .ToListAsync();

        return appointments.Select(ToDto).ToList();
    }

    public async Task<AppointmentDto> GetByIdAsync(int id)
    {
        var appointment = await FindAppointmentAsync(id);
        return ToDto(appointment);
    }

    public async Task<AppointmentDto> CreateAsync(AppointmentUpsertDto dto)
    {
        await EnsureDogExistsAsync(dto.DogId);

        var appointment = new Appointment
        {
            DogId = dto.DogId,
            StartTime = dto.StartTime,
            DurationMinutes = dto.DurationMinutes,
            Price = dto.Price,
            Notes = dto.Notes.Trim(),
        };

        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();

        return ToDto(await FindAppointmentAsync(appointment.Id));
    }

    public async Task<AppointmentDto> UpdateAsync(int id, AppointmentUpsertDto dto)
    {
        var appointment = await FindAppointmentAsync(id);
        await EnsureDogExistsAsync(dto.DogId);

        appointment.DogId = dto.DogId;
        appointment.StartTime = dto.StartTime;
        appointment.DurationMinutes = dto.DurationMinutes;
        appointment.Price = dto.Price;
        appointment.Notes = dto.Notes.Trim();

        await _context.SaveChangesAsync();

        return ToDto(await FindAppointmentAsync(appointment.Id));
    }

    public async Task DeleteAsync(int id)
    {
        var appointment = await FindAppointmentAsync(id);
        _context.Appointments.Remove(appointment);
        await _context.SaveChangesAsync();
    }

    private async Task<Appointment> FindAppointmentAsync(int id)
    {
        return await _context.Appointments
            .Include(a => a.Dog).ThenInclude(d => d.Owner)
            .FirstOrDefaultAsync(a => a.Id == id)
            ?? throw new NotFoundException($"Appointment with id {id} was not found.");
    }

    private async Task EnsureDogExistsAsync(int dogId)
    {
        var exists = await _context.Dogs.AnyAsync(d => d.Id == dogId);
        if (!exists)
        {
            throw new BadRequestException("Dog does not exist.");
        }
    }

    private static AppointmentDto ToDto(Appointment appointment)
    {
        return new AppointmentDto
        {
            Id = appointment.Id,
            StartTime = appointment.StartTime,
            DurationMinutes = appointment.DurationMinutes,
            Price = appointment.Price,
            Notes = appointment.Notes,
            DogId = appointment.DogId,
            DogName = appointment.Dog.Name,
            DogBreed = appointment.Dog.Breed,
            OwnerFirstName = appointment.Dog.Owner.FirstName,
            OwnerLastName = appointment.Dog.Owner.LastName,
            OwnerPhoneNumber = appointment.Dog.Owner.PhoneNumber,
        };
    }
}
