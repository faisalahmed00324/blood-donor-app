using BloodDonor.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BloodDonor.Application.Abstractions.Persistence;

public interface IAppDbContext
{
    DbSet<User> Users { get; }
    DbSet<DonorProfile> DonorProfiles { get; }
    DbSet<BloodRequest> BloodRequests { get; }
    DbSet<RequestResponse> RequestResponses { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
