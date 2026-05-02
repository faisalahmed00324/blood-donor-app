using BloodDonor.Api.DependencyInjection;
using BloodDonor.Api.Endpoints;
using BloodDonor.Api.Endpoints.Auth;
using BloodDonor.Api.Endpoints.Donors;
using BloodDonor.Api.Endpoints.Notifications;
using BloodDonor.Api.Endpoints.Requests;
using BloodDonor.Api.Endpoints.Search;
using BloodDonor.Api.Middleware;
using BloodDonor.Application.DependencyInjection;
using BloodDonor.Infrastructure.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApi();

var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>();
app.UseCors("web");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.MapOpenApi();
}

app.MapRootEndpoints();
app.MapHealthEndpoints();
app.MapAuthEndpoints();
app.MapDonorEndpoints();
app.MapRequestEndpoints();
app.MapSearchEndpoints();
app.MapNotificationEndpoints();

app.Run();

public partial class Program;
