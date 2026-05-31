using BloodDonor.Application.Abstractions.Persistence;
using BloodDonor.Application.Common;
using BloodDonor.Application.Messaging;
using BloodDonor.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace BloodDonor.Application.Features.Requests.ListRequests;

public sealed class ListRequestsHandler(IAppDbContext dbContext) : IRequestHandler<ListRequestsQuery, PagedResult<BloodRequestDto>>
{
    public async Task<Result<PagedResult<BloodRequestDto>>> Handle(ListRequestsQuery query, CancellationToken cancellationToken)
    {
        var page = Math.Max(PaginationDefaults.DefaultPage, query.Page);
        var pageSize = Math.Clamp(query.PageSize, 1, PaginationDefaults.MaxPageSize);

        BloodGroup? donorBloodGroup = null;
        if (query.AvailableForMe)
        {
            donorBloodGroup = await dbContext.DonorProfiles
                .AsNoTracking()
                .Where(x => x.UserId == query.CurrentUserId)
                .Select(x => (BloodGroup?)x.BloodGroup)
                .FirstOrDefaultAsync(cancellationToken);
        }

        var requests = dbContext.BloodRequests
            .AsNoTracking()
            .Include(x => x.Seeker)
            .Include(x => x.Responses)
                .ThenInclude(x => x.Donor)
            .AsQueryable();

        if (query.MineOnly)
        {
            requests = requests.Where(x => x.SeekerId == query.CurrentUserId);
        }

        if (query.AvailableForMe)
        {
            requests = requests.Where(x => x.SeekerId != query.CurrentUserId && x.Status != RequestStatus.Cancelled && x.Status != RequestStatus.Expired && x.Status != RequestStatus.Fulfilled);

            if (donorBloodGroup.HasValue)
            {
                requests = requests.Where(x => x.BloodGroup == donorBloodGroup.Value);
            }
        }

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
                x.Seeker.FullName,
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
                x.Responses.Where(response => response.DonorId == query.CurrentUserId).Select(response => (ResponseStatus?)response.Status).FirstOrDefault(),
                x.Responses.Count(response => response.Status == ResponseStatus.Accepted),
                x.Responses
                    .OrderByDescending(response => response.RespondedAtUtc)
                    .Select(response => new RequestResponseDto(
                        response.Id,
                        response.RequestId,
                        response.DonorId,
                        response.Donor.FullName,
                        response.Donor.Phone,
                        response.Status,
                        response.RespondedAtUtc,
                        response.CompletedAtUtc,
                        response.Notes))
                    .ToList(),
                x.ExpiresAtUtc,
                x.CreatedAtUtc,
                x.UpdatedAtUtc))
            .ToListAsync(cancellationToken);

        return Result<PagedResult<BloodRequestDto>>.Success(new PagedResult<BloodRequestDto>(items, page, pageSize, totalCount));
    }
}
