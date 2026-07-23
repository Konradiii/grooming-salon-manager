using GroomingSalonApi.DTOs;
using GroomingSalonApi.Entities;
using GroomingSalonApi.Exceptions;
using GroomingSalonApi.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace GroomingSalonApi.Services;

public class DogService : IDogService
{
    private readonly ApplicationDbContext _context;

    public DogService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<DogDto>> GetAllAsync()
    {
        var dogs = await _context.Dogs
            .Include(d => d.Owner)
            .OrderBy(d => d.Name)
            .ToListAsync();

        return dogs.Select(ToDto).ToList();
    }

    public async Task<DogDto> GetByIdAsync(int id)
    {
        var dog = await FindDogAsync(id);
        return ToDto(dog);
    }

    public async Task<DogDto> CreateAsync(DogUpsertDto dto)
    {
        await EnsureOwnerExistsAsync(dto.OwnerId);

        var dog = new Dog
        {
            Name = dto.Name.Trim(),
            Breed = dto.Breed.Trim(),
            BehaviorNotes = dto.BehaviorNotes.Trim(),
            OwnerId = dto.OwnerId,
        };

        _context.Dogs.Add(dog);
        await _context.SaveChangesAsync();

        return ToDto(await FindDogAsync(dog.Id));
    }

    public async Task<DogDto> UpdateAsync(int id, DogUpsertDto dto)
    {
        var dog = await FindDogAsync(id);
        await EnsureOwnerExistsAsync(dto.OwnerId);

        dog.Name = dto.Name.Trim();
        dog.Breed = dto.Breed.Trim();
        dog.BehaviorNotes = dto.BehaviorNotes.Trim();
        dog.OwnerId = dto.OwnerId;

        await _context.SaveChangesAsync();

        return ToDto(await FindDogAsync(dog.Id));
    }

    public async Task DeleteAsync(int id)
    {
        var dog = await FindDogAsync(id);
        _context.Dogs.Remove(dog);
        await _context.SaveChangesAsync();
    }

    private async Task<Dog> FindDogAsync(int id)
    {
        return await _context.Dogs.Include(d => d.Owner).FirstOrDefaultAsync(d => d.Id == id)
            ?? throw new NotFoundException($"Dog with id {id} was not found.");
    }

    private async Task EnsureOwnerExistsAsync(int ownerId)
    {
        var exists = await _context.Owners.AnyAsync(o => o.Id == ownerId);
        if (!exists)
        {
            throw new BadRequestException("Owner does not exist.");
        }
    }

    private static DogDto ToDto(Dog dog)
    {
        return new DogDto
        {
            Id = dog.Id,
            Name = dog.Name,
            Breed = dog.Breed,
            BehaviorNotes = dog.BehaviorNotes,
            OwnerId = dog.OwnerId,
            OwnerFirstName = dog.Owner.FirstName,
            OwnerLastName = dog.Owner.LastName,
            OwnerPhoneNumber = dog.Owner.PhoneNumber,
        };
    }
}
