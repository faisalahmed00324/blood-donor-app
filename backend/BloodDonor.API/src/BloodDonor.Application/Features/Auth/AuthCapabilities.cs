using BloodDonor.Domain.Enums;

namespace BloodDonor.Application.Features.Auth;

public static class AuthCapabilities
{
    public static bool CanSeek(UserRole role)
    {
        return role is UserRole.Donor or UserRole.Seeker or UserRole.Hospital or UserRole.Admin;
    }

    public static bool CanManageDonorProfile(UserRole role)
    {
        return role is UserRole.Donor or UserRole.Seeker;
    }
}
