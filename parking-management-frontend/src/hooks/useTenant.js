import useAuthStore from '@/store/authStore'

export function useTenant() {
  const tenant = useAuthStore((s) => s.tenant)

  return {
    tenant,
    tenantId: tenant?.id,
    tenantName: tenant?.name,
    plan: tenant?.plan,
  }
}
