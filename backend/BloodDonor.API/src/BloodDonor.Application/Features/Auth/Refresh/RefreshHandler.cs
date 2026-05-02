using BloodDonor.Application.Abstractions.Auth;
using BloodDonor.Application.Abstractions.Persistence;
using BloodDonor.Application.Abstractions.Time;
using BloodDonor.Application.Common;
using BloodDonor.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BloodDonor.Application.Features.Auth.Refresh;

public sealed class RefreshHandler(
    IAppDbContext dbContext,
    IJwtTokenService jwtTokenService,
    IDateTimeProvider dateTimeProvider)
{
    private const int AccessTokenMinutes = 15;
    private const int RefreshTokenDays = 7;

    public async Task<Result<AuthTokensResponse>> Handle(RefreshCommand command, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(command.RefreshToken))
        {
            return Result<AuthTokensResponse>.Failure(new Error("Auth.InvalidRefreshToken", "Refresh token is required."));
        }

        var now = dateTimeProvider.UtcNow;
        var storedToken = await dbContext.RefreshTokens
            .FirstOrDefaultAsync(
                x => x.Token == command.RefreshToken && !x.IsRevoked && x.ExpiresAtUtc > now,
                cancellationToken);

        if (storedToken is null)
        {
            return Result<AuthTokensResponse>.Failure(new Error("Auth.InvalidRefreshToken", "Refresh token is invalid or expired."));
        }

        var user = await dbContext.Users.FirstOrDefaultAsync(x => x.Id == storedToken.UserId, cancellationToken);
        if (user is null || !user.IsActive)
        {
            return Result<AuthTokensResponse>.Failure(new Error("Auth.InvalidUser", "User not found or inactive."));
        }

        storedToken.IsRevoked = true;
        var newRefreshTokenValue = jwtTokenService.CreateRefreshToken();
        var refreshTokenExpiry = now.AddDays(RefreshTokenDays);
        dbContext.RefreshTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = newRefreshTokenValue,
            CreatedAtUtc = now,
            ExpiresAtUtc = refreshTokenExpiry,
            IsRevoked = false
        });

        await dbContext.SaveChangesAsync(cancellationToken);

        return Result<AuthTokensResponse>.Success(new AuthTokensResponse(
            AccessToken: jwtTokenService.CreateAccessToken(user),
            RefreshToken: newRefreshTokenValue,
            AccessTokenExpiresAtUtc: now.AddMinutes(AccessTokenMinutes),
            RefreshTokenExpiresAtUtc: refreshTokenExpiry,
            UserId: user.Id,
            Email: user.Email,
            Role: user.Role.ToString()));
    }
}
