using BloodDonor.Application.Abstractions.Persistence;
using BloodDonor.Application.Abstractions.Time;
using BloodDonor.Application.Common;
using BloodDonor.Application.Messaging;
using BloodDonor.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace BloodDonor.Application.Features.Donors.UpdateAvailability;

public sealed class UpdateAvailabilityHandler(
    IAppDbContext dbContext,
    IDateTimeProvider dateTimeProvider)
    : IRequestHandler<UpdateAvailabilityCommand>
{
    public async Task<Result> Handle(UpdateAvailabilityCommand command, CancellationToken cancellationToken)
    {
        var profile = await dbContext.DonorProfiles.FirstOrDefaultAsync(x => x.UserId == command.UserId, cancellationToken);
        if (profile is null)
        {
            return Result.Failure(new Error("Donor.NotFound", "Donor profile not found."));
        }

        profile.RefreshAvailability(DateOnly.FromDateTime(dateTimeProvider.UtcNow));

        if (profile.AvailabilityStatus == AvailabilityStatus.Cooldown && command.AvailabilityStatus != AvailabilityStatus.Cooldown)
        {
            return Result.Failure(new Error("Donor.CooldownActive", "Donor is currently in cooldown."));
        }

        profile.AvailabilityStatus = command.AvailabilityStatus;
        profile.UpdatedAtUtc = dateTimeProvider.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
