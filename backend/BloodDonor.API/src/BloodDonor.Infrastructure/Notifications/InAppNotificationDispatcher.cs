using BloodDonor.Application.Abstractions.Notifications;
using BloodDonor.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace BloodDonor.Infrastructure.Notifications;

public sealed class InAppNotificationDispatcher(ILogger<InAppNotificationDispatcher> logger) : INotificationDispatcher
{
    public Task DispatchAsync(Notification notification, CancellationToken cancellationToken = default)
    {
        logger.LogInformation("In-app notification stored for user {UserId} with title {Title}", notification.UserId, notification.Title);
        return Task.CompletedTask;
    }
}
