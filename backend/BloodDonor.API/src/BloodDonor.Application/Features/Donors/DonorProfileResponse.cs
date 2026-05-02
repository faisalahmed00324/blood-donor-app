using BloodDonor.Domain.Enums;

namespace BloodDonor.Application.Features.Donors;

public sealed record DonorProfileResponse(
    Guid UserId,
    BloodGroup BloodGroup,
    DateOnly DateOfBirth,
    decimal WeightKg,
    string City,
    string? Area,
    decimal Latitude,
    decimal Longitude,
    AvailabilityStatus AvailabilityStatus,
    DateOnly? LastDonationDate,
    DateOnly? CooldownUntilDate,
    bool IsPhoneVisible,
    int TotalDonations
);
