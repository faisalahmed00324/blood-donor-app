using BloodDonor.Domain.Enums;
using BloodDonor.Application.Common;

namespace BloodDonor.Application.Features.Requests.ListRequests;

public sealed record ListRequestsQuery(
    int Page = PaginationDefaults.DefaultPage,
    int PageSize = PaginationDefaults.DefaultPageSize,
    RequestStatus? Status = null,
    BloodGroup? BloodGroup = null);
