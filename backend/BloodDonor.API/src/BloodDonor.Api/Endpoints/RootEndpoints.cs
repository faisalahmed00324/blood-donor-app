namespace BloodDonor.Api.Endpoints;

public static class RootEndpoints
{
    public static IEndpointRouteBuilder MapRootEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/", () => Results.Ok(new
        {
            service = "BloodDonor API",
            environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"
        }));

        return app;
    }
}
