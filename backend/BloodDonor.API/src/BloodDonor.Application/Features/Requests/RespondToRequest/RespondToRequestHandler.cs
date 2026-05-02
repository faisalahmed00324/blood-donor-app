using BloodDonor.Application.Abstractions.Persistence;
using BloodDonor.Application.Abstractions.Time;
using BloodDonor.Application.Common;
using BloodDonor.Domain.Entities;
using BloodDonor.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace BloodDonor.Application.Features.Requests.RespondToRequest;

public sealed class RespondToRequestHandler(
    IAppDbContext dbContext,
    IDateTimeProvider dateTimeProvider)
{
    public async Task<Result<RequestResponseDto>> Handle(RespondToRequestCommand command, CancellationToken cancellationToken)
    {
        if (command.Status is not (ResponseStatus.Accepted or ResponseStatus.Declined or ResponseStatus.Withdrawn or ResponseStatus.Completed))
        {
            return Result<RequestResponseDto>.Failure(new Error("Response.InvalidStatus", "Invalid response status."));
        }

        var request = await dbContext.BloodRequests.FirstOrDefaultAsync(x => x.Id == command.RequestId, cancellationToken);
        if (request is null)
        {
            return Result<RequestResponseDto>.Failure(new Error("Request.NotFound", "Request not found."));
        }

        request.ExpireIfNeeded(dateTimeProvider.UtcNow);
        if (request.Status is RequestStatus.Cancelled or RequestStatus.Expired or RequestStatus.Fulfilled)
        {
            return Result<RequestResponseDto>.Failure(new Error("Request.Closed", "Request is no longer accepting responses."));
        }

        var now = dateTimeProvider.UtcNow;
        var response = await dbContext.RequestResponses.FirstOrDefaultAsync(
            x => x.RequestId == command.RequestId && x.DonorId == command.DonorId,
            cancellationToken);

        if (response is null)
        {
            response = new RequestResponse
            {
                Id = Guid.NewGuid(),
                RequestId = command.RequestId,
                DonorId = command.DonorId,
                RespondedAtUtc = now
            };

            dbContext.RequestResponses.Add(response);
        }

        response.Status = command.Status;
        response.Notes = command.Notes;

        if (command.Status == ResponseStatus.Completed)
        {
            response.CompletedAtUtc = now;
            request.RegisterFulfilledUnit();
        }

        request.UpdatedAtUtc = now;
        await dbContext.SaveChangesAsync(cancellationToken);

        return Result<RequestResponseDto>.Success(new RequestResponseDto(
            response.Id,
            response.RequestId,
            response.DonorId,
            response.Status,
            response.RespondedAtUtc,
            response.CompletedAtUtc,
            response.Notes));
    }
}
