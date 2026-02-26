"use server"

import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseAdminClient } from "@/lib/supabase-admin"
import { BinanceAdapter } from "@/lib/adapters/binanceAdapter"
import { BinanceTradeResponse } from "@/types/sync"

export async function syncTradesAction(userId: string, exchangeName: string, targetSymbol: string = 'BTCUSDT') {
    try {
        // Validação básica do usuário e da string
        if (!userId || !exchangeName) {
            throw new Error("Parâmetros do usuário ou da corretora inválidos.")
        }

        const formattedExchange = exchangeName.toUpperCase()
        const supabase = await createSupabaseServerClient()

        // 1. OBTENÇÃO E DESCRIPTAÇÃO DAS CHAVES DA API DO USUÁRIO
        // OBS: Isso assumindo que o ambiente decriptasse automaticamente a partir do DB
        // Se usar pgcrypto puro, usaria supabase.rpc("get_decrypted_user_key", { user_id })
        const { data: keysData, error: keysError } = await supabase
            .from("user_api_keys")
            .select("api_key, api_secret")
            .eq("user_id", userId)
            .eq("exchange", formattedExchange)
            .single()

        if (keysError || !keysData) {
            throw new Error(`As credenciais de API para a conta da ${formattedExchange} não puderam ser encontradas. Verifique se estão configuradas em suas configurações.`)
        }

        const apiKey = keysData.api_key
        const apiSecret = keysData.api_secret

        // 2. CONSTRUÇÃO E ASSINATURA DO REQUEST BINANCE API
        const timestamp = Date.now().toString()
        const queryString = `symbol=${targetSymbol}&timestamp=${timestamp}`

        // Chamada à nossa classe estática de Criptografia Baseada em Servidor Node.js
        const signature = BinanceAdapter.signRequest(queryString, apiSecret)

        // URL da rota myTrades
        const endpoint = `${BinanceAdapter.API_BASE_URL}/api/v3/myTrades?${queryString}&signature=${signature}`

        // 3. RECUPERAÇÃO DOS DADOS NA BINANCE (Fetch)
        const response = await fetch(endpoint, {
            method: "GET",
            headers: {
                "X-MBX-APIKEY": apiKey,
                "Content-Type": "application/json",
            },
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`O servidor da Binance recusou a requisição: ${response.status} - ${errorText}`)
        }

        const rawTrades: BinanceTradeResponse[] = await response.json()

        if (!rawTrades || rawTrades.length === 0) {
            return {
                success: true,
                message: `Não foi encontrado nenhum trade novo na Binance para o símbolo ${targetSymbol}.`,
                count: 0
            }
        }

        // 4. NORMALIZAÇÃO USANDO O ADAPTER
        const normalizedTrades = BinanceAdapter.normalize(userId, rawTrades)

        // 5. REMOÇÃO DE DUPLICATAS MANUAL (Evita conflitos se a tabela não tiver a constraint UNIQUE por padrão)
        const tradeIds = normalizedTrades.map(t => t.ticket_id)

        const supabaseAdmin = createSupabaseAdminClient()

        const { data: existingTrades } = await supabaseAdmin
            .from("trades")
            .select("ticket_id")
            .eq("user_id", userId)
            .in("ticket_id", tradeIds)

        const existingTicketIds = new Set(existingTrades?.map(t => t.ticket_id) || [])
        const newTradesToInsert = normalizedTrades.filter(t => !existingTicketIds.has(t.ticket_id))

        if (newTradesToInsert.length === 0) {
            return {
                success: true,
                message: `Os pares puxados da Binance já estão registrados no seu sistema.`,
                count: 0
            }
        }

        // 6. INSERÇÃO NA TABELA TRADES VIA SUPABASE
        const { error: insertError } = await supabaseAdmin
            .from("trades")
            .insert(newTradesToInsert)

        if (insertError) {
            throw new Error(`Erro na engine de inserção do Banco de Dados: ${insertError.message}`)
        }

        return {
            success: true,
            message: `${newTradesToInsert.length} novos trades da Binance sincronizados com sucesso.`,
            count: newTradesToInsert.length
        }

    } catch (error: any) {
        // Assegura que falhas em qualquer processo não vazem keys para o console nem p/ Cliente Frontend
        console.error(`[SYNC ACTION ERROR] - ${exchangeName}: `, error.message)
        return {
            success: false,
            error: error.message || "Erro desconhecido ao tentar parear os trades do sistema."
        }
    }
}
