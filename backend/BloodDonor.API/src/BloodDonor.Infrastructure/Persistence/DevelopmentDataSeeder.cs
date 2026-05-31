using BloodDonor.Domain.Entities;
using BloodDonor.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace BloodDonor.Infrastructure.Persistence;

public static class DevelopmentDataSeeder
{
    public static async Task SeedAsync(AppDbContext dbContext, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        await EnsureUserAsync(
            dbContext,
            email: "seeker@test.local",
            password: "Test123!",
            fullName: "Test Seeker",
            phone: "8801700000001",
            role: UserRole.Seeker,
            now,
            cancellationToken);

        await EnsureUserAsync(
            dbContext,
            email: "hospital@test.local",
            password: "Test123!",
            fullName: "Test Hospital",
            phone: "8801700000002",
            role: UserRole.Hospital,
            now,
            cancellationToken);

        await EnsureUserAsync(
            dbContext,
            email: "admin@test.local",
            password: "Test123!",
            fullName: "Test Admin",
            phone: "8801700000003",
            role: UserRole.Admin,
            now,
            cancellationToken);
    }

    private static async Task EnsureUserAsync(
        AppDbContext dbContext,
        string email,
        string password,
        string fullName,
        string phone,
        UserRole role,
        DateTime now,
        CancellationToken cancellationToken)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();
        var existingUser = await dbContext.Users.FirstOrDefaultAsync(x => x.Email == normalizedEmail, cancellationToken);
        if (existingUser is not null)
        {
            return;
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = normalizedEmail,
            FullName = fullName,
            Phone = phone,
            Role = role,
            IsActive = true,
            IsEmailVerified = true,
            IsPhoneVerified = true,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        var passwordHasher = new PasswordHasher<User>();
        user.PasswordHash = passwordHasher.HashPassword(user, password);

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
