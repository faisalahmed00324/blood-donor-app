using BloodDonor.Application.Messaging;

namespace BloodDonor.Application.Features.Auth.Refresh;

public sealed record RefreshCommand(string RefreshToken) : IRequest<AuthTokensResponse>;
