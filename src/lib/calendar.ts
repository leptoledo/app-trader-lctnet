import { Trade } from "@/types"

export interface DailyMetrics {
    date: string
    pnl: number
    trades: number
    wins: number
    losses: number
}

export function formatLocalDateKey(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}

export function calculateDailyMetrics(trades: Trade[]): DailyMetrics[] {
    const closedTrades = trades.filter(t => t.status === 'CLOSED' && t.exit_date)

    // Agrupar por data
    const dailyMap = new Map<string, DailyMetrics>()

    closedTrades.forEach(trade => {
        const date = formatLocalDateKey(new Date(trade.exit_date!))

        const existing = dailyMap.get(date) || {
            date,
            pnl: 0,
            trades: 0,
            wins: 0,
            losses: 0
        }

        existing.pnl += (trade.pnl_net || 0)
        existing.trades += 1

        if ((trade.pnl_net || 0) > 0) {
            existing.wins += 1
        } else {
            existing.losses += 1
        }

        dailyMap.set(date, existing)
    })

    return Array.from(dailyMap.values()).sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    )
}

export function getMonthDays(year: number, month: number): Date[] {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const days: Date[] = []

    // Adicionar dias do mês anterior para completar a semana
    const firstDayOfWeek = firstDay.getDay()
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const date = new Date(year, month, -i)
        days.push(date)
    }

    // Adicionar todos os dias do mês
    for (let day = 1; day <= lastDay.getDate(); day++) {
        days.push(new Date(year, month, day))
    }

    // Adicionar dias do próximo mês para completar a semana
    const remainingDays = 7 - (days.length % 7)
    if (remainingDays < 7) {
        for (let i = 1; i <= remainingDays; i++) {
            days.push(new Date(year, month + 1, i))
        }
    }

    return days
}
