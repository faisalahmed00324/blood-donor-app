using BloodDonor.Application.Common;

namespace BloodDonor.Application.Messaging;

public interface IRequestHandler<in TRequest>
    where TRequest : IRequest
{
    Task<Result> Handle(TRequest request, CancellationToken cancellationToken);
}

public interface IRequestHandler<in TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    Task<Result<TResponse>> Handle(TRequest request, CancellationToken cancellationToken);
}
