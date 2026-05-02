using BloodDonor.Domain.Enums;

namespace BloodDonor.Application.Features.Requests.UpdateRequestStatus;

public sealed record UpdateRequestStatusCommand(Guid RequestId, Guid SeekerId, RequestStatus Status);
