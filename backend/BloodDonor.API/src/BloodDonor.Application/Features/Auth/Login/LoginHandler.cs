using BloodDonor.Application.Abstractions.Auth;
using BloodDonor.Application.Abstractions.Persistence;
using BloodDonor.Application.Abstractions.Time;
using BloodDonor.Application.Common;
using BloodDonor.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BloodDonor.Application.Features.Auth.Login;

public sealed class LoginHandler(
    IAppDbContext dbContext,
    IPasswordHasher passwordHasher,
    IJwtTokenService jwtTokenService,
    IDateTimeProvider dateTimeProvider)
{
    private const int AccessTokenMinutes = 15;
    private const int RefreshTokenDays = 7;

    public async Task<Result<AuthTokensResponse>> Handle(LoginCommand command, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(command.Email) || string.IsNullOrWhiteSpace(command.Password))
        {
            return Result<AuthTokensResponse>.Failure(new Error("Auth.InvalidCredentials", "Invalid credentials."));
        }

        var email = command.Email.Trim().ToLowerInvariant();
        var user = await dbContext.Users.FirstOrDefaultAsync(x => x.Email == email, cancellationToken);
        if (user is null || !user.IsActive)
        {
            return Result<AuthTokensResponse>.Failure(new Error("Auth.InvalidCredentials", "Invalid credentials."));
        }

        var validPassword = passwordHasher.VerifyPassword(user, user.PasswordHash, command.Password);
        if (!validPassword)
        {
            return Result<AuthTokensResponse>.Failure(new Error("Auth.InvalidCredentials", "Invalid credentials."));
        }

        var now = dateTimeProvider.UtcNow;
        var refreshTokenValue = jwtTokenService.CreateRefreshToken();
        var refreshTokenExpiry = now.AddDays(RefreshTokenDays);

        dbContext.RefreshTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = refreshTokenValue,
            CreatedAtUtc = now,
            ExpiresAtUtc = refreshTokenExpiry,
            IsRevoked = false
        });

        await dbContext.SaveChangesAsync(cancellationToken);

        var accessToken = jwtTokenService.CreateAccessToken(user);
        var hasDonorProfile = await dbContext.DonorProfiles.AnyAsync(x => x.UserId == user.Id, cancellationToken);

        return Result<AuthTokensResponse>.Success(new AuthTokensResponse(
            AccessToken: accessToken,
            RefreshToken: refreshTokenValue,
            AccessTokenExpiresAtUtc: now.AddMinutes(AccessTokenMinutes),
            RefreshTokenExpiresAtUtc: refreshTokenExpiry,
            UserId: user.Id,
            Email: user.Email,
            Role: user.Role.ToString(),
            CanSeek: AuthCapabilities.CanSeek(user.Role),
            CanManageDonorProfile: AuthCapabilities.CanManageDonorProfile(user.Role),
            HasDonorProfile: hasDonorProfile));
    }
}
