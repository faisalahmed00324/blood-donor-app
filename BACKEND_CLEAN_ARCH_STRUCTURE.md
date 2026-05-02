# Backend Clean Architecture Structure (ASP.NET Core Minimal API)

## Objective
Define a lean, clean-code backend structure that is easy to maintain, test, and run on low-memory infrastructure.

## Recommended Project Layout

```text
backend/
  BloodDonor.API/
    src/
      BloodDonor.Api/
        Endpoints/
          Auth/
            RegisterEndpoint.cs
            LoginEndpoint.cs
          Donors/
            GetMyProfileEndpoint.cs
            UpdateMyProfileEndpoint.cs
          Requests/
            CreateRequestEndpoint.cs
            RespondToRequestEndpoint.cs
        Middleware/
          ExceptionMiddleware.cs
          RequestLoggingMiddleware.cs
        DependencyInjection/
          ApiServiceCollection.cs
        Program.cs

      BloodDonor.Application/
        Abstractions/
          Authentication/
            IJwtTokenService.cs
          Notifications/
            INotificationDispatcher.cs
          Persistence/
            IAppDbContext.cs
            IUnitOfWork.cs
          Time/
            IDateTimeProvider.cs
        Features/
          Auth/
            Register/
              RegisterCommand.cs
              RegisterHandler.cs
              RegisterValidator.cs
              RegisterResult.cs
            Login/
              LoginCommand.cs
              LoginHandler.cs
              LoginResult.cs
          Donors/
            GetMyProfile/
              GetMyProfileQuery.cs
              GetMyProfileHandler.cs
            UpdateMyProfile/
              UpdateMyProfileCommand.cs
              UpdateMyProfileHandler.cs
              UpdateMyProfileValidator.cs
          Requests/
            CreateRequest/
              CreateRequestCommand.cs
              CreateRequestHandler.cs
              CreateRequestValidator.cs
            RespondToRequest/
              RespondToRequestCommand.cs
              RespondToRequestHandler.cs
        Common/
          Result.cs
          Error.cs
          PagedResult.cs
        DependencyInjection/
          ApplicationServiceCollection.cs

      BloodDonor.Domain/
        Entities/
          User.cs
          DonorProfile.cs
          BloodRequest.cs
          RequestResponse.cs
          Notification.cs
        Enums/
          UserRole.cs
          BloodGroup.cs
          RequestStatus.cs
        ValueObjects/
          GeoPoint.cs
        Rules/
          BloodCompatibilityRules.cs
          DonationCooldownRules.cs

      BloodDonor.Infrastructure/
        Persistence/
          AppDbContext.cs
          Configurations/
            UserConfiguration.cs
            DonorProfileConfiguration.cs
            BloodRequestConfiguration.cs
          Migrations/
        Authentication/
          JwtTokenService.cs
          PasswordHasher.cs
        Notifications/
          EmailNotificationDispatcher.cs
          SmsNotificationDispatcher.cs
          InAppNotificationDispatcher.cs
        Time/
          DateTimeProvider.cs
        DependencyInjection/
          InfrastructureServiceCollection.cs

    tests/
      BloodDonor.Application.Tests/
      BloodDonor.Api.IntegrationTests/
```

## Layer Responsibilities

- Domain
  - Business entities, enums, pure rules.
  - No dependencies on external libraries or frameworks.

- Application
  - Use-case orchestration via commands/queries and handlers.
  - Validation and contract interfaces.
  - No direct EF Core/Npgsql/HTTP/SMTP/Twilio dependencies.

- Infrastructure
  - EF Core, database access, external integrations.
  - Implements Application interfaces.

- API
  - HTTP transport only: endpoint mapping, auth policies, response mapping.
  - No business rules in endpoints.

## Minimal Coding Rules

- One use case per folder (`Command/Query`, `Handler`, `Validator`, `Result`).
- Keep handlers small; move non-trivial logic to domain rules or services.
- Use immutable request models where possible.
- Return consistent `Result` objects from handlers.
- Keep endpoint code focused on parse -> call handler -> map response.

## Base Interfaces (Starter Set)

```csharp
public interface IAppDbContext
{
    DbSet<User> Users { get; }
    DbSet<DonorProfile> DonorProfiles { get; }
    DbSet<BloodRequest> BloodRequests { get; }
    DbSet<RequestResponse> RequestResponses { get; }
    DbSet<Notification> Notifications { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}

public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

public interface IDateTimeProvider
{
    DateTime UtcNow { get; }
}

public interface IJwtTokenService
{
    string CreateAccessToken(User user);
    string CreateRefreshToken();
}

public interface INotificationDispatcher
{
    Task DispatchAsync(Notification notification, CancellationToken cancellationToken = default);
}
```

## Endpoint Wiring Pattern

```csharp
app.MapPost("/api/auth/register", async (
    RegisterCommand command,
    RegisterHandler handler,
    CancellationToken ct) =>
{
    var result = await handler.Handle(command, ct);
    return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
});
```

## Dependency Injection Pattern

- `ApplicationServiceCollection`: register handlers, validators.
- `InfrastructureServiceCollection`: register DB context, repositories, external adapters.
- `ApiServiceCollection`: auth, CORS, rate limiting, OpenAPI, endpoint groups.

In `Program.cs`, call in this order:
1. `AddApplication()`
2. `AddInfrastructure(configuration)`
3. `AddApi(configuration)`

## Error Handling and Validation

- Global exception middleware maps unknown exceptions to 500 with correlation ID.
- Validation failures return 400 with structured error list.
- Domain rule failures return 409 or 422 depending on context.

## Testing Strategy

- Application tests: handlers and domain rules with in-memory/mocked interfaces.
- Integration tests: API endpoints against test database (containerized PostgreSQL).
- Keep fast unit tests for compatibility logic and cooldown calculations.

## Low-RAM Design Guidance

- Avoid heavyweight mediator frameworks unless needed.
- Keep reflection-heavy libraries minimal.
- Use projection queries (`Select`) for read endpoints.
- Add pagination defaults to all list endpoints.
- Keep background jobs opt-in and lightweight in MVP.

## First Implementation Checklist

1. Create projects and references for `Api`, `Application`, `Domain`, `Infrastructure`.
2. Add shared `Result` and basic validation pipeline.
3. Implement auth module end-to-end (register/login/refresh).
4. Implement donor profile and request modules using the same pattern.
5. Add tests for blood compatibility and cooldown logic.
6. Add rate limiting, exception middleware, and health checks.
