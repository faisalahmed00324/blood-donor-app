using BloodDonor.Application.Features.Search.SearchDonors;
using BloodDonor.Domain.Enums;

namespace BloodDonor.Api.Endpoints.Search;

public static class SearchEndpoints
{
    public static IEndpointRouteBuilder MapSearchEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/search").WithTags("Search").RequireAuthorization();

        group.MapGet("/donors", async (
            BloodGroup recipientBloodGroup,
            decimal latitude,
            decimal longitude,
            decimal radiusKm,
            int? page,
            int? pageSize,
            SearchDonorsHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.Handle(
                new SearchDonorsQuery(recipientBloodGroup, latitude, longitude, radiusKm, page ?? 1, pageSize ?? 20),
                ct);

            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        });

        return app;
    }
}
