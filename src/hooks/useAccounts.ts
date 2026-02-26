
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Account } from "@/types"
import { toast } from "sonner"

export function useAccounts() {
    const [accounts, setAccounts] = useState<Account[]>([])
    const [loading, setLoading] = useState(true)

    const fetchAccounts = async () => {
        try {
            const isDemo = typeof window !== 'undefined' && sessionStorage.getItem('demo_mode') === 'true';
            if (isDemo) {
                setAccounts([{
                    id: "demo-account",
                    user_id: "demo-user",
                    name: "Conta de Demonstração (USD)",
                    currency: "USD",
                    initial_balance: 10000,
                    current_balance: 10000,
                    is_archived: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                } as Account])
                setLoading(false)
                return
            }

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('accounts')
                .select('*')
                .eq('is_archived', false)
                .order('created_at', { ascending: true })

            if (error) throw error

            if (!data || data.length === 0) {
                const { data: newAccount, error: createError } = await supabase
                    .from('accounts')
                    .insert([{
                        user_id: user.id,
                        name: 'Main Account',
                        currency: 'USD',
                        initial_balance: 10000
                    }])
                    .select()
                    .single()

                if (createError) throw createError
                setAccounts([newAccount])
            } else {
                setAccounts(data)
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error'
            toast.error('Error loading accounts: ' + message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAccounts()
    }, [])

    return { accounts, loading, refreshAccounts: fetchAccounts }
}
