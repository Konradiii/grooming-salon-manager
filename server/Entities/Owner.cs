namespace GroomingSalonApi.Entities;

public class Owner
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;

    public ICollection<Dog> Dogs { get; set; } = new List<Dog>();
}
