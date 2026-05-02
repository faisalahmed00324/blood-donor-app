using BloodDonor.Domain.Enums;

namespace BloodDonor.Domain.Entities;

public sealed class Notification
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public NotificationType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? ActionUrl { get; set; }
    public bool IsRead { get; set; }
    public NotificationChannel Channel { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public User User { get; set; } = null!;
}
