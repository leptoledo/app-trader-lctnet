import crypto from "crypto"
import { BinanceTradeResponse, NormalizedTrade } from "@/types/sync"

export class BinanceAdapter {
    static readonly EXCHANGE_NAME = "BINANCE"
    static readonly API_BASE_URL = "https://api.binance.com"

    /**
     * Assina uma Query String da Binance com o padrão HMAC SHA256 esperado pela corretora.
     * @param queryString String de parâmetros formatados no padrão form-urlencoded
     * @param apiSecret Secret fornecida pelo perfil do usuário na Binance
     * @returns A assinatura em Hash HEX
     */
    static signRequest(queryString: string, apiSecret: string): string {
        return crypto
            .createHmac("sha256", apiSecret)
            .update(queryString)
            .digest("hex")
    }

    /**
     * Padroniza um array bruto de execuções de trade devolvido da /api/v3/myTrades da Binance 
     * dentro do nosso envelope nativo do Trade Journal.
     */
    static normalize(userId: string, trades: BinanceTradeResponse[]) {
        return trades.map((trade) => {
            const side = trade.isBuyer ? "LONG" : "SHORT"

            return {
                user_id: userId,
                // Assinalaremos numa carteira genérica ou o usuário pode reajustar depois
                // account_id: 'default' , 
                symbol: trade.symbol,
                direction: side,
                entry_price: Number(trade.price),
                quantity: Number(trade.qty),
                commission: Number(trade.commission),
                fees: Number(trade.commission),
                status: "CLOSED", // Execuções passadas na Binance são ordens fechadas

                // Grava o identificador único para previnir duplicidade no CSV ou Sync 
                ticket_id: String(trade.id),

                // Converte de Epoch millis para padrão ISO Date de inserção SQL 
                entry_date: new Date(trade.time).toISOString(),
                exit_date: new Date(trade.time).toISOString(),
                exit_price: Number(trade.price), // Para scalp, marca fechamento no mesmo tick
                notes: "SYNC_BINANCE"
            }
        })
    }
}
