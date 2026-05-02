using BloodDonor.Domain.Enums;

namespace BloodDonor.Application.Features.Notifications;

public sealed record NotificationDto(
    Guid Id,
    NotificationType Type,
    string Title,
    string Message,
    string? ActionUrl,
    bool IsRead,
    NotificationChannel Channel,
    DateTime CreatedAtUtc
);
