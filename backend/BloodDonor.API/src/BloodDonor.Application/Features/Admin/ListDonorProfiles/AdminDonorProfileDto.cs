using BloodDonor.Domain.Enums;

namespace BloodDonor.Application.Features.Admin.ListDonorProfiles;

public sealed record AdminDonorProfileDto(
    Guid UserId,
    string FullName,
    string Email,
    string? Phone,
    BloodGroup BloodGroup,
    string City,
    string? Area,
    AvailabilityStatus AvailabilityStatus,
    DateOnly? LastDonationDate,
    DateOnly? CooldownUntilDate,
    bool IsPhoneVisible,
    int TotalDonations,
    DateTime UpdatedAtUtc
);
