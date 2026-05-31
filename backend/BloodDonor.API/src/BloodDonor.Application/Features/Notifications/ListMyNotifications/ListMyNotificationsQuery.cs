using BloodDonor.Application.Common;
using BloodDonor.Application.Messaging;

namespace BloodDonor.Application.Features.Notifications.ListMyNotifications;

public sealed record ListMyNotificationsQuery(
    Guid UserId,
    int Page = PaginationDefaults.DefaultPage,
    int PageSize = PaginationDefaults.DefaultPageSize) : IRequest<PagedResult<NotificationDto>>;
