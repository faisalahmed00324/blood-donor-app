using BloodDonor.Domain.Entities;

namespace BloodDonor.Application.Abstractions.Notifications;

public interface INotificationDispatcher
{
    Task DispatchAsync(Notification notification, CancellationToken cancellationToken = default);
}
