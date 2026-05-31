using BloodDonor.Application.Messaging;
using BloodDonor.Domain.Enums;

namespace BloodDonor.Application.Features.Requests.RespondToRequest;

public sealed record RespondToRequestCommand(Guid RequestId, Guid DonorId, ResponseStatus Status, string? Notes)
    : IRequest<RequestResponseDto>;
