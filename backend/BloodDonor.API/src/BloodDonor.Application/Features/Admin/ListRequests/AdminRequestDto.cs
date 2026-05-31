using BloodDonor.Domain.Enums;

namespace BloodDonor.Application.Features.Admin.ListRequests;

public sealed record AdminRequestDto(
    Guid Id,
    Guid SeekerId,
    string SeekerName,
    string SeekerEmail,
    BloodGroup BloodGroup,
    int UnitsNeeded,
    int UnitsFulfilled,
    UrgencyLevel UrgencyLevel,
    RequestType RequestType,
    string? PatientName,
    string HospitalName,
    string HospitalAddress,
    string ContactPersonName,
    string ContactPersonPhone,
    DateOnly RequiredByDate,
    RequestStatus Status,
    DateTime ExpiresAtUtc,
    DateTime CreatedAtUtc
);
