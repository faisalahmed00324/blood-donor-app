using BloodDonor.Domain.Enums;

namespace BloodDonor.Domain.Entities;

public sealed class RequestResponse
{
    public Guid Id { get; set; }
    public Guid RequestId { get; set; }
    public Guid DonorId { get; set; }
    public ResponseStatus Status { get; set; }
    public DateTime RespondedAtUtc { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
    public string? Notes { get; set; }
    public BloodRequest Request { get; set; } = null!;
    public User Donor { get; set; } = null!;
}
