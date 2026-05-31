using BloodDonor.Application.Messaging;
using BloodDonor.Domain.Enums;

namespace BloodDonor.Application.Features.Auth.Register;

public sealed record RegisterCommand(
    string Email,
    string Password,
    string FullName,
    string? Phone,
    UserRole Role
) : IRequest<AuthTokensResponse>;
