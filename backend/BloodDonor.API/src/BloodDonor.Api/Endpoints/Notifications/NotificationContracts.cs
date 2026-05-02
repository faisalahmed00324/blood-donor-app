using BloodDonor.Domain.Enums;

namespace BloodDonor.Api.Endpoints.Notifications;

public sealed record CreateNotificationBody(
    Guid UserId,
    NotificationType Type,
    string Title,
    string Message,
    string? ActionUrl
);
