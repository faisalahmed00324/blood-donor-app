using BloodDonor.Application.Common;

namespace BloodDonor.Application.Features.Notifications.ListMyNotifications;

public sealed record ListMyNotificationsQuery(
    Guid UserId,
    int Page = PaginationDefaults.DefaultPage,
    int PageSize = PaginationDefaults.DefaultPageSize);
