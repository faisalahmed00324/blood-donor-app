using BloodDonor.Application.Abstractions.Auth;
using BloodDonor.Application.Abstractions.Persistence;
using BloodDonor.Application.Abstractions.Time;
using BloodDonor.Application.Common;
using BloodDonor.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BloodDonor.Application.Features.Auth.Register;

public sealed class RegisterHandler(
    IAppDbContext dbContext,
    IPasswordHasher passwordHasher,
    IJwtTokenService jwtTokenService,
    IDateTimeProvider dateTimeProvider)
{
    private const int AccessTokenMinutes = 15;
    private const int RefreshTokenDays = 7;

    public async Task<Result<AuthTokensResponse>> Handle(RegisterCommand command, CancellationToken cancellationToken)
    {
        var validation = RegisterValidator.Validate(command);
        if (!validation.IsSuccess)
        {
            return Result<AuthTokensResponse>.Failure(validation.Error!);
        }

        var email = command.Email.Trim().ToLowerInvariant();
        var exists = await dbContext.Users.AnyAsync(x => x.Email == email, cancellationToken);
        if (exists)
        {
            return Result<AuthTokensResponse>.Failure(new Error("Auth.EmailInUse", "Email is already registered."));
        }

        var now = dateTimeProvider.UtcNow;
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            FullName = command.FullName.Trim(),
            Phone = string.IsNullOrWhiteSpace(command.Phone) ? null : command.Phone.Trim(),
            Role = command.Role,
            IsActive = true,
            IsEmailVerified = false,
            IsPhoneVerified = false,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };
        user.PasswordHash = passwordHasher.HashPassword(user, command.Password);

        var refreshTokenValue = jwtTokenService.CreateRefreshToken();
        var refreshTokenExpiry = now.AddDays(RefreshTokenDays);
        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = refreshTokenValue,
            CreatedAtUtc = now,
            ExpiresAtUtc = refreshTokenExpiry,
            IsRevoked = false
        };

        dbContext.Users.Add(user);
        dbContext.RefreshTokens.Add(refreshToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        var accessToken = jwtTokenService.CreateAccessToken(user);

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
            HasDonorProfile: false));
    }
}
