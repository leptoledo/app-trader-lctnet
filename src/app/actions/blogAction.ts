"use server"

import { createSupabaseServerClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { createClient } from "@supabase/supabase-js"

export async function createBlogPostAction(formData: FormData) {
    try {
        let supabase = await createSupabaseServerClient()

        const token = formData.get("access_token") as string | null;
        if (token) {
            supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                { global: { headers: { Authorization: `Bearer ${token}` } } }
            ) as any;
        }

        // Obter usuário logado
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError || !userData?.user) {
            throw new Error("Não autorizado. Faça login para publicar no blog.")
        }

        const title = formData.get("title") as string
        const category = formData.get("category") as string
        const excerpt = formData.get("excerpt") as string
        const content = formData.get("content") as string
        const readTime = formData.get("readTime") as string
        const imageUrl = formData.get("image_url") as string
        const requestedPublished = formData.get("published") === "true"

        if (!title || !content) {
            throw new Error("Título e conteúdo são campos obrigatórios.")
        }

        // Determinar o status
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", userData.user.id).single()
        const isAdmin = profile?.role === "admin"
        
        let status = "draft"
        let published = false

        if (isAdmin) {
            status = requestedPublished ? "published" : "draft"
            published = requestedPublished
        } else {
            status = requestedPublished ? "pending" : "draft"
            published = false
        }

        // Gerar slug a partir do título
        let slug = title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "")

        // Adicionar salt se o slug já existir (simplificado)
        const randomString = Math.random().toString(36).substring(2, 6)
        slug = `${slug}-${randomString}`

        const { error: insertError } = await supabase
            .from("blog_posts")
            .insert({
                author_id: userData.user.id,
                title,
                slug,
                category,
                excerpt,
                content,
                read_time: readTime || "5 min read",
                image_url: imageUrl || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1470&auto=format&fit=crop',
                published,
                status
            })

        if (insertError) {
            throw new Error(`Erro ao salvar o artigo: ${insertError.message}`)
        }

        revalidatePath("/blog")
        revalidatePath("/(auth)/blog")

        return { success: true, message: "Artigo criado com sucesso!" }
    } catch (error: any) {
        console.error("[BLOG CREATE ERROR]", error)
        return { success: false, error: error.message || "Erro desconhecido." }
    }
}

export async function updateBlogPostAction(id: string, formData: FormData) {
    try {
        let supabase = await createSupabaseServerClient()

        const token = formData.get("access_token") as string | null;
        if (token) {
            supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                { global: { headers: { Authorization: `Bearer ${token}` } } }
            ) as any;
        }

        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError || !userData?.user) {
            throw new Error("Não autorizado. Faça login para editar no blog.")
        }

        const title = formData.get("title") as string
        const category = formData.get("category") as string
        const excerpt = formData.get("excerpt") as string
        const content = formData.get("content") as string
        const readTime = formData.get("readTime") as string
        const imageUrl = formData.get("image_url") as string
        const requestedPublished = formData.get("published") === "true"

        if (!title || !content) {
            throw new Error("Título e conteúdo são campos obrigatórios.")
        }

        // Checar se usuário é dono do post ou se é admin
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", userData.user.id).single()
        const isAdmin = profile?.role === "admin"
        
        const { data: postData } = await supabase.from("blog_posts").select("author_id").eq("id", id).single()
        
        if (!isAdmin && postData?.author_id !== userData.user.id) {
            throw new Error("Não autorizado para editar este post.")
        }

        let status = "draft"
        let published = false

        if (isAdmin) {
            status = requestedPublished ? "published" : "draft"
            published = requestedPublished
        } else {
            status = requestedPublished ? "pending" : "draft"
            published = false
        }

        const { error: updateError } = await supabase
            .from("blog_posts")
            .update({
                title,
                category,
                excerpt,
                content,
                read_time: readTime || "5 min read",
                image_url: imageUrl || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1470&auto=format&fit=crop',
                published,
                status
            })
            .eq("id", id)

        if (updateError) {
            throw new Error(`Erro ao atualizar o artigo: ${updateError.message}`)
        }

        revalidatePath("/blog")
        revalidatePath("/(auth)/blog")
        revalidatePath("/(auth)/admin/posts")

        return { success: true, message: "Artigo atualizado com sucesso!" }
    } catch (error: any) {
        console.error("[BLOG UPDATE ERROR]", error)
        return { success: false, error: error.message || "Erro desconhecido na atualização." }
    }
}

export async function deleteBlogPostAction(id: string, token: string | null) {
    try {
        let supabase = await createSupabaseServerClient()

        if (token) {
            supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                { global: { headers: { Authorization: `Bearer ${token}` } } }
            ) as any;
        }

        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError || !userData?.user) {
            throw new Error("Não autorizado para excluir este blog post.")
        }

        const { error: deleteError } = await supabase
            .from("blog_posts")
            .delete()
            .eq("id", id)

        if (deleteError) {
            throw new Error(`Erro ao excluir: ${deleteError.message}`)
        }

        revalidatePath("/blog")
        revalidatePath("/(auth)/blog")
        revalidatePath("/(auth)/admin/posts")

        return { success: true, message: "Artigo excluído com sucesso!" }
    } catch (error: any) {
        console.error("[BLOG DELETE ERROR]", error)
        return { success: false, error: error.message || "Erro desconhecido ao excluir." }
    }
}

export async function moderateBlogPostAction(id: string, action: 'approve' | 'reject', token?: string | null) {
    try {
        // Step 1: Verify the caller's identity and role using their token
        const { createSupabaseAdminClient } = await import("@/lib/supabase-admin")
        const supabaseAdmin = createSupabaseAdminClient()

        if (!token) throw new Error("Não autorizado.")

        const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token)
        if (authError || !authData?.user) throw new Error("Sessão inválida.")

        const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("role")
            .eq("id", authData.user.id)
            .single()

        if (profile?.role !== "admin") throw new Error("Apenas administradores podem moderar posts.")

        // Step 2: Perform the update using admin client (bypasses RLS)
        const updates = action === 'approve'
            ? { status: 'published', published: true }
            : { status: 'rejected', published: false }

        const { error: updateError } = await supabaseAdmin
            .from("blog_posts")
            .update(updates)
            .eq("id", id)

        if (updateError) throw new Error(`Erro ao moderar post: ${updateError.message}`)

        revalidatePath("/blog")
        revalidatePath("/(auth)/blog")
        revalidatePath("/(auth)/admin/posts")

        return { success: true, message: action === 'approve' ? "Artigo aprovado e publicado!" : "Artigo rejeitado." }
    } catch (error: unknown) {
        console.error("[BLOG MODERATE ERROR]", error)
        return { success: false, error: (error as Error).message || "Erro desconhecido ao moderar post." }
    }
}
