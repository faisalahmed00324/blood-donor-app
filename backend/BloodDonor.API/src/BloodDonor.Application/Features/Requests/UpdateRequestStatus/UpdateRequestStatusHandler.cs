using BloodDonor.Application.Abstractions.Persistence;
using BloodDonor.Application.Abstractions.Time;
using BloodDonor.Application.Common;
using BloodDonor.Application.Messaging;
using BloodDonor.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace BloodDonor.Application.Features.Requests.UpdateRequestStatus;

public sealed class UpdateRequestStatusHandler(
    IAppDbContext dbContext,
    IDateTimeProvider dateTimeProvider)
    : IRequestHandler<UpdateRequestStatusCommand, BloodRequestDto>
{
    public async Task<Result<BloodRequestDto>> Handle(UpdateRequestStatusCommand command, CancellationToken cancellationToken)
    {
        var request = await dbContext.BloodRequests
            .Include(x => x.Seeker)
            .Include(x => x.Responses)
                .ThenInclude(x => x.Donor)
            .FirstOrDefaultAsync(
            x => x.Id == command.RequestId && x.SeekerId == command.SeekerId,
            cancellationToken);

        if (request is null)
        {
            return Result<BloodRequestDto>.Failure(new Error("Request.NotFound", "Request not found."));
        }

        if (command.Status is not (RequestStatus.Cancelled or RequestStatus.Fulfilled))
        {
            return Result<BloodRequestDto>.Failure(new Error("Request.InvalidStatus", "Only cancelled or fulfilled are allowed."));
        }

        request.UpdateStatusForManualClose(cancelled: command.Status == RequestStatus.Cancelled);
        request.UpdatedAtUtc = dateTimeProvider.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);

        return Result<BloodRequestDto>.Success(new BloodRequestDto(
            request.Id,
            request.SeekerId,
            request.Seeker.FullName,
            request.BloodGroup,
            request.UnitsNeeded,
            request.UnitsFulfilled,
            request.UrgencyLevel,
            request.RequestType,
            request.PatientName,
            request.HospitalName,
            request.HospitalAddress,
            request.Latitude,
            request.Longitude,
            request.ContactPersonName,
            request.ContactPersonPhone,
            request.RequiredByDate,
            request.Notes,
            request.PrescriptionUrl,
            request.Status,
            null,
            request.Responses.Count(x => x.Status == ResponseStatus.Accepted),
            request.Responses
                .OrderByDescending(x => x.RespondedAtUtc)
                .Select(x => new RequestResponseDto(
                    x.Id,
                    x.RequestId,
                    x.DonorId,
                    x.Donor.FullName,
                    x.Donor.Phone,
                    x.Status,
                    x.RespondedAtUtc,
                    x.CompletedAtUtc,
                    x.Notes))
                .ToList(),
            request.ExpiresAtUtc,
            request.CreatedAtUtc,
            request.UpdatedAtUtc));
    }
}
