using System.ComponentModel.DataAnnotations;
using GroomingSalonApi.Utils;

namespace GroomingSalonApi.DTOs;

public class OwnerDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public int DogCount { get; set; }
}

public class OwnerUpsertDto
{
    [Required, StringLength(100, MinimumLength = 1)]
    public string FirstName { get; set; } = string.Empty;

    [Required, StringLength(100, MinimumLength = 1)]
    public string LastName { get; set; } = string.Empty;

    [Required, PhoneNumber]
    public string PhoneNumber { get; set; } = string.Empty;
}
