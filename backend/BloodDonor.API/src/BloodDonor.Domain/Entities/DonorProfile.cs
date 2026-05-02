using BloodDonor.Domain.Enums;

namespace BloodDonor.Domain.Entities;

public sealed class DonorProfile
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public BloodGroup BloodGroup { get; set; }
    public DateOnly DateOfBirth { get; set; }
    public decimal WeightKg { get; set; }
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public string City { get; set; } = string.Empty;
    public string? Area { get; set; }
    public AvailabilityStatus AvailabilityStatus { get; set; }
    public DateOnly? LastDonationDate { get; set; }
    public DateOnly? CooldownUntilDate { get; set; }
    public bool IsPhoneVisible { get; set; }
    public int TotalDonations { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
    public User User { get; set; } = null!;

    public void ApplyDonation(DateOnly donationDate)
    {
        LastDonationDate = donationDate;
        CooldownUntilDate = donationDate.AddDays(56);
        AvailabilityStatus = AvailabilityStatus.Cooldown;
        TotalDonations += 1;
    }

    public void RefreshAvailability(DateOnly today)
    {
        if (CooldownUntilDate is not null && CooldownUntilDate <= today)
        {
            AvailabilityStatus = AvailabilityStatus.Available;
            CooldownUntilDate = null;
        }
    }
}
