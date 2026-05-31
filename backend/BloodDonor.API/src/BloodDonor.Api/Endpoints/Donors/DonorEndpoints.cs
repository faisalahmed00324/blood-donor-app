using System.Security.Claims;
using BloodDonor.Application.Features.Donors.GetMyProfile;
using BloodDonor.Application.Features.Donors.RequestDonorContact;
using BloodDonor.Application.Features.Donors.UpsertMyProfile;
using BloodDonor.Application.Features.Donors.UpdateAvailability;
using BloodDonor.Application.Messaging;

namespace BloodDonor.Api.Endpoints.Donors;

public static class DonorEndpoints
{
    public static IEndpointRouteBuilder MapDonorEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/donors").WithTags("Donors").RequireAuthorization();

        group.MapGet("/me", async (HttpContext httpContext, IApplicationDispatcher dispatcher, CancellationToken ct) =>
        {
            var userId = GetCurrentUserId(httpContext.User);
            if (userId is null)
            {
                return Results.Unauthorized();
            }

            var result = await dispatcher.Send(new GetMyProfileQuery(userId.Value), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound(result.Error);
        });

        group.MapPut("/me", async (
            HttpContext httpContext,
            UpsertMyProfileRequest request,
            IApplicationDispatcher dispatcher,
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

            var result = await dispatcher.Send(command, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        });

        group.MapPut("/me/availability", async (
            HttpContext httpContext,
            UpdateAvailabilityRequest request,
            IApplicationDispatcher dispatcher,
            CancellationToken ct) =>
        {
            var userId = GetCurrentUserId(httpContext.User);
            if (userId is null)
            {
                return Results.Unauthorized();
            }

            var result = await dispatcher.Send(new UpdateAvailabilityCommand(userId.Value, request.AvailabilityStatus), ct);
            return result.IsSuccess ? Results.NoContent() : Results.BadRequest(result.Error);
        });

        group.MapPost("/{donorUserId:guid}/contact-request", async (
            HttpContext httpContext,
            Guid donorUserId,
            RequestDonorContactBody body,
            IApplicationDispatcher dispatcher,
            CancellationToken ct) =>
        {
            var userId = GetCurrentUserId(httpContext.User);
            if (userId is null)
            {
                return Results.Unauthorized();
            }

            var result = await dispatcher.Send(new RequestDonorContactCommand(donorUserId, userId.Value, body.Message), ct);
            return result.IsSuccess ? Results.Ok() : Results.BadRequest(result.Error);
        });

        return app;
    }

    private static Guid? GetCurrentUserId(ClaimsPrincipal user)
    {
        var sub = user.FindFirstValue(ClaimTypes.NameIdentifier) ?? user.FindFirstValue("sub");
        return Guid.TryParse(sub, out var userId) ? userId : null;
    }
}
