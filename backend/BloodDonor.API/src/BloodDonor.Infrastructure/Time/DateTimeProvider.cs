using BloodDonor.Application.Abstractions.Time;

namespace BloodDonor.Infrastructure.Time;

public sealed class DateTimeProvider : IDateTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;
}
