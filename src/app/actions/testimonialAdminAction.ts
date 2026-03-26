"use server"

import { createSupabaseAdminClient } from "@/lib/supabase-admin"

export async function fetchAdminTestimonialsAction(accessToken: string | null) {
    try {
        if (!accessToken) return { success: false, error: "Não autorizado.", data: [] }

        const supabaseAdmin = createSupabaseAdminClient()
        const { data: authData } = await supabaseAdmin.auth.getUser(accessToken)
        if (!authData?.user) return { success: false, error: "Sessão inválida.", data: [] }

        const { data: callerProfile } = await supabaseAdmin
            .from("profiles")
            .select("role")
            .eq("id", authData.user.id)
            .single()

        if (callerProfile?.role !== "admin") return { success: false, error: "Acesso negado.", data: [] }

        const { data, error } = await supabaseAdmin
            .from("testimonials")
            .select("*")
            .order("created_at", { ascending: false })

        if (error) throw error

        return { success: true, data: data || [] }
    } catch (error: any) {
        console.error("[FETCH TESTIMONIALS ERROR]", error)
        return { success: false, error: "Erro ao buscar depoimentos.", data: [] }
    }
}

export async function moderateTestimonialAction(
    id: string,
    action: 'approve' | 'reject',
    accessToken: string | null
) {
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

        if (action === 'approve') {
            const { error: updateError } = await supabaseAdmin
                .from("testimonials")
                .update({ approved: true })
                .eq("id", id)

            if (updateError) throw updateError
            return { success: true, message: "Depoimento aprovado com sucesso! Já está público na Landing Page." }
        } else {
            // Rejeitar: vamos excluir da base de dados para evitar lixo eletrônico.
            const { error: deleteError } = await supabaseAdmin
                .from("testimonials")
                .delete()
                .eq("id", id)

            if (deleteError) throw deleteError
            return { success: true, message: "Depoimento rejeitado e excluído com sucesso." }
        }
    } catch (error: any) {
        console.error("[MODERATE TESTIMONIAL ERROR]", error)
        return { success: false, error: error.message || "Erro desconhecido." }
    }
}
