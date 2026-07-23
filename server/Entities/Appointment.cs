namespace GroomingSalonApi.Entities;

public class Appointment
{
    public int Id { get; set; }
    public DateTime StartTime { get; set; }
    public int DurationMinutes { get; set; }
    public decimal Price { get; set; }
    public string Notes { get; set; } = string.Empty;

    public int DogId { get; set; }
    public Dog Dog { get; set; } = null!;
}
