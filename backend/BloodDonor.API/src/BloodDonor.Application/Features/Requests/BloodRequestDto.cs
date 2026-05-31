using BloodDonor.Domain.Enums;

namespace BloodDonor.Application.Features.Requests;

public sealed record BloodRequestDto(
    Guid Id,
    Guid SeekerId,
    string SeekerName,
    BloodGroup BloodGroup,
    int UnitsNeeded,
    int UnitsFulfilled,
    UrgencyLevel UrgencyLevel,
    RequestType RequestType,
    string? PatientName,
    string HospitalName,
    string HospitalAddress,
    decimal Latitude,
    decimal Longitude,
    string ContactPersonName,
    string ContactPersonPhone,
    DateOnly RequiredByDate,
    string? Notes,
    string? PrescriptionUrl,
    RequestStatus Status,
    ResponseStatus? MyResponseStatus,
    int AcceptedDonorCount,
    IReadOnlyList<RequestResponseDto> Responses,
    DateTime ExpiresAtUtc,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc
);
