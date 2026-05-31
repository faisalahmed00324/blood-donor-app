using BloodDonor.Application.Common;
using BloodDonor.Application.Messaging;
using BloodDonor.Domain.Enums;

namespace BloodDonor.Application.Features.Admin.ListDonorProfiles;

public sealed record ListDonorProfilesQuery(
    int Page = PaginationDefaults.DefaultPage,
    int PageSize = PaginationDefaults.DefaultPageSize,
    BloodGroup? BloodGroup = null,
    AvailabilityStatus? AvailabilityStatus = null,
    string? City = null,
    string? Search = null) : IRequest<PagedResult<AdminDonorProfileDto>>;
