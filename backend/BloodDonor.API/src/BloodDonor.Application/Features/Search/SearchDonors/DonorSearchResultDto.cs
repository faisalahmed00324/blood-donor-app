using BloodDonor.Domain.Enums;

namespace BloodDonor.Application.Features.Search.SearchDonors;

public sealed record DonorSearchResultDto(
    Guid UserId,
    string FullName,
    BloodGroup BloodGroup,
    string City,
    string? Area,
    decimal Latitude,
    decimal Longitude,
    AvailabilityStatus AvailabilityStatus,
    bool IsPhoneVisible,
    string? Phone,
    int TotalDonations,
    double DistanceKm
);
