using BloodDonor.Domain.Enums;

namespace BloodDonor.Api.Endpoints.Requests;

public sealed record CreateRequestBody(
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

public sealed record UpdateRequestStatusBody(RequestStatus Status);
public sealed record RespondToRequestBody(ResponseStatus Status, string? Notes);
