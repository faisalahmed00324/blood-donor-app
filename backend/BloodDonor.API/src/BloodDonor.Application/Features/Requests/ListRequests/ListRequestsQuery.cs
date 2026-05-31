using BloodDonor.Domain.Enums;
using BloodDonor.Application.Common;
using BloodDonor.Application.Messaging;

namespace BloodDonor.Application.Features.Requests.ListRequests;

public sealed record ListRequestsQuery(
    Guid CurrentUserId,
    int Page = PaginationDefaults.DefaultPage,
    int PageSize = PaginationDefaults.DefaultPageSize,
    RequestStatus? Status = null,
    BloodGroup? BloodGroup = null,
    bool MineOnly = false,
    bool AvailableForMe = false) : IRequest<PagedResult<BloodRequestDto>>;
