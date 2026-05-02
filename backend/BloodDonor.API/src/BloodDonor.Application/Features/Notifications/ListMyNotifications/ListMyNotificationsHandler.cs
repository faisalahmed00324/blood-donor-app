using BloodDonor.Application.Abstractions.Persistence;
using BloodDonor.Application.Common;
using Microsoft.EntityFrameworkCore;

namespace BloodDonor.Application.Features.Notifications.ListMyNotifications;

public sealed class ListMyNotificationsHandler(IAppDbContext dbContext)
{
    public async Task<Result<PagedResult<NotificationDto>>> Handle(ListMyNotificationsQuery query, CancellationToken cancellationToken)
    {
        var page = Math.Max(PaginationDefaults.DefaultPage, query.Page);
        var pageSize = Math.Clamp(query.PageSize, 1, PaginationDefaults.MaxPageSize);

        var notifications = dbContext.Notifications
            .AsNoTracking()
            .Where(x => x.UserId == query.UserId)
            .OrderByDescending(x => x.CreatedAtUtc);

        var total = await notifications.CountAsync(cancellationToken);
        var items = await notifications
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new NotificationDto(
                x.Id,
                x.Type,
                x.Title,
                x.Message,
                x.ActionUrl,
                x.IsRead,
                x.Channel,
                x.CreatedAtUtc))
            .ToListAsync(cancellationToken);

        return Result<PagedResult<NotificationDto>>.Success(new PagedResult<NotificationDto>(items, page, pageSize, total));
    }
}
