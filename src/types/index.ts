
export type TradeStatus = 'OPEN' | 'CLOSED' | 'PENDING'
export type TradeDirection = 'LONG' | 'SHORT'

export interface Account {
    id: string
    user_id: string
    name: string
    currency: string
    initial_balance: number
    current_balance: number
    is_archived: boolean
}

export interface Trade {
    id: string
    account_id: string
    user_id: string
    symbol: string
    direction: TradeDirection
    entry_date: string // ISO string
    exit_date?: string | null
    entry_price: number
    exit_price?: number | null
    stop_loss?: number | null
    take_profit?: number | null
    quantity: number
    fees: number
    commission?: number | null
    swap?: number | null
    ticket_id?: string | null
    pnl_gross?: number | null
    pnl_net?: number | null
    status: TradeStatus
    setup_tags: string[]
    notes?: string
    images?: string[]
    is_shared?: boolean
    share_token?: string | null
    shared_at?: string | null
    public_name?: string | null
    r_multiple?: number | null
    created_at: string
}

export interface DashboardMetrics {
    totalTrades: number
    winRate: number
    netPnL: number
    profitFactor: number
    maxDrawdown: number
    avgWin: number
    avgLoss: number
}
