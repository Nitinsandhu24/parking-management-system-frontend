import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import RoleGuard from './RoleGuard'

import AppLayout      from '@/components/common/AppLayout'
import UserLayout     from '@/components/user/UserLayout'

import Login          from '@/pages/Login'
import Signup         from '@/pages/Signup'
import NotFound       from '@/pages/NotFound'

// Admin pages
import Dashboard      from '@/pages/Dashboard'
import ParkingLots    from '@/pages/ParkingLots'
import Bookings       from '@/pages/Bookings'
import VehicleLogs    from '@/pages/VehicleLogs'
import Payments       from '@/pages/Payments'
import Analytics      from '@/pages/Analytics'
import TenantAdmin    from '@/pages/TenantAdmin'

// Customer pages
import FindParking    from '@/pages/user/FindParking'
import SlotPicker     from '@/pages/user/SlotPicker'
import Checkout       from '@/pages/user/Checkout'
import BookingConfirm from '@/pages/user/BookingConfirm'
import MyBookings     from '@/pages/user/MyBookings'
import MyVehicles     from '@/pages/user/MyVehicles'
import UserProfile    from '@/pages/user/UserProfile'

const ADMIN_ROLES = ['ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN', 'ROLE_OPERATOR']

const router = createBrowserRouter([
  { path: '/login',  element: <Login /> },
  { path: '/signup', element: <Signup /> },
  { path: '/', element: <Navigate to="/login" replace /> },

  // ── Admin routes (dark sidebar layout) ──────────────────────────────────
  {
    path: '/dashboard',
    element: (
      <PrivateRoute>
        <RoleGuard roles={ADMIN_ROLES}>
          <AppLayout />
        </RoleGuard>
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
    ],
  },
  {
    element: (
      <PrivateRoute>
        <RoleGuard roles={ADMIN_ROLES}>
          <AppLayout />
        </RoleGuard>
      </PrivateRoute>
    ),
    children: [
      { path: '/parking',   element: <ParkingLots /> },
      { path: '/bookings',  element: <Bookings /> },
      { path: '/vehicles',  element: <VehicleLogs /> },
      { path: '/payments',  element: <Payments /> },
      { path: '/analytics', element: <RoleGuard roles={['ROLE_SUPER_ADMIN','ROLE_TENANT_ADMIN']}><Analytics /></RoleGuard> },
      { path: '/admin',     element: <RoleGuard roles={['ROLE_SUPER_ADMIN']}><TenantAdmin /></RoleGuard> },
    ],
  },

  // ── Customer routes (light top-nav layout) ───────────────────────────────
  {
    element: (
      <PrivateRoute>
        <UserLayout />
      </PrivateRoute>
    ),
    children: [
      { path: '/find-parking',         element: <FindParking /> },
      { path: '/lots/:id/book',        element: <SlotPicker /> },
      { path: '/checkout',             element: <Checkout /> },
      { path: '/booking/:id',          element: <BookingConfirm /> },
      { path: '/my-bookings',          element: <MyBookings /> },
      { path: '/my-vehicles',          element: <MyVehicles /> },
      { path: '/profile',              element: <UserProfile /> },
    ],
  },

  { path: '*', element: <NotFound /> },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
