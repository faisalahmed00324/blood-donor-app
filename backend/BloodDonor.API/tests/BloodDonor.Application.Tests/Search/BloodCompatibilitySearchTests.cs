using BloodDonor.Domain.Enums;
using BloodDonor.Domain.Rules;

namespace BloodDonor.Application.Tests.Search;

public class BloodCompatibilitySearchTests
{
    [Fact]
    public void OPositiveRecipient_ShouldNotAcceptANegative()
    {
        var allowed = BloodCompatibilityRules.GetCompatibleDonors(BloodGroup.OPositive);
        Assert.DoesNotContain(BloodGroup.ANegative, allowed);
    }

    [Fact]
    public void ABPositiveRecipient_ShouldContainAllGroups()
    {
        var allowed = BloodCompatibilityRules.GetCompatibleDonors(BloodGroup.ABPositive);
        Assert.Equal(8, allowed.Count);
    }
}
