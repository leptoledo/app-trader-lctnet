import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AccountStore {
    selectedAccountId: string
    setSelectedAccountId: (id: string) => void
}

export const useAccountStore = create<AccountStore>()(
    persist(
        (set) => ({
            selectedAccountId: "all",
            setSelectedAccountId: (id) => set({ selectedAccountId: id })
        }),
        {
            name: 'account-storage',
        }
    )
)
