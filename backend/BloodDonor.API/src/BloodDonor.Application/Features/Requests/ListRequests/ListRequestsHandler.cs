using BloodDonor.Application.Abstractions.Persistence;
using BloodDonor.Application.Common;
using Microsoft.EntityFrameworkCore;

namespace BloodDonor.Application.Features.Requests.ListRequests;

public sealed class ListRequestsHandler(IAppDbContext dbContext)
{
    public async Task<Result<PagedResult<BloodRequestDto>>> Handle(ListRequestsQuery query, CancellationToken cancellationToken)
    {
        var page = Math.Max(PaginationDefaults.DefaultPage, query.Page);
        var pageSize = Math.Clamp(query.PageSize, 1, PaginationDefaults.MaxPageSize);

        var requests = dbContext.BloodRequests.AsNoTracking().AsQueryable();

        if (query.Status.HasValue)
        {
            requests = requests.Where(x => x.Status == query.Status.Value);
        }

        if (query.BloodGroup.HasValue)
        {
            requests = requests.Where(x => x.BloodGroup == query.BloodGroup.Value);
        }

        var totalCount = await requests.CountAsync(cancellationToken);
        var items = await requests
            .OrderByDescending(x => x.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new BloodRequestDto(
                x.Id,
                x.SeekerId,
                x.BloodGroup,
                x.UnitsNeeded,
                x.UnitsFulfilled,
                x.UrgencyLevel,
                x.RequestType,
                x.PatientName,
                x.HospitalName,
                x.HospitalAddress,
                x.Latitude,
                x.Longitude,
                x.ContactPersonName,
                x.ContactPersonPhone,
                x.RequiredByDate,
                x.Notes,
                x.PrescriptionUrl,
                x.Status,
                x.ExpiresAtUtc,
                x.CreatedAtUtc,
                x.UpdatedAtUtc))
            .ToListAsync(cancellationToken);

        return Result<PagedResult<BloodRequestDto>>.Success(new PagedResult<BloodRequestDto>(items, page, pageSize, totalCount));
    }
}
