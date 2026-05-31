using BloodDonor.Application.Messaging;
using BloodDonor.Application.Features.Auth.Login;
using BloodDonor.Application.Features.Auth.Refresh;
using BloodDonor.Application.Features.Auth.Register;

namespace BloodDonor.Api.Endpoints.Auth;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/register", async (
                RegisterRequest request,
                IApplicationDispatcher dispatcher,
                CancellationToken ct) =>
            {
                var result = await dispatcher.Send(
                    new RegisterCommand(request.Email, request.Password, request.FullName, request.Phone, request.Role),
                    ct);

                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : Results.BadRequest(result.Error);
            })
            .RequireRateLimiting("auth");

        group.MapPost("/login", async (
                LoginRequest request,
                IApplicationDispatcher dispatcher,
                CancellationToken ct) =>
            {
                var result = await dispatcher.Send(new LoginCommand(request.Email, request.Password), ct);
                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : Results.BadRequest(result.Error);
            })
            .RequireRateLimiting("auth");

        group.MapPost("/refresh", async (
                RefreshRequest request,
                IApplicationDispatcher dispatcher,
                CancellationToken ct) =>
            {
                var result = await dispatcher.Send(new RefreshCommand(request.RefreshToken), ct);
                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : Results.BadRequest(result.Error);
            })
            .RequireRateLimiting("auth");

        return app;
    }
}
