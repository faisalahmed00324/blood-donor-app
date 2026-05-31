using BloodDonor.Application.Common;
using Microsoft.Extensions.DependencyInjection;

namespace BloodDonor.Application.Messaging;

internal sealed class ApplicationDispatcher(IServiceProvider serviceProvider) : IApplicationDispatcher
{
    public Task<Result> Send<TRequest>(TRequest request, CancellationToken cancellationToken)
        where TRequest : IRequest
    {
        var handler = serviceProvider.GetRequiredService<IRequestHandler<TRequest>>();
        return handler.Handle(request, cancellationToken);
    }

    public Task<Result<TResponse>> Send<TResponse>(IRequest<TResponse> request, CancellationToken cancellationToken)
    {
        var handlerType = typeof(IRequestHandler<,>).MakeGenericType(request.GetType(), typeof(TResponse));
        var handler = serviceProvider.GetRequiredService(handlerType);

        return ((dynamic)handler).Handle((dynamic)request, cancellationToken);
    }
}
