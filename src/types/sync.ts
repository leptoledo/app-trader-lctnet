export type TradeSide = "BUY" | "SELL"

export interface NormalizedTrade {
    user_id: string
    exchange: string
    symbol: string
    side: TradeSide
    price: number
    quantity: number
    fee: number
    order_id: string // Identificador único da transação ou da ordem no lado da corretora
    executed_at: string // ISO Timestamp DateTime
}

export interface BinanceTradeResponse {
    symbol: string
    id: number
    orderId: number
    orderListId: number
    price: string
    qty: string
    quoteQty: string
    commission: string
    commissionAsset: string
    time: number
    isBuyer: boolean
    isMaker: boolean
    isBestMatch: boolean
}
