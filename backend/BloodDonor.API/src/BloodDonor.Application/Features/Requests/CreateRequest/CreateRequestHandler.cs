using BloodDonor.Application.Abstractions.Persistence;
using BloodDonor.Application.Abstractions.Time;
using BloodDonor.Application.Common;
using BloodDonor.Domain.Entities;
using BloodDonor.Domain.Enums;

namespace BloodDonor.Application.Features.Requests.CreateRequest;

public sealed class CreateRequestHandler(
    IAppDbContext dbContext,
    IDateTimeProvider dateTimeProvider)
{
    public async Task<Result<BloodRequestDto>> Handle(CreateRequestCommand command, CancellationToken cancellationToken)
    {
        if (command.UnitsNeeded < 1)
        {
            return Result<BloodRequestDto>.Failure(new Error("Request.InvalidUnits", "Units needed must be at least 1."));
        }

        if (string.IsNullOrWhiteSpace(command.HospitalName) || string.IsNullOrWhiteSpace(command.ContactPersonPhone))
        {
            return Result<BloodRequestDto>.Failure(new Error("Request.InvalidFields", "Hospital and contact fields are required."));
        }

        var now = dateTimeProvider.UtcNow;
        var request = new BloodRequest
        {
            Id = Guid.NewGuid(),
            SeekerId = command.SeekerId,
            BloodGroup = command.BloodGroup,
            UnitsNeeded = command.UnitsNeeded,
            UnitsFulfilled = 0,
            UrgencyLevel = command.UrgencyLevel,
            RequestType = command.RequestType,
            PatientName = command.PatientName,
            HospitalName = command.HospitalName.Trim(),
            HospitalAddress = command.HospitalAddress.Trim(),
            Latitude = command.Latitude,
            Longitude = command.Longitude,
            ContactPersonName = command.ContactPersonName.Trim(),
            ContactPersonPhone = command.ContactPersonPhone.Trim(),
            RequiredByDate = command.RequiredByDate,
            Notes = command.Notes,
            PrescriptionUrl = command.PrescriptionUrl,
            Status = RequestStatus.Open,
            ExpiresAtUtc = now.AddDays(7),
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        dbContext.BloodRequests.Add(request);
        await dbContext.SaveChangesAsync(cancellationToken);

        return Result<BloodRequestDto>.Success(ToDto(request));
    }

    private static BloodRequestDto ToDto(BloodRequest request)
    {
        return new BloodRequestDto(
            request.Id,
            request.SeekerId,
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
            request.ExpiresAtUtc,
            request.CreatedAtUtc,
            request.UpdatedAtUtc);
    }
}
