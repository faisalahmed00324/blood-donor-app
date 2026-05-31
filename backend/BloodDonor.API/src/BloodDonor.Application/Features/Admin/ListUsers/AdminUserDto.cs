using BloodDonor.Domain.Enums;

namespace BloodDonor.Application.Features.Admin.ListUsers;

public sealed record AdminUserDto(
    Guid Id,
    string FullName,
    string Email,
    string? Phone,
    UserRole Role,
    bool IsActive,
    bool IsEmailVerified,
    bool IsPhoneVerified,
    bool HasDonorProfile,
    DateTime CreatedAtUtc
);
