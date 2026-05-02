using BloodDonor.Application.Common;

namespace BloodDonor.Application.Features.Donors.UpsertMyProfile;

public static class UpsertMyProfileValidator
{
    public static Result Validate(UpsertMyProfileCommand command)
    {
        if (string.IsNullOrWhiteSpace(command.City) || command.City.Length > 100)
        {
            return Result.Failure(new Error("Donor.InvalidCity", "City is required and must be <= 100 chars."));
        }

        if (command.WeightKg < 50)
        {
            return Result.Failure(new Error("Donor.InvalidWeight", "Minimum donor weight is 50kg."));
        }

        var age = DateOnly.FromDateTime(DateTime.UtcNow).Year - command.DateOfBirth.Year;
        if (age < 18 || age > 65)
        {
            return Result.Failure(new Error("Donor.InvalidAge", "Donor age must be between 18 and 65."));
        }

        return Result.Success();
    }
}
