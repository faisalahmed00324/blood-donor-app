using BloodDonor.Application.Abstractions.Persistence;
using BloodDonor.Application.Common;
using BloodDonor.Application.Messaging;
using BloodDonor.Domain.Entities;
using BloodDonor.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace BloodDonor.Application.Features.Donors.RequestDonorContact;

public sealed class RequestDonorContactHandler(IAppDbContext dbContext) : IRequestHandler<RequestDonorContactCommand>
{
    public async Task<Result> Handle(RequestDonorContactCommand command, CancellationToken cancellationToken)
    {
        if (command.DonorUserId == command.RequesterUserId)
        {
            return Result.Failure(new Error("Contact.InvalidUser", "You cannot request contact with yourself."));
        }

        var donor = await dbContext.DonorProfiles
            .AsNoTracking()
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.UserId == command.DonorUserId, cancellationToken);

        if (donor is null)
        {
            return Result.Failure(new Error("Contact.DonorNotFound", "Donor not found."));
        }

        var requester = await dbContext.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Id == command.RequesterUserId, cancellationToken);
        if (requester is null)
        {
            return Result.Failure(new Error("Contact.RequesterNotFound", "Requester not found."));
        }

        dbContext.Notifications.Add(new Notification
        {
            Id = Guid.NewGuid(),
            UserId = donor.UserId,
            Type = NotificationType.General,
            Title = "New donor contact request",
            Message = BuildMessage(requester.FullName, requester.Phone, command.Message),
            ActionUrl = "/notifications",
            IsRead = false,
            Channel = NotificationChannel.InApp,
            CreatedAtUtc = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }

    private static string BuildMessage(string requesterName, string? requesterPhone, string? message)
    {
        var phoneText = string.IsNullOrWhiteSpace(requesterPhone) ? "No phone shared" : requesterPhone.Trim();
        var noteText = string.IsNullOrWhiteSpace(message) ? string.Empty : $" Message: {message.Trim()}";
        return $"{requesterName} wants to contact you about blood donation. Their phone: {phoneText}.{noteText}";
    }
}
