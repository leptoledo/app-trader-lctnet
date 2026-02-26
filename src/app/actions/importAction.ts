"use server"
import { Trade } from "@/types"

export async function importCsvAction(userId: string, accessToken: string, tradesToInsert: Partial<Trade>[]) {
    try {
        if (!userId || !tradesToInsert || tradesToInsert.length === 0 || !accessToken) {
            throw new Error("Não há dados válidos para importar ou ocorreu falha na autenticação.")
        }

        // Reconectando o cliente Supabase com o Token JWT do usuário repassado pelo frontend
        const { createClient } = require("@supabase/supabase-js");
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                global: {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            }
        );

        // Filtramos trades que POSSUEM ticket_id (como MetaTrader, Tickmill) para checar duplicata
        const tradesComTicket = tradesToInsert.filter(t => !!t.ticket_id)
        let newTrades = [...tradesToInsert]

        if (tradesComTicket.length > 0) {
            const ticketIds = tradesComTicket.map(t => t.ticket_id as string)

            const { data: existingTrades, error: checkError } = await supabase
                .from("trades")
                .select("ticket_id")
                .eq("user_id", userId)
                .in("ticket_id", ticketIds)

            if (checkError) throw new Error("Erro ao verificar duplicatas: " + checkError.message)

            const existingTicketIds = new Set(existingTrades?.map((t: any) => t.ticket_id) || [])

            // Remove as duplicatas baseadas no ticket_id encontrado
            newTrades = tradesToInsert.filter((t: any) => !t.ticket_id || !existingTicketIds.has(t.ticket_id))
        }

        if (newTrades.length === 0) {
            return {
                success: true,
                message: "Todos os trades do arquivo processado já haviam sido sincronizados anteriormente.",
                count: 0
            }
        }

        // Marcar todos os novos trades com anotação padrão para o relatorio saber que são de CSV/Plataforma
        const finalPayload = newTrades.map(t => ({
            ...t,
            user_id: userId,
            notes: t.notes || "SYNC_CSV"
        }))

        // INSERÇÃO
        const { error: insertError } = await supabase
            .from("trades")
            .insert(finalPayload)

        if (insertError) {
            throw new Error(`Erro na engine do BD: ${insertError.message}`)
        }

        return {
            success: true,
            message: `${finalPayload.length} novos trades sincronizados com sucesso.`,
            count: finalPayload.length
        }

    } catch (error: any) {
        console.error(`[CSV IMPORT ERROR]: `, error.message)
        return {
            success: false,
            error: error.message || "Erro desconhecido ao cadastrar execuções via arquivo."
        }
    }
}
