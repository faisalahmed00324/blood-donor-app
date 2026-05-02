using BloodDonor.Domain.Entities;
using BloodDonor.Domain.Enums;

namespace BloodDonor.Application.Tests.Donors;

public class DonorProfileDomainTests
{
    [Fact]
    public void ApplyDonation_ShouldSetCooldownAndIncrementTotalDonations()
    {
        var profile = new DonorProfile
        {
            AvailabilityStatus = AvailabilityStatus.Available,
            TotalDonations = 0
        };

        profile.ApplyDonation(new DateOnly(2026, 1, 1));

        Assert.Equal(AvailabilityStatus.Cooldown, profile.AvailabilityStatus);
        Assert.Equal(new DateOnly(2026, 2, 26), profile.CooldownUntilDate);
        Assert.Equal(1, profile.TotalDonations);
    }

    [Fact]
    public void RefreshAvailability_ShouldSetAvailable_WhenCooldownExpired()
    {
        var profile = new DonorProfile
        {
            AvailabilityStatus = AvailabilityStatus.Cooldown,
            CooldownUntilDate = new DateOnly(2026, 1, 1)
        };

        profile.RefreshAvailability(new DateOnly(2026, 1, 2));

        Assert.Equal(AvailabilityStatus.Available, profile.AvailabilityStatus);
        Assert.Null(profile.CooldownUntilDate);
    }
}
