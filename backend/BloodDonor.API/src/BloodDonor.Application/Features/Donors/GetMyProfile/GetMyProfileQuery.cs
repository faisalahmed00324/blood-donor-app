using BloodDonor.Application.Features.Donors;
using BloodDonor.Application.Messaging;

namespace BloodDonor.Application.Features.Donors.GetMyProfile;

public sealed record GetMyProfileQuery(Guid UserId) : IRequest<DonorProfileResponse>;
