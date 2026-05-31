using BloodDonor.Application.Abstractions.Persistence;
using BloodDonor.Application.Common;
using BloodDonor.Application.Messaging;
using Microsoft.EntityFrameworkCore;

namespace BloodDonor.Application.Features.Admin.ListRequests;

public sealed class ListAdminRequestsHandler(IAppDbContext dbContext) : IRequestHandler<ListAdminRequestsQuery, PagedResult<AdminRequestDto>>
{
    public async Task<Result<PagedResult<AdminRequestDto>>> Handle(ListAdminRequestsQuery query, CancellationToken cancellationToken)
    {
        var page = Math.Max(PaginationDefaults.DefaultPage, query.Page);
        var pageSize = Math.Clamp(query.PageSize, 1, PaginationDefaults.MaxPageSize);
        var requests = dbContext.BloodRequests
            .AsNoTracking()
            .Select(request => new AdminRequestDto(
                request.Id,
                request.SeekerId,
                request.Seeker.FullName,
                request.Seeker.Email,
                request.BloodGroup,
                request.UnitsNeeded,
                request.UnitsFulfilled,
                request.UrgencyLevel,
                request.RequestType,
                request.PatientName,
                request.HospitalName,
                request.HospitalAddress,
                request.ContactPersonName,
                request.ContactPersonPhone,
                request.RequiredByDate,
                request.Status,
                request.ExpiresAtUtc,
                request.CreatedAtUtc))
            .AsQueryable();

        if (query.Status.HasValue)
        {
            requests = requests.Where(request => request.Status == query.Status.Value);
        }

        if (query.BloodGroup.HasValue)
        {
            requests = requests.Where(request => request.BloodGroup == query.BloodGroup.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();
            requests = requests.Where(request =>
                request.SeekerName.ToLower().Contains(search)
                || request.SeekerEmail.ToLower().Contains(search)
                || request.HospitalName.ToLower().Contains(search)
                || request.ContactPersonName.ToLower().Contains(search));
        }

        var totalCount = await requests.CountAsync(cancellationToken);
        var items = await requests
            .OrderByDescending(request => request.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return Result<PagedResult<AdminRequestDto>>.Success(new PagedResult<AdminRequestDto>(items, page, pageSize, totalCount));
    }
}
