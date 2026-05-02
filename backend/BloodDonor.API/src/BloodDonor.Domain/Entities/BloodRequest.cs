using BloodDonor.Domain.Enums;

namespace BloodDonor.Domain.Entities;

public sealed class BloodRequest
{
    public Guid Id { get; set; }
    public Guid SeekerId { get; set; }
    public BloodGroup BloodGroup { get; set; }
    public int UnitsNeeded { get; set; }
    public int UnitsFulfilled { get; set; }
    public UrgencyLevel UrgencyLevel { get; set; }
    public RequestType RequestType { get; set; }
    public string? PatientName { get; set; }
    public string HospitalName { get; set; } = string.Empty;
    public string HospitalAddress { get; set; } = string.Empty;
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public string ContactPersonName { get; set; } = string.Empty;
    public string ContactPersonPhone { get; set; } = string.Empty;
    public DateOnly RequiredByDate { get; set; }
    public string? Notes { get; set; }
    public string? PrescriptionUrl { get; set; }
    public RequestStatus Status { get; set; } = RequestStatus.Open;
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
    public User Seeker { get; set; } = null!;
    public ICollection<RequestResponse> Responses { get; set; } = new List<RequestResponse>();

    public void UpdateStatusForManualClose(bool cancelled)
    {
        Status = cancelled ? RequestStatus.Cancelled : RequestStatus.Fulfilled;
    }

    public void ExpireIfNeeded(DateTime nowUtc)
    {
        if (Status is RequestStatus.Open or RequestStatus.PartiallyFulfilled && ExpiresAtUtc <= nowUtc)
        {
            Status = RequestStatus.Expired;
        }
    }

    public void RegisterFulfilledUnit()
    {
        UnitsFulfilled += 1;
        if (UnitsFulfilled >= UnitsNeeded)
        {
            Status = RequestStatus.Fulfilled;
            return;
        }

        Status = RequestStatus.PartiallyFulfilled;
    }
}
