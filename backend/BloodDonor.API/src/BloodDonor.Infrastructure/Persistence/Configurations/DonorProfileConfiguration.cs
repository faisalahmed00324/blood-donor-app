using BloodDonor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BloodDonor.Infrastructure.Persistence.Configurations;

public sealed class DonorProfileConfiguration : IEntityTypeConfiguration<DonorProfile>
{
    public void Configure(EntityTypeBuilder<DonorProfile> builder)
    {
        builder.ToTable("donor_profiles");
        builder.HasKey(x => x.Id);
        builder.HasIndex(x => x.UserId).IsUnique();
        builder.HasIndex(x => x.BloodGroup);
        builder.HasIndex(x => x.City);
        builder.HasIndex(x => x.AvailabilityStatus);
        builder.HasIndex(x => new { x.AvailabilityStatus, x.BloodGroup, x.City });

        builder.Property(x => x.City).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Area).HasMaxLength(200);
    }
}
