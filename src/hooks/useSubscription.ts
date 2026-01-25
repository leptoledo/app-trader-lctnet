"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { PLANS, SubscriptionPlan, PlanConfig } from "@/config/plans"

export function useSubscription() {
    // MODO DE TESTE: Acesso total liberado
    const [plan, setPlan] = useState<PlanConfig>(PLANS.gold)
    const [loading, setLoading] = useState(false)

    const isAtLeast = (tier: SubscriptionPlan) => {
        return true // Sempre liberado para testes
    }

    return {
        plan,
        loading,
        isFree: false,
        isPro: false,
        isGold: true,
        isAtLeast
    }
}
