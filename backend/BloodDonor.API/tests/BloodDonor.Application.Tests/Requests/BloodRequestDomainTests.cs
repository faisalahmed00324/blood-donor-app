using BloodDonor.Domain.Entities;
using BloodDonor.Domain.Enums;

namespace BloodDonor.Application.Tests.Requests;

public class BloodRequestDomainTests
{
    [Fact]
    public void RegisterFulfilledUnit_ShouldTransitionToPartiallyFulfilled_WhenUnitsRemain()
    {
        var request = new BloodRequest
        {
            UnitsNeeded = 2,
            UnitsFulfilled = 0,
            Status = RequestStatus.Open
        };

        request.RegisterFulfilledUnit();

        Assert.Equal(1, request.UnitsFulfilled);
        Assert.Equal(RequestStatus.PartiallyFulfilled, request.Status);
    }

    [Fact]
    public void RegisterFulfilledUnit_ShouldTransitionToFulfilled_WhenUnitsComplete()
    {
        var request = new BloodRequest
        {
            UnitsNeeded = 1,
            UnitsFulfilled = 0,
            Status = RequestStatus.Open
        };

        request.RegisterFulfilledUnit();

        Assert.Equal(RequestStatus.Fulfilled, request.Status);
    }

    [Fact]
    public void ExpireIfNeeded_ShouldSetExpired_WhenPastExpiry()
    {
        var request = new BloodRequest
        {
            Status = RequestStatus.Open,
            ExpiresAtUtc = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        };

        request.ExpireIfNeeded(new DateTime(2026, 1, 2, 0, 0, 0, DateTimeKind.Utc));

        Assert.Equal(RequestStatus.Expired, request.Status);
    }
}
