using BloodDonor.Application.Abstractions.Persistence;
using BloodDonor.Application.Abstractions.Time;
using BloodDonor.Application.Common;
using BloodDonor.Application.Features.Auth;
using BloodDonor.Application.Messaging;
using BloodDonor.Domain.Entities;
using BloodDonor.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace BloodDonor.Application.Features.Donors.UpsertMyProfile;

public sealed class UpsertMyProfileHandler(
    IAppDbContext dbContext,
    IDateTimeProvider dateTimeProvider)
    : IRequestHandler<UpsertMyProfileCommand, DonorProfileResponse>
{
    public async Task<Result<DonorProfileResponse>> Handle(UpsertMyProfileCommand command, CancellationToken cancellationToken)
    {
        var validation = UpsertMyProfileValidator.Validate(command);
        if (!validation.IsSuccess)
        {
            return Result<DonorProfileResponse>.Failure(validation.Error!);
        }

        var user = await dbContext.Users.FirstOrDefaultAsync(x => x.Id == command.UserId, cancellationToken);
        if (user is null)
        {
            return Result<DonorProfileResponse>.Failure(new Error("Donor.UserNotFound", "User not found."));
        }

        if (!AuthCapabilities.CanManageDonorProfile(user.Role))
        {
            return Result<DonorProfileResponse>.Failure(new Error("Donor.Forbidden", "This user cannot create a donor profile."));
        }

        var now = dateTimeProvider.UtcNow;
        var profile = await dbContext.DonorProfiles.FirstOrDefaultAsync(x => x.UserId == command.UserId, cancellationToken);

        if (profile is null)
        {
            profile = new DonorProfile
            {
                Id = Guid.NewGuid(),
                UserId = command.UserId,
                CreatedAtUtc = now,
                AvailabilityStatus = AvailabilityStatus.Available,
                TotalDonations = 0
            };
            dbContext.DonorProfiles.Add(profile);
        }

        profile.BloodGroup = command.BloodGroup;
        profile.DateOfBirth = command.DateOfBirth;
        profile.WeightKg = command.WeightKg;
        profile.Latitude = command.Latitude;
        profile.Longitude = command.Longitude;
        profile.City = command.City.Trim();
        profile.Area = string.IsNullOrWhiteSpace(command.Area) ? null : command.Area.Trim();
        profile.IsPhoneVisible = command.IsPhoneVisible;
        profile.UpdatedAtUtc = now;

        profile.RefreshAvailability(DateOnly.FromDateTime(now));

        await dbContext.SaveChangesAsync(cancellationToken);

        return Result<DonorProfileResponse>.Success(new DonorProfileResponse(
            UserId: profile.UserId,
            BloodGroup: profile.BloodGroup,
            DateOfBirth: profile.DateOfBirth,
            WeightKg: profile.WeightKg,
            City: profile.City,
            Area: profile.Area,
            Latitude: profile.Latitude,
            Longitude: profile.Longitude,
            AvailabilityStatus: profile.AvailabilityStatus,
            LastDonationDate: profile.LastDonationDate,
            CooldownUntilDate: profile.CooldownUntilDate,
            IsPhoneVisible: profile.IsPhoneVisible,
            TotalDonations: profile.TotalDonations));
    }
}
