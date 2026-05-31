using BloodDonor.Domain.Enums;

namespace BloodDonor.Api.Endpoints.Donors;

public sealed record UpsertMyProfileRequest(
    BloodGroup BloodGroup,
    DateOnly DateOfBirth,
    decimal WeightKg,
    decimal Latitude,
    decimal Longitude,
    string City,
    string? Area,
    bool IsPhoneVisible
);

public sealed record UpdateAvailabilityRequest(AvailabilityStatus AvailabilityStatus);

public sealed record RequestDonorContactBody(string? Message);
