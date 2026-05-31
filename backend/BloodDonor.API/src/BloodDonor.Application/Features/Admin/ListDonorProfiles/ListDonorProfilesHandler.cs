using BloodDonor.Application.Abstractions.Persistence;
using BloodDonor.Application.Common;
using BloodDonor.Application.Messaging;
using Microsoft.EntityFrameworkCore;

namespace BloodDonor.Application.Features.Admin.ListDonorProfiles;

public sealed class ListDonorProfilesHandler(IAppDbContext dbContext) : IRequestHandler<ListDonorProfilesQuery, PagedResult<AdminDonorProfileDto>>
{
    public async Task<Result<PagedResult<AdminDonorProfileDto>>> Handle(ListDonorProfilesQuery query, CancellationToken cancellationToken)
    {
        var page = Math.Max(PaginationDefaults.DefaultPage, query.Page);
        var pageSize = Math.Clamp(query.PageSize, 1, PaginationDefaults.MaxPageSize);
        var donorProfiles = dbContext.DonorProfiles
            .AsNoTracking()
            .Select(profile => new AdminDonorProfileDto(
                profile.UserId,
                profile.User.FullName,
                profile.User.Email,
                profile.IsPhoneVisible ? profile.User.Phone : null,
                profile.BloodGroup,
                profile.City,
                profile.Area,
                profile.AvailabilityStatus,
                profile.LastDonationDate,
                profile.CooldownUntilDate,
                profile.IsPhoneVisible,
                profile.TotalDonations,
                profile.UpdatedAtUtc))
            .AsQueryable();

        if (query.BloodGroup.HasValue)
        {
            donorProfiles = donorProfiles.Where(profile => profile.BloodGroup == query.BloodGroup.Value);
        }

        if (query.AvailabilityStatus.HasValue)
        {
            donorProfiles = donorProfiles.Where(profile => profile.AvailabilityStatus == query.AvailabilityStatus.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.City))
        {
            var city = query.City.Trim().ToLower();
            donorProfiles = donorProfiles.Where(profile => profile.City.ToLower().Contains(city));
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();
            donorProfiles = donorProfiles.Where(profile =>
                profile.FullName.ToLower().Contains(search)
                || profile.Email.ToLower().Contains(search)
                || profile.City.ToLower().Contains(search)
                || (profile.Area != null && profile.Area.ToLower().Contains(search))
                || (profile.Phone != null && profile.Phone.ToLower().Contains(search)));
        }

        var totalCount = await donorProfiles.CountAsync(cancellationToken);
        var items = await donorProfiles
            .OrderByDescending(profile => profile.UpdatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return Result<PagedResult<AdminDonorProfileDto>>.Success(new PagedResult<AdminDonorProfileDto>(items, page, pageSize, totalCount));
    }
}
