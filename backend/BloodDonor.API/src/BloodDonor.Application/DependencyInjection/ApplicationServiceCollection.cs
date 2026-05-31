using BloodDonor.Application.Messaging;
using Microsoft.Extensions.DependencyInjection;

namespace BloodDonor.Application.DependencyInjection;

public static class ApplicationServiceCollection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IApplicationDispatcher, ApplicationDispatcher>();
        services.AddRequestHandlers();

        return services;
    }

    private static IServiceCollection AddRequestHandlers(this IServiceCollection services)
    {
        var handlerTypes = typeof(ApplicationServiceCollection).Assembly
            .GetTypes()
            .Where(type => type is { IsAbstract: false, IsInterface: false })
            .Select(type => new
            {
                Implementation = type,
                Interfaces = type.GetInterfaces()
                    .Where(interfaceType =>
                        interfaceType.IsGenericType
                        && (interfaceType.GetGenericTypeDefinition() == typeof(IRequestHandler<>)
                            || interfaceType.GetGenericTypeDefinition() == typeof(IRequestHandler<,>)))
                    .ToArray()
            })
            .Where(type => type.Interfaces.Length > 0);

        foreach (var handlerType in handlerTypes)
        {
            foreach (var serviceType in handlerType.Interfaces)
            {
                services.AddScoped(serviceType, handlerType.Implementation);
            }
        }

        return services;
    }
}
