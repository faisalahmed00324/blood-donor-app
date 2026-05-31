using BloodDonor.Application.Messaging;

namespace BloodDonor.Application.Features.Donors.RequestDonorContact;

public sealed record RequestDonorContactCommand(Guid DonorUserId, Guid RequesterUserId, string? Message) : IRequest;
