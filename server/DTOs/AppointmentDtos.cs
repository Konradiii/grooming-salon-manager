using System.ComponentModel.DataAnnotations;

namespace GroomingSalonApi.DTOs;

public class AppointmentDto
{
    public int Id { get; set; }
    public DateTime StartTime { get; set; }
    public int DurationMinutes { get; set; }
    public decimal Price { get; set; }
    public string Notes { get; set; } = string.Empty;

    public int DogId { get; set; }
    public string DogName { get; set; } = string.Empty;
    public string DogBreed { get; set; } = string.Empty;
    public string OwnerFirstName { get; set; } = string.Empty;
    public string OwnerLastName { get; set; } = string.Empty;
    public string OwnerPhoneNumber { get; set; } = string.Empty;
}

public class AppointmentUpsertDto
{
    [Required, Range(1, int.MaxValue, ErrorMessage = "A dog must be selected")]
    public int DogId { get; set; }

    [Required]
    public DateTime StartTime { get; set; }

    [Required, Range(15, 480, ErrorMessage = "Duration must be between 15 minutes and 8 hours")]
    public int DurationMinutes { get; set; }

    [Required, Range(0, 100000, ErrorMessage = "Price cannot be negative")]
    public decimal Price { get; set; }

    [StringLength(1000)]
    public string Notes { get; set; } = string.Empty;
}
