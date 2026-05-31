using BloodDonor.Application.Common;
using BloodDonor.Application.Messaging;
using BloodDonor.Domain.Enums;

namespace BloodDonor.Application.Features.Admin.ListUsers;

public sealed record ListUsersQuery(
    int Page = PaginationDefaults.DefaultPage,
    int PageSize = PaginationDefaults.DefaultPageSize,
    UserRole? Role = null,
    bool? IsActive = null,
    string? Search = null) : IRequest<PagedResult<AdminUserDto>>;
