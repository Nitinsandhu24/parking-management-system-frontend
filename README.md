# parking-management-frontend

React 18 · Vite · Tailwind CSS · Zustand · React Router v6

## Tech stack

| Layer | Library |
|---|---|
| Framework | React 18 |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 |
| State | Zustand 4 (with `persist` middleware) |
| Routing | React Router v6 (data router) |
| HTTP | Axios (JWT + tenant interceptors) |
| Real-time | @stomp/stompjs + SockJS |
| Charts | Recharts |
| Toasts | react-hot-toast |
| Date utils | dayjs |

## Getting started

```bash
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:3000

## Environment variables

```
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_BASE_URL=ws://localhost:8080/ws
VITE_APP_NAME=ParkOS
```

## Project structure

```
src/
  api/          Axios instance + per-domain API modules
  components/   Shared UI + domain components
  hooks/        useAuth, useWebSocket, useTenant
  pages/        One file per route
  router/       AppRouter, PrivateRoute, RoleGuard
  store/        Zustand stores (auth, parking, booking, notifications)
  utils/        Date, currency, slot color helpers
```

## Roles

| Role | Access |
|---|---|
| `ROLE_SUPER_ADMIN` | All pages including Tenant Admin |
| `ROLE_TENANT_ADMIN` | All pages except Tenant Admin |
| `ROLE_OPERATOR` | Dashboard, Parking, Bookings, Vehicles |

## Docker

```bash
docker build -t parkos-frontend .
docker run -p 80:80 parkos-frontend
```
