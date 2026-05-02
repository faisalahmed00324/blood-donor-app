using BloodDonor.Domain.Enums;

namespace BloodDonor.Application.Features.Requests.CreateRequest;

public sealed record CreateRequestCommand(
    Guid SeekerId,
    BloodGroup BloodGroup,
    int UnitsNeeded,
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
    string? PrescriptionUrl
);
