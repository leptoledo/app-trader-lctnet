import { Trade } from "@/types"

export function analyzeByDayOfWeek(trades: Trade[]) {
    const closedTrades = trades.filter(t => t.status === 'CLOSED')

    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    const dayData = days.map((day, index) => ({
        day,
        pnl: 0,
        trades: 0
    }))

    closedTrades.forEach(trade => {
        const dayIndex = new Date(trade.entry_date).getDay()
        dayData[dayIndex].pnl += (trade.pnl_net || 0)
        dayData[dayIndex].trades += 1
    })

    return dayData
}

export function analyzeByHour(trades: Trade[]) {
    const closedTrades = trades.filter(t => t.status === 'CLOSED')

    const hourData = Array.from({ length: 24 }, (_, hour) => ({
        hour: `${hour}h`,
        pnl: 0,
        trades: 0
    }))

    closedTrades.forEach(trade => {
        const hour = new Date(trade.entry_date).getHours()
        hourData[hour].pnl += (trade.pnl_net || 0)
        hourData[hour].trades += 1
    })

    return hourData.filter(h => h.trades > 0) // Apenas horas com trades
}

export function analyzeBySymbol(trades: Trade[]) {
    const closedTrades = trades.filter(t => t.status === 'CLOSED')

    const symbolMap = new Map<string, { pnl: number; trades: number; wins: number }>()

    closedTrades.forEach(trade => {
        const existing = symbolMap.get(trade.symbol) || { pnl: 0, trades: 0, wins: 0 }
        existing.pnl += (trade.pnl_net || 0)
        existing.trades += 1
        if ((trade.pnl_net || 0) > 0) existing.wins += 1
        symbolMap.set(trade.symbol, existing)
    })

    return Array.from(symbolMap.entries())
        .map(([symbol, data]) => ({
            symbol,
            pnl: data.pnl,
            trades: data.trades,
            winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0
        }))
        .sort((a, b) => b.pnl - a.pnl)
}

export function analyzeRMultiple(trades: Trade[]) {
    const closedTrades = trades.filter(t => t.status === 'CLOSED' && t.r_multiple !== null && t.r_multiple !== undefined)

    // Agrupar em faixas de R
    const ranges = [
        { label: '< -2R', min: -Infinity, max: -2, count: 0 },
        { label: '-2R a -1R', min: -2, max: -1, count: 0 },
        { label: '-1R a 0R', min: -1, max: 0, count: 0 },
        { label: '0R a 1R', min: 0, max: 1, count: 0 },
        { label: '1R a 2R', min: 1, max: 2, count: 0 },
        { label: '2R a 3R', min: 2, max: 3, count: 0 },
        { label: '> 3R', min: 3, max: Infinity, count: 0 },
    ]

    closedTrades.forEach(trade => {
        const r = trade.r_multiple!
        const range = ranges.find(rng => r >= rng.min && r < rng.max)
        if (range) range.count += 1
    })

    return ranges.filter(r => r.count > 0)
}
