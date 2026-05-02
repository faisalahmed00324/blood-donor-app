using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace BloodDonor.Api.IntegrationTests;

public class AuthEndpointsTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public AuthEndpointsTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Register_ShouldReturnBadRequest_ForInvalidPayload()
    {
        using var client = _factory.CreateClient();
        var payload = new
        {
            email = "invalid-email",
            password = "123",
            fullName = "",
            phone = "",
            role = 1
        };

        var response = await client.PostAsJsonAsync("/api/auth/register", payload);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Refresh_ShouldReturnBadRequest_ForMissingToken()
    {
        using var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/refresh", new { refreshToken = "" });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
