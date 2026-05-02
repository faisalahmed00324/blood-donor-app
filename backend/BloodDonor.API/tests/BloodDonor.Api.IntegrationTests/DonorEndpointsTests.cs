using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace BloodDonor.Api.IntegrationTests;

public class DonorEndpointsTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public DonorEndpointsTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetMyProfile_ShouldReturnUnauthorized_WithoutToken()
    {
        using var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/donors/me");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task UpsertMyProfile_ShouldReturnUnauthorized_WithoutToken()
    {
        using var client = _factory.CreateClient();
        var response = await client.PutAsJsonAsync("/api/donors/me", new
        {
            bloodGroup = 8,
            dateOfBirth = "1995-01-01",
            weightKg = 65,
            latitude = 23.8,
            longitude = 90.4,
            city = "Dhaka",
            area = "Uttara",
            isPhoneVisible = false
        });
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
