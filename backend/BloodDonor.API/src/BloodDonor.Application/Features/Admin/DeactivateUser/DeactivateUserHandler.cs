using BloodDonor.Application.Abstractions.Persistence;
using BloodDonor.Application.Common;
using BloodDonor.Application.Messaging;
using Microsoft.EntityFrameworkCore;

namespace BloodDonor.Application.Features.Admin.DeactivateUser;

public sealed class DeactivateUserHandler(IAppDbContext dbContext) : IRequestHandler<DeactivateUserCommand>
{
    public async Task<Result> Handle(DeactivateUserCommand command, CancellationToken cancellationToken)
    {
        if (command.UserId == command.AdminUserId)
        {
            return Result.Failure(new Error("Admin.SelfDeactivationNotAllowed", "You cannot deactivate your own account."));
        }

        var user = await dbContext.Users.FirstOrDefaultAsync(x => x.Id == command.UserId, cancellationToken);
        if (user is null)
        {
            return Result.Failure(new Error("Admin.UserNotFound", "User not found."));
        }

        if (!user.IsActive)
        {
            return Result.Success();
        }

        user.IsActive = false;
        user.UpdatedAtUtc = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
