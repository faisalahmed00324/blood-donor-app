using BloodDonor.Application.Features.Auth.Register;
using BloodDonor.Domain.Enums;

namespace BloodDonor.Application.Tests.Auth;

public class RegisterValidatorTests
{
    [Fact]
    public void Should_Fail_When_PasswordTooShort()
    {
        var command = new RegisterCommand("x@y.com", "123", "Test", null, UserRole.Donor);
        var result = RegisterValidator.Validate(command);
        Assert.False(result.IsSuccess);
    }

    [Fact]
    public void Should_Pass_When_CommandValid()
    {
        var command = new RegisterCommand("x@y.com", "Password123", "Test User", null, UserRole.Seeker);
        var result = RegisterValidator.Validate(command);
        Assert.True(result.IsSuccess);
    }
}
