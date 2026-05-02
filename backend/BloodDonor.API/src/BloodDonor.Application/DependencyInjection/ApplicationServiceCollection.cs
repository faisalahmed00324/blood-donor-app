using BloodDonor.Application.Features.Auth.Login;
using BloodDonor.Application.Features.Auth.Refresh;
using BloodDonor.Application.Features.Auth.Register;
using BloodDonor.Application.Features.Donors.GetMyProfile;
using BloodDonor.Application.Features.Donors.UpsertMyProfile;
using BloodDonor.Application.Features.Donors.UpdateAvailability;
using BloodDonor.Application.Features.Notifications.CreateInAppNotification;
using BloodDonor.Application.Features.Notifications.ListMyNotifications;
using BloodDonor.Application.Features.Requests.CreateRequest;
using BloodDonor.Application.Features.Requests.ListRequests;
using BloodDonor.Application.Features.Requests.RespondToRequest;
using BloodDonor.Application.Features.Requests.UpdateRequestStatus;
using BloodDonor.Application.Features.Search.SearchDonors;
using Microsoft.Extensions.DependencyInjection;

namespace BloodDonor.Application.DependencyInjection;

public static class ApplicationServiceCollection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<RegisterHandler>();
        services.AddScoped<LoginHandler>();
        services.AddScoped<RefreshHandler>();
        services.AddScoped<GetMyProfileHandler>();
        services.AddScoped<UpsertMyProfileHandler>();
        services.AddScoped<UpdateAvailabilityHandler>();
        services.AddScoped<CreateRequestHandler>();
        services.AddScoped<ListRequestsHandler>();
        services.AddScoped<UpdateRequestStatusHandler>();
        services.AddScoped<RespondToRequestHandler>();
        services.AddScoped<SearchDonorsHandler>();
        services.AddScoped<CreateInAppNotificationHandler>();
        services.AddScoped<ListMyNotificationsHandler>();

        return services;
    }
}
