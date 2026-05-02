using BloodDonor.Application.Common;
using BloodDonor.Domain.Enums;

namespace BloodDonor.Application.Features.Auth.Register;

public static class RegisterValidator
{
    public static Result Validate(RegisterCommand command)
    {
        if (string.IsNullOrWhiteSpace(command.Email) || !command.Email.Contains('@'))
        {
            return Result.Failure(new Error("Auth.InvalidEmail", "A valid email is required."));
        }

        if (string.IsNullOrWhiteSpace(command.Password) || command.Password.Length < 8)
        {
            return Result.Failure(new Error("Auth.WeakPassword", "Password must be at least 8 characters."));
        }

        if (string.IsNullOrWhiteSpace(command.FullName) || command.FullName.Length > 100)
        {
            return Result.Failure(new Error("Auth.InvalidName", "Full name is required and must be <= 100 chars."));
        }

        if (!Enum.IsDefined(command.Role) || command.Role is UserRole.Admin)
        {
            return Result.Failure(new Error("Auth.InvalidRole", "Only Donor, Seeker, or Hospital roles are allowed."));
        }

        return Result.Success();
    }
}
