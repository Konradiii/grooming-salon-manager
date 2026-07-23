using GroomingSalonApi.Entities;
using Microsoft.EntityFrameworkCore;

namespace GroomingSalonApi.Infrastructure;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Owner> Owners => Set<Owner>();
    public DbSet<Dog> Dogs => Set<Dog>();
    public DbSet<Appointment> Appointments => Set<Appointment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Owner>(entity =>
        {
            entity.Property(o => o.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(o => o.LastName).IsRequired().HasMaxLength(100);
            entity.Property(o => o.PhoneNumber).IsRequired().HasMaxLength(20);
        });

        modelBuilder.Entity<Dog>(entity =>
        {
            entity.Property(d => d.Name).IsRequired().HasMaxLength(100);
            entity.Property(d => d.Breed).IsRequired().HasMaxLength(100);
            entity.Property(d => d.BehaviorNotes).IsRequired().HasMaxLength(1000);

            entity.HasOne(d => d.Owner)
                .WithMany(o => o.Dogs)
                .HasForeignKey(d => d.OwnerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.Property(a => a.Price).HasColumnType("decimal(10,2)");
            entity.Property(a => a.Notes).IsRequired().HasMaxLength(1000);

            entity.HasOne(a => a.Dog)
                .WithMany(d => d.Appointments)
                .HasForeignKey(a => a.DogId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
