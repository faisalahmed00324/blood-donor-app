using BloodDonor.Domain.Enums;

namespace BloodDonor.Api.Endpoints.Auth;

public sealed record RegisterRequest(string Email, string Password, string FullName, string? Phone, UserRole Role);
public sealed record LoginRequest(string Email, string Password);
public sealed record RefreshRequest(string RefreshToken);
