using System.Security.Claims;
using BloodDonor.Application.Features.Notifications.CreateInAppNotification;
using BloodDonor.Application.Features.Notifications.ListMyNotifications;

namespace BloodDonor.Api.Endpoints.Notifications;

public static class NotificationEndpoints
{
    public static IEndpointRouteBuilder MapNotificationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/notifications").WithTags("Notifications").RequireAuthorization();

        group.MapGet("/", async (
            HttpContext httpContext,
            int? page,
            int? pageSize,
            ListMyNotificationsHandler handler,
            CancellationToken ct) =>
        {
            var userId = GetCurrentUserId(httpContext.User);
            if (userId is null)
            {
                return Results.Unauthorized();
            }

            var result = await handler.Handle(new ListMyNotificationsQuery(userId.Value, page ?? 1, pageSize ?? 20), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        });

        group.MapPost("/", async (
            CreateNotificationBody body,
            CreateInAppNotificationHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.Handle(
                new CreateInAppNotificationCommand(body.UserId, body.Type, body.Title, body.Message, body.ActionUrl),
                ct);

            return result.IsSuccess ? Results.Ok(new { id = result.Value }) : Results.BadRequest(result.Error);
        });

        return app;
    }

    private static Guid? GetCurrentUserId(ClaimsPrincipal user)
    {
        var sub = user.FindFirstValue(ClaimTypes.NameIdentifier) ?? user.FindFirstValue("sub");
        return Guid.TryParse(sub, out var userId) ? userId : null;
    }
}
