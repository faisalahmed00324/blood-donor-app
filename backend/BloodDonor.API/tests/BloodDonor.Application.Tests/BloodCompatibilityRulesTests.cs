using BloodDonor.Domain.Enums;
using BloodDonor.Domain.Rules;

namespace BloodDonor.Application.Tests;

public class BloodCompatibilityRulesTests
{
    [Fact]
    public void AbPositive_ShouldAcceptAnyBloodGroup()
    {
        var allGroups = Enum.GetValues<BloodGroup>();
        foreach (var donor in allGroups)
        {
            Assert.True(BloodCompatibilityRules.IsCompatible(donor, BloodGroup.ABPositive));
        }
    }

    [Fact]
    public void ONegativeRecipient_ShouldAcceptOnlyONegative()
    {
        Assert.True(BloodCompatibilityRules.IsCompatible(BloodGroup.ONegative, BloodGroup.ONegative));
        Assert.False(BloodCompatibilityRules.IsCompatible(BloodGroup.APositive, BloodGroup.ONegative));
    }
}
