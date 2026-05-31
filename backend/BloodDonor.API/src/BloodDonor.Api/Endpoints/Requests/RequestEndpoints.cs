using System.Security.Claims;
using BloodDonor.Application.Features.Requests.CreateRequest;
using BloodDonor.Application.Features.Requests.ListRequests;
using BloodDonor.Application.Features.Requests.RespondToRequest;
using BloodDonor.Application.Features.Requests.UpdateRequestStatus;
using BloodDonor.Application.Messaging;
using BloodDonor.Domain.Enums;

namespace BloodDonor.Api.Endpoints.Requests;

public static class RequestEndpoints
{
    public static IEndpointRouteBuilder MapRequestEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/requests").WithTags("Requests").RequireAuthorization();

        group.MapPost("/", async (
            HttpContext httpContext,
            CreateRequestBody body,
            IApplicationDispatcher dispatcher,
            CancellationToken ct) =>
        {
            var userId = GetCurrentUserId(httpContext.User);
            if (userId is null)
            {
                return Results.Unauthorized();
            }

            var command = new CreateRequestCommand(
                userId.Value,
                body.BloodGroup,
                body.UnitsNeeded,
                body.UrgencyLevel,
                body.RequestType,
                body.PatientName,
                body.HospitalName,
                body.HospitalAddress,
                body.Latitude,
                body.Longitude,
                body.ContactPersonName,
                body.ContactPersonPhone,
                body.RequiredByDate,
                body.Notes,
                body.PrescriptionUrl);

            var result = await dispatcher.Send(command, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        });

        group.MapGet("/", async (
            int? page,
            int? pageSize,
            RequestStatus? status,
            BloodGroup? bloodGroup,
            bool? mineOnly,
            bool? availableForMe,
            HttpContext httpContext,
            IApplicationDispatcher dispatcher,
            CancellationToken ct) =>
        {
            var userId = GetCurrentUserId(httpContext.User);
            if (userId is null)
            {
                return Results.Unauthorized();
            }

            var result = await dispatcher.Send(new ListRequestsQuery(userId.Value, page ?? 1, pageSize ?? 20, status, bloodGroup, mineOnly ?? false, availableForMe ?? false), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        });

        group.MapPut("/{requestId:guid}", async (
            HttpContext httpContext,
            Guid requestId,
            UpdateRequestStatusBody body,
            IApplicationDispatcher dispatcher,
            CancellationToken ct) =>
        {
            var userId = GetCurrentUserId(httpContext.User);
            if (userId is null)
            {
                return Results.Unauthorized();
            }

            var result = await dispatcher.Send(new UpdateRequestStatusCommand(requestId, userId.Value, body.Status), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        });

        group.MapPost("/{requestId:guid}/respond", async (
            HttpContext httpContext,
            Guid requestId,
            RespondToRequestBody body,
            IApplicationDispatcher dispatcher,
            CancellationToken ct) =>
        {
            var userId = GetCurrentUserId(httpContext.User);
            if (userId is null)
            {
                return Results.Unauthorized();
            }

            var result = await dispatcher.Send(new RespondToRequestCommand(requestId, userId.Value, body.Status, body.Notes), ct);
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
