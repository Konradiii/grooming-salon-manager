using GroomingSalonApi.DTOs;
using GroomingSalonApi.Entities;
using GroomingSalonApi.Exceptions;
using GroomingSalonApi.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace GroomingSalonApi.Services;

public class OwnerService : IOwnerService
{
    private readonly ApplicationDbContext _context;

    public OwnerService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<OwnerDto>> GetAllAsync()
    {
        var owners = await _context.Owners
            .Include(o => o.Dogs)
            .OrderBy(o => o.LastName).ThenBy(o => o.FirstName)
            .ToListAsync();

        return owners.Select(ToDto).ToList();
    }

    public async Task<OwnerDto> GetByIdAsync(int id)
    {
        var owner = await FindOwnerAsync(id);
        return ToDto(owner);
    }

    public async Task<OwnerDto> CreateAsync(OwnerUpsertDto dto)
    {
        var owner = new Owner
        {
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            PhoneNumber = dto.PhoneNumber.Trim(),
        };

        _context.Owners.Add(owner);
        await _context.SaveChangesAsync();

        return ToDto(owner);
    }

    public async Task<OwnerDto> UpdateAsync(int id, OwnerUpsertDto dto)
    {
        var owner = await FindOwnerAsync(id);

        owner.FirstName = dto.FirstName.Trim();
        owner.LastName = dto.LastName.Trim();
        owner.PhoneNumber = dto.PhoneNumber.Trim();

        await _context.SaveChangesAsync();

        return ToDto(owner);
    }

    public async Task DeleteAsync(int id)
    {
        var owner = await FindOwnerAsync(id);
        _context.Owners.Remove(owner);
        await _context.SaveChangesAsync();
    }

    private async Task<Owner> FindOwnerAsync(int id)
    {
        return await _context.Owners.Include(o => o.Dogs).FirstOrDefaultAsync(o => o.Id == id)
            ?? throw new NotFoundException($"Owner with id {id} was not found.");
    }

    private static OwnerDto ToDto(Owner owner)
    {
        return new OwnerDto
        {
            Id = owner.Id,
            FirstName = owner.FirstName,
            LastName = owner.LastName,
            PhoneNumber = owner.PhoneNumber,
            DogCount = owner.Dogs.Count,
        };
    }
}
