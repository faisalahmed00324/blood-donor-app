using BloodDonor.Domain.Entities;

namespace BloodDonor.Application.Abstractions.Auth;

public interface IJwtTokenService
{
    string CreateAccessToken(User user);
    string CreateRefreshToken();
    Guid? ValidateRefreshToken(string token);
}
