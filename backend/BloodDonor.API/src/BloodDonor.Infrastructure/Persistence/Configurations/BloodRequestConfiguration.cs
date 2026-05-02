using BloodDonor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BloodDonor.Infrastructure.Persistence.Configurations;

public sealed class BloodRequestConfiguration : IEntityTypeConfiguration<BloodRequest>
{
    public void Configure(EntityTypeBuilder<BloodRequest> builder)
    {
        builder.ToTable("blood_requests");
        builder.HasKey(x => x.Id);

        builder.HasIndex(x => x.SeekerId);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.BloodGroup);
        builder.HasIndex(x => x.RequiredByDate);
        builder.HasIndex(x => x.CreatedAtUtc);
        builder.HasIndex(x => new { x.Status, x.BloodGroup, x.CreatedAtUtc });

        builder.Property(x => x.HospitalName).HasMaxLength(200).IsRequired();
        builder.Property(x => x.HospitalAddress).HasMaxLength(500).IsRequired();
        builder.Property(x => x.ContactPersonName).HasMaxLength(100).IsRequired();
        builder.Property(x => x.ContactPersonPhone).HasMaxLength(20).IsRequired();
        builder.Property(x => x.PatientName).HasMaxLength(100);
        builder.Property(x => x.PrescriptionUrl).HasMaxLength(500);

        builder.HasOne(x => x.Seeker)
            .WithMany()
            .HasForeignKey(x => x.SeekerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
