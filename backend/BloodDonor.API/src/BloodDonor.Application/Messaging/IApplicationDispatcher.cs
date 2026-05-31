using BloodDonor.Application.Common;

namespace BloodDonor.Application.Messaging;

public interface IApplicationDispatcher
{
    Task<Result> Send<TRequest>(TRequest request, CancellationToken cancellationToken)
        where TRequest : IRequest;

    Task<Result<TResponse>> Send<TResponse>(IRequest<TResponse> request, CancellationToken cancellationToken);
}
