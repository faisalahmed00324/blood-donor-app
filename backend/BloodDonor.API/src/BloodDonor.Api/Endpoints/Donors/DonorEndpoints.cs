using System.Security.Claims;
using BloodDonor.Application.Features.Donors.GetMyProfile;
using BloodDonor.Application.Features.Donors.UpsertMyProfile;
using BloodDonor.Application.Features.Donors.UpdateAvailability;

namespace BloodDonor.Api.Endpoints.Donors;

public static class DonorEndpoints
{
    public static IEndpointRouteBuilder MapDonorEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/donors").WithTags("Donors").RequireAuthorization();

        group.MapGet("/me", async (HttpContext httpContext, GetMyProfileHandler handler, CancellationToken ct) =>
        {
            var userId = GetCurrentUserId(httpContext.User);
            if (userId is null)
            {
                return Results.Unauthorized();
            }

            var result = await handler.Handle(new GetMyProfileQuery(userId.Value), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound(result.Error);
        });

        group.MapPut("/me", async (
            HttpContext httpContext,
            UpsertMyProfileRequest request,
            UpsertMyProfileHandler handler,
            CancellationToken ct) =>
        {
            var userId = GetCurrentUserId(httpContext.User);
            if (userId is null)
            {
                return Results.Unauthorized();
            }

            var command = new UpsertMyProfileCommand(
                userId.Value,
                request.BloodGroup,
                request.DateOfBirth,
                request.WeightKg,
                request.Latitude,
                request.Longitude,
                request.City,
                request.Area,
                request.IsPhoneVisible);

            var result = await handler.Handle(command, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        });

        group.MapPut("/me/availability", async (
            HttpContext httpContext,
            UpdateAvailabilityRequest request,
            UpdateAvailabilityHandler handler,
            CancellationToken ct) =>
        {
            var userId = GetCurrentUserId(httpContext.User);
            if (userId is null)
            {
                return Results.Unauthorized();
            }

            var result = await handler.Handle(new UpdateAvailabilityCommand(userId.Value, request.AvailabilityStatus), ct);
            return result.IsSuccess ? Results.NoContent() : Results.BadRequest(result.Error);
        });

        return app;
    }

    private static Guid? GetCurrentUserId(ClaimsPrincipal user)
    {
        var sub = user.FindFirstValue(ClaimTypes.NameIdentifier) ?? user.FindFirstValue("sub");
        return Guid.TryParse(sub, out var userId) ? userId : null;
    }
}
