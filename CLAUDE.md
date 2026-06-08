# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Horse Racing management system — .NET 9.0 Web API backend + React 19 frontend with SQL Server.

## Development Commands

### Backend (`BE/`)
```bash
dotnet run --project BE          # Start API (https://localhost:5226 by default)
dotnet build BE                  # Build only
dotnet ef migrations add <Name> --project BE   # Create EF migration
dotnet ef database update --project BE         # Apply migrations
```

### Frontend (`FE/`)
```bash
cd FE && npm run dev             # Start Vite dev server (http://localhost:5173)
cd FE && npm run build           # Production build
cd FE && npm run lint            # ESLint
cd FE && npm run preview         # Preview production build
```

FE connects to the API at the URL in env `VITE_API_BASE_URL` (defaults to `http://localhost:5226`).

## Architecture

### Backend: Layered API

```
Controllers → Services → Repositories (interfaces) → EF Core → SQL Server
```

- **Controllers** (`BE/Controllers/`) — Thin, delegate to services, return `IActionResult` via `ServiceResult<T>`.
- **Services** (`BE/Services/`) — Business logic. Each service has an interface in `BE/Services/Interfaces/`. Services return `ServiceResult<T>` which wraps status code + `ApiResult<T>` payload.
- **Repositories** (`BE/Repositories/`) — Data access. Many repositories are combined in `Be2Repositories.cs`. `UnitOfWork` coordinates saves across repositories.
- **Models** (`BE/Models/`) — EF entity classes. Enums in `Enums.cs` define `UserRole`, `RaceStatus`, `RegistrationStatus`, etc.
- **Dtos** (`BE/Dtos/`) — Request/response DTOs grouped by feature (Auth, Race, Tournament, Referee, etc.).
- **Data** (`BE/Data/ApplicationDbContext.cs`) — EF DbContext with 17 DbSets, all relationship config in `OnModelCreating` using `DeleteBehavior.Restrict` throughout (no cascade deletes).
- **Auth**: JWT Bearer (configured in `Program.cs`). JWT options read from `appsettings.json` → `JwtOptions` class. `AuthService` handles login/register.

### Frontend: React + Vite + React Router

```
src/
  components/   — Header, Footer
  pages/        — HomePage, TournamentListPage, TournamentDetailPage,
                  RaceSchedulePage, LiveResultsPage, LeaderboardPage,
                  LoginPage, RegisterPage
  services/     — API client (currently authApi.js: login, register)
```

- React Router 7 with `<BrowserRouter>`, route map in [App.jsx](FE/src/App.jsx).
- API calls use a shared `request()` helper in `authApi.js` — reads `VITE_API_BASE_URL`, sends JSON, parses error responses.
- Each page has a co-located `.css` file.

### Key Design Patterns

- **ServiceResult<T>** — All service methods return `ServiceResult<T>` (not exceptions). Controllers match on `StatusCode` to produce HTTP responses.
- **Unit of Work** — `IUnitOfWork` injects all repositories + `SaveChangesAsync()`. Services use it for multi-repo transactions.
- **Role-based access** — `UserRole` enum: `HorseOwner=1, Jockey=2, Spectator=3, Admin=4, Referee=5`.

### Migrations

`BE/Migrations/` is in `.gitignore`. Each environment generates its own. To set up a fresh DB: create and apply an initial migration via `dotnet ef migrations add InitialCreate --project BE` then `dotnet ef database update --project BE`.
