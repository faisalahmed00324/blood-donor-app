using System.Text.Json;

namespace BloodDonor.Api.Middleware;

public sealed class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
{
    public async Task Invoke(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            var correlationId = context.TraceIdentifier;
            logger.LogError(ex, "Unhandled error occurred. CorrelationId: {CorrelationId}", correlationId);

            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            context.Response.ContentType = "application/json";

            var payload = new
            {
                error = "ServerError",
                message = "An unexpected error occurred.",
                correlationId
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(payload));
        }
    }
}
