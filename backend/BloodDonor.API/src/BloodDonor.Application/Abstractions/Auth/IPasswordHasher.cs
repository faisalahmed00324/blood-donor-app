using BloodDonor.Domain.Entities;

namespace BloodDonor.Application.Abstractions.Auth;

public interface IPasswordHasher
{
    string HashPassword(User user, string password);
    bool VerifyPassword(User user, string hashedPassword, string providedPassword);
}
