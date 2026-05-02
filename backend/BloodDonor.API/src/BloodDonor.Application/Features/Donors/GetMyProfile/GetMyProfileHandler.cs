using BloodDonor.Application.Abstractions.Persistence;
using BloodDonor.Application.Common;
using Microsoft.EntityFrameworkCore;

namespace BloodDonor.Application.Features.Donors.GetMyProfile;

public sealed class GetMyProfileHandler(IAppDbContext dbContext)
{
    public async Task<Result<DonorProfileResponse>> Handle(GetMyProfileQuery query, CancellationToken cancellationToken)
    {
        var profile = await dbContext.DonorProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.UserId == query.UserId, cancellationToken);

        if (profile is null)
        {
            return Result<DonorProfileResponse>.Failure(new Error("Donor.NotFound", "Donor profile not found."));
        }

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
