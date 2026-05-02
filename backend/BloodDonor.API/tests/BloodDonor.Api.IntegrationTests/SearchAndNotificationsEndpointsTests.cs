using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;

namespace BloodDonor.Api.IntegrationTests;

public class SearchAndNotificationsEndpointsTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public SearchAndNotificationsEndpointsTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task SearchDonors_ShouldReturnUnauthorized_WithoutToken()
    {
        using var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/search/donors?recipientBloodGroup=8&latitude=23.8&longitude=90.4&radiusKm=10&page=1&pageSize=10");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task NotificationsList_ShouldReturnUnauthorized_WithoutToken()
    {
        using var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/notifications?page=1&pageSize=10");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
