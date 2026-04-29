
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

            const [accountsResponse, mtAccountsResponse] = await Promise.all([
                supabase.from('accounts').select('*').eq('is_archived', false).order('created_at', { ascending: true }),
                supabase.from('mt_connected_accounts').select('*').order('connected_at', { ascending: true })
            ])

            if (accountsResponse.error) throw accountsResponse.error

            let mergedAccounts = accountsResponse.data || []

            if (!mtAccountsResponse.error && mtAccountsResponse.data) {
                const mtMapped = mtAccountsResponse.data.map(mt => ({
                    id: mt.id,
                    user_id: mt.user_id,
                    name: `${mt.login} · ${mt.broker || mt.server}`,
                    currency: mt.currency || 'USD',
                    initial_balance: mt.balance || 0,
                    current_balance: mt.balance || 0,
                    is_archived: false,
                    created_at: mt.connected_at,
                    updated_at: mt.last_synced_at || mt.connected_at
                }))
                mergedAccounts = [...mergedAccounts, ...mtMapped]
            }

            if (mergedAccounts.length === 0) {
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
                setAccounts(mergedAccounts)
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
