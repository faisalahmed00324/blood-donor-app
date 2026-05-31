using BloodDonor.Application.Abstractions.Notifications;
using BloodDonor.Application.Abstractions.Persistence;
using BloodDonor.Application.Abstractions.Time;
using BloodDonor.Application.Common;
using BloodDonor.Application.Messaging;
using BloodDonor.Domain.Entities;
using BloodDonor.Domain.Enums;

namespace BloodDonor.Application.Features.Notifications.CreateInAppNotification;

public sealed class CreateInAppNotificationHandler(
    IAppDbContext dbContext,
    INotificationDispatcher notificationDispatcher,
    IDateTimeProvider dateTimeProvider)
    : IRequestHandler<CreateInAppNotificationCommand, Guid>
{
    public async Task<Result<Guid>> Handle(CreateInAppNotificationCommand command, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(command.Title) || string.IsNullOrWhiteSpace(command.Message))
        {
            return Result<Guid>.Failure(new Error("Notification.InvalidPayload", "Notification title and message are required."));
        }

        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = command.UserId,
            Type = command.Type,
            Title = command.Title.Trim(),
            Message = command.Message.Trim(),
            ActionUrl = command.ActionUrl,
            IsRead = false,
            Channel = NotificationChannel.InApp,
            CreatedAtUtc = dateTimeProvider.UtcNow
        };

        dbContext.Notifications.Add(notification);
        await dbContext.SaveChangesAsync(cancellationToken);
        await notificationDispatcher.DispatchAsync(notification, cancellationToken);

        return Result<Guid>.Success(notification.Id);
    }
}
