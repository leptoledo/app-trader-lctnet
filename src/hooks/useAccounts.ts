
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
        } catch (error: any) {
            toast.error('Error loading accounts: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAccounts()
    }, [])

    return { accounts, loading, refreshAccounts: fetchAccounts }
}
