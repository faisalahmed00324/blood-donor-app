using BloodDonor.Application.Messaging;

namespace BloodDonor.Application.Features.Auth.Login;

public sealed record LoginCommand(string Email, string Password) : IRequest<AuthTokensResponse>;
