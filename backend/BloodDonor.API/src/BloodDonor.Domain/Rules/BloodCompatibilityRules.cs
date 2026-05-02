using BloodDonor.Domain.Enums;

namespace BloodDonor.Domain.Rules;

public static class BloodCompatibilityRules
{
    public static IReadOnlyCollection<BloodGroup> GetCompatibleDonors(BloodGroup recipient)
    {
        return recipient switch
        {
            BloodGroup.ONegative => [BloodGroup.ONegative],
            BloodGroup.OPositive => [BloodGroup.ONegative, BloodGroup.OPositive],
            BloodGroup.ANegative => [BloodGroup.ONegative, BloodGroup.ANegative],
            BloodGroup.APositive => [BloodGroup.ONegative, BloodGroup.OPositive, BloodGroup.ANegative, BloodGroup.APositive],
            BloodGroup.BNegative => [BloodGroup.ONegative, BloodGroup.BNegative],
            BloodGroup.BPositive => [BloodGroup.ONegative, BloodGroup.OPositive, BloodGroup.BNegative, BloodGroup.BPositive],
            BloodGroup.ABNegative => [BloodGroup.ONegative, BloodGroup.ANegative, BloodGroup.BNegative, BloodGroup.ABNegative],
            BloodGroup.ABPositive =>
            [
                BloodGroup.ONegative,
                BloodGroup.OPositive,
                BloodGroup.ANegative,
                BloodGroup.APositive,
                BloodGroup.BNegative,
                BloodGroup.BPositive,
                BloodGroup.ABNegative,
                BloodGroup.ABPositive
            ],
            _ => []
        };
    }

    public static bool IsCompatible(BloodGroup donor, BloodGroup recipient)
    {
        return GetCompatibleDonors(recipient).Contains(donor);
    }
}
