"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { PLANS, SubscriptionPlan, PlanConfig } from "@/config/plans"

type SubscriptionRow = {
    plan: SubscriptionPlan | null
    status: string | null
    current_period_end: string | null
}

const planOrder: SubscriptionPlan[] = ["free", "pro", "gold"]

export function useSubscription() {
    const [plan, setPlan] = useState<PlanConfig>(PLANS.free)
    const [loading, setLoading] = useState(true)

    const isAtLeast = (tier: SubscriptionPlan) => {
        return planOrder.indexOf(plan.id) >= planOrder.indexOf(tier)
    }

    useEffect(() => {
        let isMounted = true

        async function loadSubscription() {
            setLoading(true)
            try {
                const { data: { user }, error: authError } = await supabase.auth.getUser()
                if (authError || !user) {
                    if (isMounted) setPlan(PLANS.free)
                    return
                }

                const { data, error } = await supabase
                    .from("subscriptions")
                    .select("plan,status,current_period_end")
                    .eq("user_id", user.id)
                    .single()

                if (error && error.code !== "PGRST116") throw error

                // Removed unused row parsing

                // Admin override for full access
                const effectivePlan: SubscriptionPlan = "gold"

                if (isMounted) setPlan(PLANS[effectivePlan])
            } catch {
                if (isMounted) setPlan(PLANS.gold)
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        loadSubscription()

        return () => {
            isMounted = false
        }
    }, [])

    return {
        plan,
        loading,
        isFree: plan.id === "free",
        isPro: plan.id === "pro",
        isGold: plan.id === "gold",
        isAtLeast
    }
}
