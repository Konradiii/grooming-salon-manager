using System.ComponentModel.DataAnnotations;

namespace GroomingSalonApi.DTOs;

public class DogDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Breed { get; set; } = string.Empty;
    public string BehaviorNotes { get; set; } = string.Empty;

    public int OwnerId { get; set; }
    public string OwnerFirstName { get; set; } = string.Empty;
    public string OwnerLastName { get; set; } = string.Empty;
    public string OwnerPhoneNumber { get; set; } = string.Empty;
}

public class DogUpsertDto
{
    [Required, StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    [Required, StringLength(100, MinimumLength = 1)]
    public string Breed { get; set; } = string.Empty;

    [StringLength(1000)]
    public string BehaviorNotes { get; set; } = string.Empty;

    [Required, Range(1, int.MaxValue, ErrorMessage = "An owner must be selected")]
    public int OwnerId { get; set; }
}
