namespace BloodDonor.Application.Features.Auth;

public sealed record AuthTokensResponse(
    string AccessToken,
    string RefreshToken,
    DateTime AccessTokenExpiresAtUtc,
    DateTime RefreshTokenExpiresAtUtc,
    Guid UserId,
    string Email,
    string Role
);
