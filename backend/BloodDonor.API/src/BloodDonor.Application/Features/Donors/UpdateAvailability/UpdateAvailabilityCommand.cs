using BloodDonor.Domain.Enums;

namespace BloodDonor.Application.Features.Donors.UpdateAvailability;

public sealed record UpdateAvailabilityCommand(Guid UserId, AvailabilityStatus AvailabilityStatus);
