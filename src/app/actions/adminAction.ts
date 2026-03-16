"use server"

import { createSupabaseAdminClient } from "@/lib/supabase-admin"

export async function updateUserRoleAction(
    targetUserId: string,
    newRole: 'admin' | 'user',
    accessToken: string | null
) {
    try {
        if (!accessToken) {
            return { success: false, error: "Não autorizado. Faça login novamente." }
        }

        // Use admin client to verify caller's identity from token
        const supabaseAdmin = createSupabaseAdminClient()

        // Get the current user from the token
        const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(accessToken)

        if (authError || !authData?.user) {
            return { success: false, error: "Sessão inválida. Faça login novamente." }
        }

        const callerId = authData.user.id

        // Check the caller's role in profiles
        const { data: callerProfile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .select("role")
            .eq("id", callerId)
            .single()

        if (profileError || callerProfile?.role !== "admin") {
            return { success: false, error: "Apenas administradores podem alterar permissões." }
        }

        // Prevent self-demotion
        if (targetUserId === callerId && newRole === 'user') {
            return { success: false, error: "Você não pode remover seus próprios privilégios de Admin." }
        }

        // Update using admin client (bypasses RLS)
        const { error: updateError } = await supabaseAdmin
            .from("profiles")
            .update({ role: newRole })
            .eq("id", targetUserId)

        if (updateError) {
            return { success: false, error: `Erro no banco: ${updateError.message}` }
        }

        return {
            success: true,
            message: `Permissão atualizada para "${newRole}" com sucesso!`
        }
    } catch (error: any) {
        console.error("[UPDATE ROLE ERROR]", error)
        return { success: false, error: error.message || "Erro desconhecido." }
    }
}

export async function fetchUsersAdminAction(accessToken: string | null) {
    try {
        if (!accessToken) return { success: false, error: "Não autorizado.", users: [] }
            
        const supabaseAdmin = createSupabaseAdminClient()
        const { data: authData } = await supabaseAdmin.auth.getUser(accessToken)
        if (!authData?.user) return { success: false, error: "Sessão inválida.", users: [] }

        // Verify caller is admin
        const { data: callerProfile } = await supabaseAdmin
            .from("profiles")
            .select("role")
            .eq("id", authData.user.id)
            .single()

        if (callerProfile?.role !== "admin") return { success: false, error: "Acesso negado.", users: [] }

        // 1. Fetch profiles
        const { data: profiles, error: profilesError } = await supabaseAdmin
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false })
            
        if (profilesError) throw profilesError

        // 2. Fetch subscriptions
        const userIds = profiles.map(p => p.id)
        const { data: subs, error: subsError } = await supabaseAdmin
            .from("subscriptions")
            .select("user_id, plan, status, current_period_end")
            .in("user_id", userIds)

        if (subsError) throw subsError

        // Merge data
        const enrichedUsers = profiles.map(profile => {
            const userSub = subs.find(s => s.user_id === profile.id)
            return {
                ...profile,
                subscription: userSub || { plan: 'free', status: 'none', current_period_end: null }
            }
        })

        return { success: true, users: enrichedUsers }
    } catch (error: any) {
        console.error("[FETCH USERS ERROR]", error)
        return { success: false, error: "Erro ao buscar usuários", users: [] }
    }
}

export async function toggleUserBanAction(targetUserId: string, isBanned: boolean, accessToken: string | null) {
    try {
        if (!accessToken) return { success: false, error: "Não autorizado." }

        const supabaseAdmin = createSupabaseAdminClient()
        const { data: authData } = await supabaseAdmin.auth.getUser(accessToken)
        if (!authData?.user) return { success: false, error: "Sessão inválida." }

        // Verify caller is admin
        const { data: callerProfile } = await supabaseAdmin
            .from("profiles")
            .select("role")
            .eq("id", authData.user.id)
            .single()

        if (callerProfile?.role !== "admin") return { success: false, error: "Acesso negado." }

        if (targetUserId === authData.user.id) return { success: false, error: "Você não pode banir a si mesmo." }

        // Fetch current settings
        const { data: targetProfile } = await supabaseAdmin
            .from("profiles")
            .select("settings")
            .eq("id", targetUserId)
            .single()
            
        const currentSettings = targetProfile?.settings || {}
        
        // Update settings JSONB to include is_banned flag
        const { error: updateError } = await supabaseAdmin
            .from("profiles")
            .update({ settings: { ...currentSettings, is_banned: isBanned } })
            .eq("id", targetUserId)

        if (updateError) throw updateError

        return { success: true, message: isBanned ? "Usuário banido com sucesso." : "Usuário desbanido." }
    } catch (error: any) {
        console.error("[TOGGLE BAN ERROR]", error)
        return { success: false, error: error.message || "Erro desconhecido." }
    }
}

export async function fetchAdminDashboardStatsAction(accessToken: string | null) {
    try {
        if (!accessToken) return { success: false, error: "Não autorizado.", data: null }

        const supabaseAdmin = createSupabaseAdminClient()
        const { data: authData } = await supabaseAdmin.auth.getUser(accessToken)
        if (!authData?.user) return { success: false, error: "Sessão inválida.", data: null }

        // Verify caller is admin
        const { data: callerProfile } = await supabaseAdmin
            .from("profiles")
            .select("role")
            .eq("id", authData.user.id)
            .single()

        if (callerProfile?.role !== "admin") return { success: false, error: "Acesso negado.", data: null }

        // Fetch aggregate counts
        const [{ count: usersCount }, { count: tradesCount }, { count: postsCount }, { count: pendingCount }] = await Promise.all([
            supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('trades').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('blog_posts').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('blog_posts').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        ])

        // Fetch subscriptions to calculate plans distribution
        const { data: subsData } = await supabaseAdmin.from('subscriptions').select('plan, status')
        let freeCount = usersCount || 0
        let proCount = 0
        let goldCount = 0
        let activeSubs = 0

        if (subsData) {
            subsData.forEach(sub => {
                const isActive = sub.status === 'active' || sub.status === 'trialing'
                if (isActive) {
                    activeSubs++
                    if (sub.plan === 'pro') { proCount++; freeCount-- }
                    if (sub.plan === 'gold') { goldCount++; freeCount-- }
                }
            })
        }
        
        // Safety check if free count goes negative due to db mismatches
        if (freeCount < 0) freeCount = 0

        // Fetch recent profiles to build growth chart
        const { data: recentProfiles } = await supabaseAdmin
            .from('profiles')
            .select('created_at')
            .order('created_at', { ascending: true })

        // Build growth chart (last 6 months)
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
        const growthMap = new Map()

        // Initialize last 6 months with 0
        const d = new Date()
        for (let i = 5; i >= 0; i--) {
            const pastDate = new Date(d.getFullYear(), d.getMonth() - i, 1)
            const label = `${monthNames[pastDate.getMonth()]} ${pastDate.getFullYear().toString().substring(2)}`
            growthMap.set(label, { name: label, users: 0 })
        }

        if (recentProfiles) {
            recentProfiles.forEach(p => {
                const date = new Date(p.created_at)
                // only count if within the last 6 months
                const monthsDiff = (d.getFullYear() - date.getFullYear()) * 12 + d.getMonth() - date.getMonth()
                if (monthsDiff >= 0 && monthsDiff <= 5) {
                    const label = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().substring(2)}`
                    if (growthMap.has(label)) {
                        const item = growthMap.get(label)
                        item.users++
                    }
                }
            })
        }

        const growthChart = Array.from(growthMap.values())

        return {
            success: true,
            data: {
                counts: {
                    users: usersCount || 0,
                    trades: tradesCount || 0,
                    posts: postsCount || 0,
                    pending: pendingCount || 0
                },
                plans: {
                    free: freeCount,
                    pro: proCount,
                    gold: goldCount,
                    activeTotal: activeSubs
                },
                growth: growthChart
            }
        }

    } catch (error: any) {
        console.error("[FETCH ADMIN STATS ERROR]", error)
        return { success: false, error: "Erro ao buscar estatísticas do dashboard.", data: null }
    }
}
