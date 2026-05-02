using BloodDonor.Domain.Enums;

namespace BloodDonor.Application.Features.Search.SearchDonors;

public sealed record DonorSearchResultDto(
    Guid UserId,
    BloodGroup BloodGroup,
    string City,
    string? Area,
    decimal Latitude,
    decimal Longitude,
    AvailabilityStatus AvailabilityStatus,
    int TotalDonations,
    double DistanceKm
);
