using BloodDonor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BloodDonor.Infrastructure.Persistence.Configurations;

public sealed class RequestResponseConfiguration : IEntityTypeConfiguration<RequestResponse>
{
    public void Configure(EntityTypeBuilder<RequestResponse> builder)
    {
        builder.ToTable("request_responses");
        builder.HasKey(x => x.Id);

        builder.HasIndex(x => x.RequestId);
        builder.HasIndex(x => x.DonorId);
        builder.HasIndex(x => new { x.RequestId, x.DonorId }).IsUnique();

        builder.Property(x => x.Notes).HasMaxLength(1000);

        builder.HasOne(x => x.Request)
            .WithMany(x => x.Responses)
            .HasForeignKey(x => x.RequestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Donor)
            .WithMany()
            .HasForeignKey(x => x.DonorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
