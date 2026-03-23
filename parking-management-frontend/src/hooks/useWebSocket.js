import { useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import useAuthStore from '@/store/authStore'
import useParkingStore from '@/store/parkingStore'
import useNotificationStore from '@/store/notificationStore'

export function useWebSocket() {
  const clientRef = useRef(null)
  const { token, tenant } = useAuthStore()
  const { updateSlotStatus } = useParkingStore()
  const { addNotification, setWsConnected } = useNotificationStore()

  const connect = useCallback(() => {
    if (!token || !tenant?.id) return
    if (token.startsWith('mock-')) return

    const wsUrl = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080')
      .replace('http://', 'ws://')
      .replace('https://', 'wss://')

    const client = new Client({
      brokerURL: `${wsUrl}/ws/websocket`,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
        'X-Tenant-ID': tenant.id,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        setWsConnected(true)
        client.subscribe(`/topic/tenant/${tenant.id}/slots`, (message) => {
          const { slotId, status } = JSON.parse(message.body)
          updateSlotStatus(slotId, status)
        })
        client.subscribe(`/topic/tenant/${tenant.id}/notifications`, (message) => {
          addNotification(JSON.parse(message.body))
        })
      },
      onDisconnect: () => setWsConnected(false),
      onStompError:  () => setWsConnected(false),
      onWebSocketError: () => setWsConnected(false),
    })

    client.activate()
    clientRef.current = client
  }, [token, tenant, updateSlotStatus, addNotification, setWsConnected])

  const disconnect = useCallback(() => {
    clientRef.current?.deactivate()
    clientRef.current = null
    setWsConnected(false)
  }, [setWsConnected])

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  return { disconnect }
}