"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { PLANS, SubscriptionPlan, PlanConfig } from "@/config/plans"

const planOrder: SubscriptionPlan[] = ["free", "pro", "gold"]

export type SubscriptionDetails = {
    stripeCustomerId: string | null
    stripeSubscriptionId: string | null
    status: string | null
    currentPeriodEnd: string | null
}

export function useSubscription() {
    const [plan, setPlan] = useState<PlanConfig>(PLANS.free)
    const [loading, setLoading] = useState(true)
    const [details, setDetails] = useState<SubscriptionDetails>({
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        status: null,
        currentPeriodEnd: null
    })

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
                    .select("plan, status, current_period_end, stripe_customer_id, stripe_subscription_id")
                    .eq("user_id", user.id)
                    .single()

                // PGRST116 = no row found (user is free tier)
                if (error && error.code !== "PGRST116") throw error

                // Verificar se é admin
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", user.id)
                    .single()

                const isAdmin = profile?.role === "admin"

                const activeStatuses = ["active", "trialing"]
                const isActive = data && activeStatuses.includes(data.status ?? "")
                const dbPlan = (data?.plan ?? "free") as SubscriptionPlan
                
                // Admins têm acesso Gold de forma vitalícia/gratuita, sem depender da base de assinaturas 
                const effectivePlan = isAdmin ? "gold" : (isActive ? dbPlan : "free")

                if (isMounted) {
                    setPlan(PLANS[effectivePlan] ?? PLANS.free)
                    setDetails({
                        stripeCustomerId: data?.stripe_customer_id ?? null,
                        stripeSubscriptionId: data?.stripe_subscription_id ?? null,
                        status: isAdmin ? 'active' : (data?.status ?? null),
                        currentPeriodEnd: data?.current_period_end ?? null
                    })
                }
            } catch {
                if (isMounted) setPlan(PLANS.free)
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
        details,
        isFree: plan.id === "free",
        isPro: plan.id === "pro",
        isGold: plan.id === "gold",
        isAtLeast
    }
}
