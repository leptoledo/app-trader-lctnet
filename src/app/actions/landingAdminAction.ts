"use server"

import { createSupabaseAdminClient } from "@/lib/supabase-admin"

export async function fetchAllLandingSectionsAction() {
    try {
        const supabase = createSupabaseAdminClient()
        const { data, error } = await supabase
            .from('landing_page_configs')
            .select('*')
        
        if (error) {
            console.error("fetch configs error", error)
            return { success: false, error: error.message, data: [] }
        }
        
        return { success: true, data: data || [] }
    } catch (err: any) {
        console.error("fetch exception", err)
        return { success: false, error: err.message, data: [] }
    }
}

export async function saveLandingSectionAction(
    sectionId: string, 
    content: any, 
    status: 'draft' | 'published',
    accessToken: string
) {
    try {
        const supabase = createSupabaseAdminClient()
        
        // Verifica se é admin
        const { data: authData } = await supabase.auth.getUser(accessToken)
        if (!authData?.user) return { success: false, error: "Sessão inválida" }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", authData.user.id)
            .single()

        if (profile?.role !== "admin") {
            return { success: false, error: "Acesso restrito para administradores." }
        }

        // Verifica se a sessão já existe
        const { data: existing } = await supabase
            .from('landing_page_configs')
            .select('*')
            .eq('section_id', sectionId)
            .single()
        
        const payload: any = { 
            section_id: sectionId,
        }
        
        if (status === 'draft') {
            payload.draft_content = content
        } else {
            // Status Published - Iguala o draft e o publico
            payload.draft_content = content
            payload.published_content = content
            payload.updated_at = new Date().toISOString()
        }

        if (existing) {
            const { error: updateError } = await supabase
                .from('landing_page_configs')
                .update(payload)
                .eq('section_id', sectionId)
            if (updateError) throw updateError
        } else {
            const { error: insertError } = await supabase
                .from('landing_page_configs')
                .insert([payload])
            if (insertError) throw insertError
        }

        return { success: true, message: `Seção '${sectionId}' salva como ${status}!` }
    } catch (error: any) {
        console.error("[SAVE LANDING ERROR]", error)
        return { success: false, error: error.message || "Erro desconhecido ao salvar." }
    }
}
