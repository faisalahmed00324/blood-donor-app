using BloodDonor.Application.Abstractions.Persistence;
using BloodDonor.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BloodDonor.Infrastructure.Persistence;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options), IAppDbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<DonorProfile> DonorProfiles => Set<DonorProfile>();
    public DbSet<BloodRequest> BloodRequests => Set<BloodRequest>();
    public DbSet<RequestResponse> RequestResponses => Set<RequestResponse>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
