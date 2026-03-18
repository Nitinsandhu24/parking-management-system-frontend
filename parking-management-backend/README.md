# parking-management-backend

Spring Boot 3 · PostgreSQL · JWT · WebSocket · Flyway · Multi-tenant

## Tech stack

| Layer | Library |
|---|---|
| Framework | Spring Boot 3.2 (Java 21) |
| Security | Spring Security + JJWT |
| Database | PostgreSQL 16 + Spring Data JPA |
| Migrations | Flyway |
| Real-time | Spring WebSocket (STOMP + SockJS) |
| Async | Spring `@Async` + `@Scheduled` |
| Notifications | Spring Mail |
| Build | Maven 3.9 |
| Containerisation | Docker + Docker Compose |

## Quick start (Docker)

```bash
docker compose up -d
```

Backend available at http://localhost:8080

Default super-admin credentials:
- Email: `admin@parkos.com`
- Password: `Admin@123`

## Quick start (local)

Requires Java 21 + PostgreSQL running locally.

```bash
# Create the database
createdb parking_master

# Run
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `DB_HOST` | localhost | PostgreSQL host |
| `DB_PORT` | 5432 | PostgreSQL port |
| `DB_NAME` | parking_master | Database name |
| `DB_USER` | postgres | DB username |
| `DB_PASSWORD` | postgres | DB password |
| `JWT_SECRET` | (insecure default) | Min 256-bit secret — **change in prod** |
| `FRONTEND_URL` | http://localhost:3000 | CORS allowed origin |
| `MAIL_HOST` | smtp.gmail.com | SMTP host |
| `MAIL_USER` | (empty) | SMTP username |
| `MAIL_PASS` | (empty) | SMTP password |

## API overview

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/register` | Create user (admin only) |
| GET | `/api/parking/lots` | List parking lots |
| POST | `/api/parking/lots` | Create lot |
| GET | `/api/parking/lots/{id}/floors` | List floors |
| POST | `/api/parking/lots/{id}/floors` | Add floor + slots |
| GET | `/api/parking/floors/{id}/slots` | List slots |
| PATCH | `/api/parking/slots/{id}/status` | Update slot status |
| GET | `/api/parking/lots/{id}/availability` | Live availability |
| GET | `/api/bookings` | List bookings |
| POST | `/api/bookings` | Create booking |
| PATCH | `/api/bookings/{id}/checkin` | Check in |
| PATCH | `/api/bookings/{id}/checkout` | Check out |
| PATCH | `/api/bookings/{id}/cancel` | Cancel |
| POST | `/api/vehicles/entry` | Log vehicle entry |
| POST | `/api/vehicles/exit` | Log vehicle exit |
| GET | `/api/vehicles/logs` | All vehicle logs |
| POST | `/api/payments/initiate` | Initiate payment |
| GET | `/api/payments/{id}/invoice` | Get invoice |
| GET | `/api/analytics/dashboard` | Dashboard summary |
| GET | `/api/analytics/occupancy` | Occupancy trend |
| GET | `/api/analytics/revenue` | Revenue by day |
| GET | `/api/tenants` | List tenants (super-admin) |
| POST | `/api/tenants` | Create + provision tenant |

## WebSocket

Connect via SockJS at `/ws`. After connecting:

- Subscribe to `/topic/tenant/{tenantId}/slots` for real-time slot status updates
- Subscribe to `/topic/tenant/{tenantId}/notifications` for in-app notifications

## Multi-tenancy

Uses schema-per-tenant in PostgreSQL. Each tenant gets an isolated schema provisioned via Flyway on creation. The tenant is resolved from the JWT `tenantId` claim on every request.

## Project structure

```
src/main/java/com/parking/
  config/       TenantContext, MultiTenantDataSource, Security, WebSocket, CORS
  auth/         JWT, User, UserDetails, AuthService, AuthController
  tenant/       Tenant provisioning, TenantService, TenantController
  parking/      Lots, Floors, Slots, ParkingService, ParkingController
  booking/      Booking lifecycle, BookingService, BookingController
  vehicle/      Vehicle registry, entry/exit logs, EntryExitService
  payment/      Payment flow, invoice, PaymentService, PaymentController
  notification/ Email + async notifications
  realtime/     WebSocket slot publisher, RealtimeController
  analytics/    Dashboard summary, occupancy, revenue
  exception/    GlobalExceptionHandler

src/main/resources/
  application.yml
  application-dev.yml
  db/migration/
    V1__create_master_schema.sql      # master schema (tenants, users)
    tenant/
      V1__create_parking.sql          # per-tenant: lots, floors, slots
      V2__create_bookings_payments.sql
      V3__create_vehicles.sql
```
