
import { Trade } from "@/types"

export function calculateMetrics(trades: Trade[]) {
    const closedTrades = trades
        .filter(t => t.status === 'CLOSED')
        .sort((a, b) => new Date(a.exit_date!).getTime() - new Date(b.exit_date!).getTime())

    const openTrades = trades.filter(t => t.status === 'OPEN')

    const totalTrades = closedTrades.length

    // P&L
    const netPnL = closedTrades.reduce((acc, t) => acc + (t.pnl_net || 0), 0)

    // Wins & Losses
    const wins = closedTrades.filter(t => (t.pnl_net || 0) > 0)
    const losses = closedTrades.filter(t => (t.pnl_net || 0) <= 0)

    const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0

    // Averages
    const avgWin = wins.length > 0
        ? wins.reduce((acc, t) => acc + (t.pnl_net || 0), 0) / wins.length
        : 0

    const avgLoss = losses.length > 0
        ? Math.abs(losses.reduce((acc, t) => acc + (t.pnl_net || 0), 0) / losses.length)
        : 0

    // Profit Factor
    const grossProfit = wins.reduce((acc, t) => acc + (t.pnl_net || 0), 0)
    const grossLoss = Math.abs(losses.reduce((acc, t) => acc + (t.pnl_net || 0), 0))
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0

    // Equity Curve Generation
    // Start with 0 or initial balance (simplified to cumulative PnL for now)
    let currentEquity = 0
    const equityCurve = closedTrades.map(trade => {
        currentEquity += (trade.pnl_net || 0)
        return {
            date: new Date(trade.exit_date!).toLocaleDateString(),
            equity: currentEquity
        }
    })

    // Add initial point
    if (equityCurve.length > 0) {
        equityCurve.unshift({ date: 'Start', equity: 0 })
    }

    return {
        totalTrades,
        netPnL,
        winRate,
        avgWin,
        avgLoss,
        profitFactor,
        grossProfit,
        grossLoss,
        runningTrades: openTrades.length,
        equityCurve
    }
}
