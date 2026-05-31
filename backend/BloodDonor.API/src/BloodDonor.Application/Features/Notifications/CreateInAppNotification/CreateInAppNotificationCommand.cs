using BloodDonor.Application.Messaging;
using BloodDonor.Domain.Enums;

namespace BloodDonor.Application.Features.Notifications.CreateInAppNotification;

public sealed record CreateInAppNotificationCommand(
    Guid UserId,
    NotificationType Type,
    string Title,
    string Message,
    string? ActionUrl = null
) : IRequest<Guid>;
