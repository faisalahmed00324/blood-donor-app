using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace BloodDonor.Api.IntegrationTests;

public class RequestEndpointsTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public RequestEndpointsTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task ListRequests_ShouldReturnUnauthorized_WithoutToken()
    {
        using var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/requests?page=1&pageSize=10");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CreateRequest_ShouldReturnUnauthorized_WithoutToken()
    {
        using var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/requests", new
        {
            bloodGroup = 8,
            unitsNeeded = 2,
            urgencyLevel = 1,
            requestType = 1,
            patientName = "Patient",
            hospitalName = "City Hospital",
            hospitalAddress = "Dhaka",
            latitude = 23.8,
            longitude = 90.4,
            contactPersonName = "Person",
            contactPersonPhone = "0123456789",
            requiredByDate = "2026-06-30",
            notes = "Urgent",
            prescriptionUrl = ""
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
