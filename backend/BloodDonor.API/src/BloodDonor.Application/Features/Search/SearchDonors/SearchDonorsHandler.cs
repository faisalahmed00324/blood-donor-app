using BloodDonor.Application.Abstractions.Persistence;
using BloodDonor.Application.Common;
using BloodDonor.Domain.Enums;
using BloodDonor.Domain.Rules;
using Microsoft.EntityFrameworkCore;

namespace BloodDonor.Application.Features.Search.SearchDonors;

public sealed class SearchDonorsHandler(IAppDbContext dbContext)
{
    public async Task<Result<PagedResult<DonorSearchResultDto>>> Handle(SearchDonorsQuery query, CancellationToken cancellationToken)
    {
        var compatibleGroups = BloodCompatibilityRules.GetCompatibleDonors(query.RecipientBloodGroup);
        if (compatibleGroups.Count == 0)
        {
            return Result<PagedResult<DonorSearchResultDto>>.Success(
                new PagedResult<DonorSearchResultDto>([], PaginationDefaults.DefaultPage, PaginationDefaults.DefaultPageSize, 0));
        }

        var page = Math.Max(PaginationDefaults.DefaultPage, query.Page);
        var pageSize = Math.Clamp(query.PageSize, 1, PaginationDefaults.MaxPageSize);
        var radius = query.RadiusKm <= 0 ? 10 : query.RadiusKm;

        var donors = await dbContext.DonorProfiles
            .AsNoTracking()
            .Where(x => x.AvailabilityStatus == AvailabilityStatus.Available && compatibleGroups.Contains(x.BloodGroup))
            .Select(x => new
            {
                x.UserId,
                x.BloodGroup,
                x.City,
                x.Area,
                x.Latitude,
                x.Longitude,
                x.AvailabilityStatus,
                x.TotalDonations
            })
            .ToListAsync(cancellationToken);

        var projected = donors
            .Select(x =>
            {
                var distance = CalculateDistanceKm((double)query.Latitude, (double)query.Longitude, (double)x.Latitude, (double)x.Longitude);
                return new DonorSearchResultDto(
                    x.UserId,
                    x.BloodGroup,
                    x.City,
                    x.Area,
                    x.Latitude,
                    x.Longitude,
                    x.AvailabilityStatus,
                    x.TotalDonations,
                    distance);
            })
            .Where(x => x.DistanceKm <= (double)radius)
            .OrderBy(x => x.DistanceKm)
            .ThenByDescending(x => x.TotalDonations)
            .ToList();

        var totalCount = projected.Count;
        var pageItems = projected
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return Result<PagedResult<DonorSearchResultDto>>.Success(new PagedResult<DonorSearchResultDto>(pageItems, page, pageSize, totalCount));
    }

    private static double CalculateDistanceKm(double lat1, double lon1, double lat2, double lon2)
    {
        const double EarthRadiusKm = 6371;

        var dLat = DegreesToRadians(lat2 - lat1);
        var dLon = DegreesToRadians(lon2 - lon1);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2)
                + Math.Cos(DegreesToRadians(lat1)) * Math.Cos(DegreesToRadians(lat2))
                * Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return EarthRadiusKm * c;
    }

    private static double DegreesToRadians(double degrees) => degrees * Math.PI / 180;
}
