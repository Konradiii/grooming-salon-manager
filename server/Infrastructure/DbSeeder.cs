using GroomingSalonApi.Entities;

namespace GroomingSalonApi.Infrastructure;

public static class DbSeeder
{
    public static void Seed(ApplicationDbContext context)
    {
        if (context.Owners.Any())
        {
            return;
        }

        var maria = new Owner { FirstName = "Maria", LastName = "Garcia", PhoneNumber = "555-0142" };
        var james = new Owner { FirstName = "James", LastName = "Nguyen", PhoneNumber = "555-0198" };
        context.Owners.AddRange(maria, james);
        context.SaveChanges();

        var biscuit = new Dog
        {
            Name = "Biscuit",
            Breed = "Golden Retriever",
            BehaviorNotes = "Friendly and calm, enjoys the dryer.",
            OwnerId = maria.Id,
        };
        var rocket = new Dog
        {
            Name = "Rocket",
            Breed = "Border Collie",
            BehaviorNotes = "High energy, needs frequent breaks.",
            OwnerId = james.Id,
        };
        context.Dogs.AddRange(biscuit, rocket);
        context.SaveChanges();

        var startOfWeek = DateTime.Today.AddDays(-(int)DateTime.Today.DayOfWeek + 1);

        context.Appointments.AddRange(
            new Appointment
            {
                DogId = biscuit.Id,
                StartTime = startOfWeek.AddHours(10),
                DurationMinutes = 60,
                Price = 55m,
                Notes = "Full groom + nail trim",
            },
            new Appointment
            {
                DogId = rocket.Id,
                StartTime = startOfWeek.AddDays(1).AddHours(13).AddMinutes(30),
                DurationMinutes = 90,
                Price = 75m,
                Notes = "Bath, brush out, and trim",
            }
        );
        context.SaveChanges();
    }
}
