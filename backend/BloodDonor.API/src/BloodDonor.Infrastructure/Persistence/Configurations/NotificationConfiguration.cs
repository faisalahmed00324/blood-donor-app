using BloodDonor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BloodDonor.Infrastructure.Persistence.Configurations;

public sealed class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("notifications");
        builder.HasKey(x => x.Id);

        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.CreatedAtUtc);
        builder.HasIndex(x => x.IsRead);
        builder.HasIndex(x => new { x.UserId, x.IsRead, x.CreatedAtUtc });

        builder.Property(x => x.Title).HasMaxLength(200).IsRequired();
        builder.Property(x => x.ActionUrl).HasMaxLength(500);

        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
