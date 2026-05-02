using BloodDonor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BloodDonor.Infrastructure.Persistence.Configurations;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");
        builder.HasKey(x => x.Id);
        builder.HasIndex(x => x.Email).IsUnique();
        builder.HasIndex(x => x.Phone).IsUnique();

        builder.Property(x => x.Email).HasMaxLength(255).IsRequired();
        builder.Property(x => x.PasswordHash).HasMaxLength(1024).IsRequired();
        builder.Property(x => x.FullName).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Phone).HasMaxLength(20);
        builder.Property(x => x.AvatarUrl).HasMaxLength(500);

        builder.HasOne(x => x.DonorProfile)
            .WithOne(x => x.User)
            .HasForeignKey<DonorProfile>(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
