using BloodDonor.Application.Abstractions.Persistence;
using BloodDonor.Application.Common;
using BloodDonor.Application.Messaging;
using Microsoft.EntityFrameworkCore;

namespace BloodDonor.Application.Features.Admin.ListUsers;

public sealed class ListUsersHandler(IAppDbContext dbContext) : IRequestHandler<ListUsersQuery, PagedResult<AdminUserDto>>
{
    public async Task<Result<PagedResult<AdminUserDto>>> Handle(ListUsersQuery query, CancellationToken cancellationToken)
    {
        var page = Math.Max(PaginationDefaults.DefaultPage, query.Page);
        var pageSize = Math.Clamp(query.PageSize, 1, PaginationDefaults.MaxPageSize);
        var users = dbContext.Users
            .AsNoTracking()
            .Select(user => new AdminUserDto(
                user.Id,
                user.FullName,
                user.Email,
                user.Phone,
                user.Role,
                user.IsActive,
                user.IsEmailVerified,
                user.IsPhoneVerified,
                user.DonorProfile != null,
                user.CreatedAtUtc))
            .AsQueryable();

        if (query.Role.HasValue)
        {
            users = users.Where(user => user.Role == query.Role.Value);
        }

        if (query.IsActive.HasValue)
        {
            users = users.Where(user => user.IsActive == query.IsActive.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();
            users = users.Where(user =>
                user.FullName.ToLower().Contains(search)
                || user.Email.ToLower().Contains(search)
                || (user.Phone != null && user.Phone.ToLower().Contains(search)));
        }

        var totalCount = await users.CountAsync(cancellationToken);
        var items = await users
            .OrderByDescending(user => user.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return Result<PagedResult<AdminUserDto>>.Success(new PagedResult<AdminUserDto>(items, page, pageSize, totalCount));
    }
}
