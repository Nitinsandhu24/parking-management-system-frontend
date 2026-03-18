import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      tenant: null,
      isAuthenticated: false,

      setAuth: ({ user, token, tenant }) =>
        set({ user, token, tenant, isAuthenticated: true }),

      logout: () =>
        set({ user: null, token: null, tenant: null, isAuthenticated: false }),

      hasRole: (role) => get().user?.roles?.includes(role) ?? false,
      isSuperAdmin:  () => get().hasRole('ROLE_SUPER_ADMIN'),
      isTenantAdmin: () => get().hasRole('ROLE_TENANT_ADMIN'),
      isOperator:    () => get().hasRole('ROLE_OPERATOR'),
      isUser:        () => get().hasRole('ROLE_USER'),
      isAdminRole:   () => {
        const roles = get().user?.roles ?? []
        return roles.some(r => ['ROLE_SUPER_ADMIN','ROLE_TENANT_ADMIN','ROLE_OPERATOR'].includes(r))
      },
    }),
    {
      name: 'parkos-auth',
      partialize: (s) => ({ user: s.user, token: s.token, tenant: s.tenant, isAuthenticated: s.isAuthenticated }),
    }
  )
)

export default useAuthStore
