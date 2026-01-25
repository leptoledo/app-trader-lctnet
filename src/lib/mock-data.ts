
import { Trade } from '@/types'

export const MOCK_TRADES: Trade[] = [
    {
        id: '1',
        account_id: 'acc_1',
        user_id: 'user_1',
        symbol: 'XAUUSD',
        direction: 'LONG',
        entry_date: new Date(Date.now() - 86400000).toISOString(),
        exit_date: new Date(Date.now() - 82800000).toISOString(),
        entry_price: 2020.50,
        exit_price: 2025.00,
        stop_loss: 2018.00,
        quantity: 1.0,
        fees: 5.0,
        pnl_gross: 450.00,
        pnl_net: 445.00,
        status: 'CLOSED',
        setup_tags: ['Support Bounce'],
        r_multiple: 1.8,
        created_at: new Date().toISOString()
    },
    {
        id: '2',
        account_id: 'acc_1',
        user_id: 'user_1',
        symbol: 'EURUSD',
        direction: 'SHORT',
        entry_date: new Date(Date.now() - 172800000).toISOString(),
        exit_date: new Date(Date.now() - 169200000).toISOString(),
        entry_price: 1.0950,
        exit_price: 1.0965,
        stop_loss: 1.0970,
        quantity: 2.0,
        fees: 7.0,
        pnl_gross: -300.00,
        pnl_net: -307.00,
        status: 'CLOSED',
        setup_tags: ['Trend Break'],
        r_multiple: -0.75,
        created_at: new Date().toISOString()
    },
    {
        id: '3',
        account_id: 'acc_1',
        user_id: 'user_1',
        symbol: 'NAS100',
        direction: 'LONG',
        entry_date: new Date().toISOString(),
        entry_price: 16500,
        quantity: 0.5,
        fees: 0,
        status: 'OPEN',
        setup_tags: ['Gap Fill'],
        stop_loss: 16450,
        take_profit: 16600,
        created_at: new Date().toISOString()
    }
]
