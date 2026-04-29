"use server"

import { createSupabaseAdminClient } from "@/lib/supabase-admin"

// MetaApi is initialized with token from env
const METAAPI_TOKEN = process.env.METAAPI_TOKEN || ""
const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export async function connectMetaTraderAction(
    userId: string,
    login: string,
    password: string,
    server: string,
    platform: "mt4" | "mt5" = "mt5"
) {
    try {
        if (!userId) return { success: false, error: "Usuário não fornecido." }
        if (!login || !password || !server) return { success: false, error: "Preencha todos os campos." }

        if (!METAAPI_TOKEN) {
            return {
                success: false,
                error: "MetaApi não configurado. Adicione METAAPI_TOKEN ao .env.local."
            }
        }

        const supabaseAdmin = createSupabaseAdminClient()

        // Check account limit by subscription plan
        const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("settings")
            .eq("id", userId)
            .single()

        const { data: existingAccounts } = await supabaseAdmin
            .from("mt_connected_accounts")
            .select("id")
            .eq("user_id", userId)

        // Free plan limit: 1 account
        const { data: subscription } = await supabaseAdmin
            .from("subscriptions")
            .select("plan_id")
            .eq("user_id", userId)
            .eq("status", "active")
            .single()

        const isPro = !!subscription
        const accountLimit = isPro ? 999 : 1

        if ((existingAccounts?.length || 0) >= accountLimit) {
            return {
                success: false,
                error: isPro
                    ? "Limite de contas atingido."
                    : "Plano gratuito permite apenas 1 conta. Faça upgrade para PRO."
            }
        }

        // Call MetaApi REST API to provision account
        const createRes = await fetch("https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "auth-token": METAAPI_TOKEN
            },
            body: JSON.stringify({
                login,
                password,
                name: `${login}@${server}`,
                server,
                platform,
                type: "cloud",
                magic: 0
            })
        })

        if (!createRes.ok) {
            const err = await createRes.json().catch(() => ({ message: createRes.statusText }))
            console.error("[METAAPI CREATE ERROR]", JSON.stringify(err, null, 2))
            
            let errorMessage = err.message || "Erro ao conectar conta."
            if (err.details && Array.isArray(err.details)) {
                errorMessage += ": " + err.details.map((d: any) => `${d.property} ${d.message}`).join(", ")
            } else if (typeof err.details === 'object' && err.details !== null) {
                errorMessage += ": " + JSON.stringify(err.details)
            }

            return { success: false, error: `MetaApi: ${errorMessage}` }
        }

        const accountData = await createRes.json()
        const metaapiAccountId = accountData.id

        // Fetch account info to get broker, balance, currency
        let broker = server
        let balance = 0
        let currency = "USD"
        let accountType = "DEMO"

        try {
            const infoRes = await fetch(
                `https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts/${metaapiAccountId}`,
                { headers: { "auth-token": METAAPI_TOKEN } }
            )
            if (infoRes.ok) {
                const info = await infoRes.json()
                broker = info.broker || server
                accountType = info.type === "real" ? "REAL" : "DEMO"
            }
        } catch {
            // Non-critical, continue
        }

        // Save to Supabase
        const { error: dbError } = await supabaseAdmin
            .from("mt_connected_accounts")
            .insert({
                user_id: userId,
                metaapi_account_id: metaapiAccountId,
                login,
                server,
                broker,
                name: `${login}@${server}`,
                platform,
                account_type: accountType,
                balance,
                currency,
                status: "DEPLOYING"
            })

        if (dbError) throw dbError

        return {
            success: true,
            message: "Conta conectada! A sincronização iniciará em instantes.",
            accountId: metaapiAccountId
        }
    } catch (error: any) {
        console.error("[CONNECT MT]", error)
        return { success: false, error: error.message || "Erro ao conectar conta MetaTrader." }
    }
}

export async function disconnectMetaTraderAction(userId: string, id: string, metaapiAccountId: string) {
    try {
        if (!userId) return { success: false, error: "Usuário não fornecido." }

        // Call MetaApi to delete account
        if (METAAPI_TOKEN && metaapiAccountId) {
            await fetch(
                `https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts/${metaapiAccountId}`,
                {
                    method: "DELETE",
                    headers: { "auth-token": METAAPI_TOKEN }
                }
            ).catch(() => { /* ignore MetaApi errors, still remove from DB */ })
        }

        const supabaseAdmin = createSupabaseAdminClient()
        const { error } = await supabaseAdmin
            .from("mt_connected_accounts")
            .delete()
            .eq("id", id)
            .eq("user_id", userId)

        if (error) throw error

        return { success: true, message: "Conta desconectada com sucesso." }
    } catch (error: any) {
        console.error("[DISCONNECT MT]", error)
        return { success: false, error: error.message || "Erro ao desconectar conta." }
    }
}

export async function getMtConnectedAccountsAction(userId: string) {
    try {
        if (!userId) return { success: false, error: "Usuário não fornecido." }

        const supabaseAdmin = createSupabaseAdminClient()
        const { data, error } = await supabaseAdmin
            .from("mt_connected_accounts")
            .select("*")
            .eq("user_id", userId)
            .order("connected_at", { ascending: false })

        if (error) throw error

        return { success: true, accounts: data }
    } catch (error: any) {
        console.error("[GET MT ACCOUNTS]", error)
        return { success: false, error: error.message || "Erro ao buscar contas." }
    }
}
