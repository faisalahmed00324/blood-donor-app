namespace BloodDonor.Domain.Enums;

public enum RequestStatus
{
    Open = 1,
    PartiallyFulfilled = 2,
    Fulfilled = 3,
    Expired = 4,
    Cancelled = 5
}
