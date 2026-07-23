namespace GroomingSalonApi.Entities;

public class Dog
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Breed { get; set; } = string.Empty;
    public string BehaviorNotes { get; set; } = string.Empty;

    public int OwnerId { get; set; }
    public Owner Owner { get; set; } = null!;

    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}
