using BloodDonor.Domain.Enums;

namespace BloodDonor.Application.Features.Donors.UpsertMyProfile;

public sealed record UpsertMyProfileCommand(
    Guid UserId,
    BloodGroup BloodGroup,
    DateOnly DateOfBirth,
    decimal WeightKg,
    decimal Latitude,
    decimal Longitude,
    string City,
    string? Area,
    bool IsPhoneVisible
);
