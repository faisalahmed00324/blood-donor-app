using System.Security.Claims;
using BloodDonor.Application.Features.Admin.DeactivateUser;
using BloodDonor.Application.Features.Admin.ListDonorProfiles;
using BloodDonor.Application.Features.Admin.ListRequests;
using BloodDonor.Application.Features.Admin.ListUsers;
using BloodDonor.Application.Messaging;
using BloodDonor.Domain.Enums;

namespace BloodDonor.Api.Endpoints.Admin;

public static class AdminEndpoints
{
    public static IEndpointRouteBuilder MapAdminEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/admin").WithTags("Admin").RequireAuthorization("AdminOnly");

        group.MapGet("/users", async (
            int? page,
            int? pageSize,
            UserRole? role,
            bool? isActive,
            string? search,
            IApplicationDispatcher dispatcher,
            CancellationToken ct) =>
        {
            var result = await dispatcher.Send(
                new ListUsersQuery(page ?? 1, pageSize ?? 20, role, isActive, search),
                ct);

            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        });

        group.MapPost("/users/{userId:guid}/deactivate", async (
            HttpContext httpContext,
            Guid userId,
            IApplicationDispatcher dispatcher,
            CancellationToken ct) =>
        {
            var adminUserId = GetCurrentUserId(httpContext.User);
            if (adminUserId is null)
            {
                return Results.Unauthorized();
            }

            var result = await dispatcher.Send(new DeactivateUserCommand(userId, adminUserId.Value), ct);
            return result.IsSuccess ? Results.NoContent() : Results.BadRequest(result.Error);
        });

        group.MapGet("/requests", async (
            int? page,
            int? pageSize,
            RequestStatus? status,
            BloodGroup? bloodGroup,
            string? search,
            IApplicationDispatcher dispatcher,
            CancellationToken ct) =>
        {
            var result = await dispatcher.Send(
                new ListAdminRequestsQuery(page ?? 1, pageSize ?? 20, status, bloodGroup, search),
                ct);

            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        });

        group.MapGet("/donors", async (
            int? page,
            int? pageSize,
            BloodGroup? bloodGroup,
            AvailabilityStatus? availabilityStatus,
            string? city,
            string? search,
            IApplicationDispatcher dispatcher,
            CancellationToken ct) =>
        {
            var result = await dispatcher.Send(
                new ListDonorProfilesQuery(page ?? 1, pageSize ?? 20, bloodGroup, availabilityStatus, city, search),
                ct);

            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        });

        return app;
    }

    private static Guid? GetCurrentUserId(ClaimsPrincipal user)
    {
        var sub = user.FindFirstValue(ClaimTypes.NameIdentifier) ?? user.FindFirstValue("sub");
        return Guid.TryParse(sub, out var userId) ? userId : null;
    }
}
