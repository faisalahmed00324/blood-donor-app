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
            AuthEndpoints.cs
          Admin/
            AdminEndpoints.cs
          Donors/
            DonorEndpoints.cs
          Requests/
            RequestEndpoints.cs
          Search/
            SearchEndpoints.cs
          Notifications/
            NotificationEndpoints.cs
        Middleware/
          ExceptionMiddleware.cs
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
            Login/
              LoginCommand.cs
              LoginHandler.cs
            Refresh/
              RefreshCommand.cs
              RefreshHandler.cs
          Admin/
            ListUsers/
              ListUsersQuery.cs
              ListUsersHandler.cs
              AdminUserDto.cs
            DeactivateUser/
              DeactivateUserCommand.cs
              DeactivateUserHandler.cs
            ListRequests/
              ListAdminRequestsQuery.cs
              ListAdminRequestsHandler.cs
              AdminRequestDto.cs
            ListDonorProfiles/
              ListDonorProfilesQuery.cs
              ListDonorProfilesHandler.cs
              AdminDonorProfileDto.cs
          Donors/
            GetMyProfile/
              GetMyProfileQuery.cs
              GetMyProfileHandler.cs
            UpsertMyProfile/
              UpsertMyProfileCommand.cs
              UpsertMyProfileHandler.cs
              UpsertMyProfileValidator.cs
            UpdateAvailability/
              UpdateAvailabilityCommand.cs
              UpdateAvailabilityHandler.cs
          Requests/
            CreateRequest/
              CreateRequestCommand.cs
              CreateRequestHandler.cs
            ListRequests/
              ListRequestsQuery.cs
              ListRequestsHandler.cs
            UpdateRequestStatus/
              UpdateRequestStatusCommand.cs
              UpdateRequestStatusHandler.cs
            RespondToRequest/
              RespondToRequestCommand.cs
              RespondToRequestHandler.cs
          Search/
            SearchDonors/
              SearchDonorsQuery.cs
              SearchDonorsHandler.cs
              DonorSearchResultDto.cs
          Notifications/
            CreateInAppNotification/
              CreateInAppNotificationCommand.cs
              CreateInAppNotificationHandler.cs
            ListMyNotifications/
              ListMyNotificationsQuery.cs
              ListMyNotificationsHandler.cs
          Messaging/
            IRequest.cs
            IRequestHandler.cs
            IApplicationDispatcher.cs
            ApplicationDispatcher.cs
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
        Authentication/
          JwtTokenService.cs
          PasswordHasherAdapter.cs
        Notifications/
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

- One use case per folder (`Command/Query`, `Handler`, optional `Validator`, DTOs where needed).
- Keep handlers small; move non-trivial logic to domain rules or services.
- Use immutable request models where possible.
- Return consistent `Result` objects from handlers.
- Keep endpoint code focused on parse -> dispatch request -> map response.

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
    RegisterRequest request,
    IApplicationDispatcher dispatcher,
    CancellationToken ct) =>
{
    var result = await dispatcher.Send(
        new RegisterCommand(request.Email, request.Password, request.FullName, request.Phone, request.Role),
        ct);

    return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
});
```

For role-restricted groups, prefer endpoint-group authorization:

```csharp
var group = app.MapGroup("/api/admin")
    .WithTags("Admin")
    .RequireAuthorization("AdminOnly");
```

## Dependency Injection Pattern

- `ApplicationServiceCollection`: register dispatcher and handler interfaces, preferably by assembly scanning.
- `InfrastructureServiceCollection`: register DB context, repositories, external adapters.
- `ApiServiceCollection`: CORS, rate limiting, OpenAPI, endpoint groups.

Authorization details that fit the current app well:

- JWT contains `ClaimTypes.Role` and `ClaimTypes.NameIdentifier`
- `InfrastructureServiceCollection` defines role policies such as `AdminOnly`
- JWT validation can reject inactive users to make deactivation effective immediately on later requests

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
- A lightweight in-process dispatcher interface is enough for MVP endpoint decoupling.
- Keep reflection-heavy libraries minimal.
- Use projection queries (`Select`) for read endpoints.
- Add pagination defaults to all list endpoints.
- Keep background jobs opt-in and lightweight in MVP.

## First Implementation Checklist

1. Create projects and references for `Api`, `Application`, `Domain`, `Infrastructure`.
2. Add shared `Result` and basic validation pipeline.
3. Implement auth module end-to-end (register/login/refresh).
4. Implement donor profile and request modules using the same pattern.
5. Add admin read/list modules once base roles are stable.
6. Add tests for blood compatibility and cooldown logic.
7. Add rate limiting, exception middleware, and health checks.
