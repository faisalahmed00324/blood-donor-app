using BloodDonor.Application.Common;
using BloodDonor.Application.Messaging;
using BloodDonor.Domain.Enums;

namespace BloodDonor.Application.Features.Admin.ListRequests;

public sealed record ListAdminRequestsQuery(
    int Page = PaginationDefaults.DefaultPage,
    int PageSize = PaginationDefaults.DefaultPageSize,
    RequestStatus? Status = null,
    BloodGroup? BloodGroup = null,
    string? Search = null) : IRequest<PagedResult<AdminRequestDto>>;
