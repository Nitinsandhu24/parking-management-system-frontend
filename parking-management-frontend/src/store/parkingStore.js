import { create } from 'zustand'

const useParkingStore = create((set, get) => ({
  lots: [],
  selectedLot: null,
  floors: [],
  slots: [],
  slotStats: { available: 0, occupied: 0, reserved: 0, maintenance: 0 },
  loading: false,

  setLots: (lots) => set({ lots }),

  setSelectedLot: (lot) => set({ selectedLot: lot, floors: [], slots: [] }),

  setFloors: (floors) => set({ floors }),

  setSlots: (slots) => {
    const stats = slots.reduce(
      (acc, slot) => {
        const key = slot.status?.toLowerCase()
        if (key in acc) acc[key]++
        return acc
      },
      { available: 0, occupied: 0, reserved: 0, maintenance: 0 }
    )
    set({ slots, slotStats: stats })
  },

  updateSlotStatus: (slotId, status) => {
    set((state) => {
      const slots = state.slots.map((s) =>
        s.id === slotId ? { ...s, status } : s
      )
      const stats = slots.reduce(
        (acc, slot) => {
          const key = slot.status?.toLowerCase()
          if (key in acc) acc[key]++
          return acc
        },
        { available: 0, occupied: 0, reserved: 0, maintenance: 0 }
      )
      return { slots, slotStats: stats }
    })
  },

  setLoading: (loading) => set({ loading }),

  reset: () =>
    set({
      lots: [],
      selectedLot: null,
      floors: [],
      slots: [],
      slotStats: { available: 0, occupied: 0, reserved: 0, maintenance: 0 },
      loading: false,
    }),
}))

export default useParkingStore
