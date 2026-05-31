using BloodDonor.Application.Messaging;

namespace BloodDonor.Application.Features.Admin.DeactivateUser;

public sealed record DeactivateUserCommand(Guid UserId, Guid AdminUserId) : IRequest;
