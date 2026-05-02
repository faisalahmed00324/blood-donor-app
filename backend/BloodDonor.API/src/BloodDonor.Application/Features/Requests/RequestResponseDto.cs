using BloodDonor.Domain.Enums;

namespace BloodDonor.Application.Features.Requests;

public sealed record RequestResponseDto(
    Guid Id,
    Guid RequestId,
    Guid DonorId,
    ResponseStatus Status,
    DateTime RespondedAtUtc,
    DateTime? CompletedAtUtc,
    string? Notes
);
