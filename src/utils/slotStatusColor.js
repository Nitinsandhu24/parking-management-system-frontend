export const slotStatusBadge = (status) => {
  const map = {
    AVAILABLE: 'badge-available',
    OCCUPIED: 'badge-occupied',
    RESERVED: 'badge-reserved',
    MAINTENANCE: 'badge-maintenance',
  }
  return map[status?.toUpperCase()] ?? 'badge-maintenance'
}

export const slotStatusBg = (status) => {
  const map = {
    AVAILABLE: 'bg-emerald-500',
    OCCUPIED: 'bg-red-500',
    RESERVED: 'bg-amber-500',
    MAINTENANCE: 'bg-surface-600',
  }
  return map[status?.toUpperCase()] ?? 'bg-surface-600'
}
