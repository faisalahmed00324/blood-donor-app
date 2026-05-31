using BloodDonor.Domain.Enums;
using BloodDonor.Application.Common;
using BloodDonor.Application.Messaging;

namespace BloodDonor.Application.Features.Search.SearchDonors;

public sealed record SearchDonorsQuery(
    BloodGroup RecipientBloodGroup,
    decimal Latitude,
    decimal Longitude,
    decimal RadiusKm,
    int Page = PaginationDefaults.DefaultPage,
    int PageSize = PaginationDefaults.DefaultPageSize
) : IRequest<PagedResult<DonorSearchResultDto>>;
