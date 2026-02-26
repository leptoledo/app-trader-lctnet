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
        const published = formData.get("published") === "true"

        if (!title || !content) {
            throw new Error("Título e conteúdo são campos obrigatórios.")
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
                published
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
        const published = formData.get("published") === "true"

        if (!title || !content) {
            throw new Error("Título e conteúdo são campos obrigatórios.")
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
                published
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
