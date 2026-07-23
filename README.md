# Merdam — Dog Grooming Salon Appointment Manager

A full-stack web app for managing a dog grooming salon's dogs, owners, and
appointment calendar. UI available in English and Polish.

## Features

- **Dogs** — name, breed, and behavior notes, each linked to an owner.
- **Owners** — first name, last name, and phone number.
- **Calendar** — month/week/day views (via `react-big-calendar`). Click an
  empty slot to create an appointment, click an existing appointment to
  edit or delete it. Appointment blocks are sized proportionally to their
  duration.
- **Appointments** — store dog, start time, duration, price, and notes;
  each block displays the dog's name/breed and the owner's name/phone.
- **Login** — the whole app sits behind a single username/password (JWT).
  There's no self-service registration; the one account is configured on
  the backend (see [Authentication](#authentication) below).
- **English / Polish** language switcher (top right), including the
  calendar's own month/day names and toolbar.
- Form validation on both the client (inline) and the server (DataAnnotations
  + a global exception-handling middleware).
- Responsive layout for desktop and mobile.

## Tech Stack

- **Frontend:** React 19 + Vite, React Router, `react-big-calendar`, `date-fns`
- **Backend:** ASP.NET Core 8 Web API, Entity Framework Core (SQLite), JWT
  bearer auth, Swagger/OpenAPI

## Project Structure

```
server/   ASP.NET Core Web API (Controllers, DTOs, Entities, Exceptions,
          Infrastructure, Migrations, Services, Utils)
client/   React + Vite single-page app
```

The backend follows a standard layered structure:

| Folder            | Purpose                                                    |
|--------------------|-------------------------------------------------------------|
| `Controllers/`     | HTTP endpoints (thin, delegate to Services)                |
| `DTOs/`            | Request/response shapes + validation attributes             |
| `Entities/`        | EF Core entity classes (`Owner`, `Dog`, `Appointment`)      |
| `Exceptions/`      | Domain exceptions (`NotFoundException`, `BadRequestException`) |
| `Infrastructure/`  | `ApplicationDbContext`, `DbSeeder`, exception-handling middleware |
| `Migrations/`      | EF Core migrations                                          |
| `Services/`        | Business logic, one interface + implementation per entity   |
| `Utils/`           | Shared helpers (e.g. `PhoneNumberAttribute` validator)       |

## Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- Node.js 18+

No external database server needed — the backend uses a local SQLite file
(`server/grooming.db`), created automatically on first run.

### 1. Backend

```bash
cd server
dotnet restore
dotnet run --launch-profile http
```

On startup (Development environment) the app runs pending EF Core
migrations automatically and seeds a couple of sample dogs/owners/
appointments. The API listens on `http://localhost:5046` (see
`Properties/launchSettings.json`) with Swagger UI at `/swagger`.

To manage migrations manually:

```bash
dotnet tool install --global dotnet-ef   # once
dotnet ef migrations add <Name>
dotnet ef database update
```

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

The app runs on `http://localhost:5173` and proxies `/api` requests to the
backend (see `client/vite.config.js`).

Open `http://localhost:5173` in your browser.

### Default login (local development only)

- **Username:** `groomer`
- **Password:** `Merdam2026!`

These come from `server/appsettings.Development.json` and only apply when
running locally. **Change them before deploying anywhere real** — see below.

## Authentication

The API is entirely behind JWT auth (`[Authorize]` by default on every
controller except `POST /api/auth/login`). Credentials are not stored in a
database table — there's exactly one account, configured via the `Auth`
section of configuration:

```json
"Auth": {
  "Username": "groomer",
  "PasswordHash": "<hash>",
  "JwtSecret": "<random secret, 32+ bytes>",
  "TokenExpiryHours": "12"
}
```

For **production**, don't put real credentials in `appsettings.json` (it's
committed to git). Override them with environment variables instead — ASP.NET
Core maps double-underscore env vars to nested config keys:

```bash
Auth__Username=groomer
Auth__PasswordHash=<hash>
Auth__JwtSecret=<random secret>
```

To generate a password hash for a new password, run this from `server/`:

```bash
dotnet run -- --generate-hash "YourNewPassword"
```

This prints a hash and exits without starting the web server — paste the
output into `Auth:PasswordHash` (or `Auth__PasswordHash` as an env var).

Generate a JWT secret with:

```bash
openssl rand -base64 32
```

## Deploying (making it reachable by a link)

Because the database is SQLite (a single file) instead of SQL Server, the
backend runs anywhere a normal Linux container does. There's a `server/
Dockerfile` ready to go. Concretely, using **Railway** for the backend
(persistent volumes on the free/hobby tier) and **Vercel** for the frontend
(free static hosting):

### Backend (Railway)

1. Push `server/` to GitHub (its own repo, or a subfolder — either works).
2. On [railway.app](https://railway.app): **New Project → Deploy from GitHub
   repo** → pick the repo. Railway detects the `Dockerfile` automatically.
3. **Settings → Volumes**: add a volume, mount path `/data`.
4. **Variables**, add:
   - `Auth__Username` = whatever you want the login to be
   - `Auth__PasswordHash` = output of `dotnet run -- --generate-hash "YourPassword"`
   - `Auth__JwtSecret` = output of `openssl rand -base64 32`
   - `ConnectionStrings__DefaultConnection` = `Data Source=/data/grooming.db`
   - `Cors__AllowedOrigins` = your frontend's URL once you have it (comma-
     separate if there's more than one, e.g. a preview + production URL)
5. Deploy. Railway gives you a public URL like
   `https://your-app.up.railway.app` — that's your API base.

Never reuse the dev defaults (`groomer` / `Merdam2026!`) here.

### Frontend (Vercel)

1. Push `client/` to GitHub.
2. On [vercel.com](https://vercel.com): **Add New → Project** → pick the
   repo. Framework preset: Vite.
3. **Environment Variables**: add `VITE_API_URL` = `https://your-app.up.railway.app/api`
   (the Railway URL from above, with `/api` on the end).
4. Deploy. Vercel gives you a URL like `https://merdam.vercel.app`.
5. Go back to Railway and set `Cors__AllowedOrigins` to that exact Vercel
   URL (no trailing slash), so the backend accepts requests from it.

### Give it to the groomer

The Vercel URL from step 4 above is the one link she needs — bookmark it on
her phone/computer. Log in once with the credentials you set in step 4 of
the backend setup.

## API Overview

All responses use camelCase JSON (the ASP.NET Core default). Every endpoint
below requires `Authorization: Bearer <token>` except login.

| Method | Path                  | Description                    |
|--------|-----------------------|---------------------------------|
| POST   | /api/auth/login       | Log in, returns a JWT          |
| GET    | /api/owners           | List owners                    |
| POST   | /api/owners           | Create owner                   |
| PUT    | /api/owners/{id}      | Update owner                   |
| DELETE | /api/owners/{id}      | Delete owner (cascades)        |
| GET    | /api/dogs             | List dogs (with owner info)    |
| POST   | /api/dogs              | Create dog                     |
| PUT    | /api/dogs/{id}         | Update dog                     |
| DELETE | /api/dogs/{id}         | Delete dog (cascades)          |
| GET    | /api/appointments      | List appointments (with dog/owner info) |
| POST   | /api/appointments      | Create appointment             |
| PUT    | /api/appointments/{id} | Update appointment             |
| DELETE | /api/appointments/{id} | Delete appointment             |
