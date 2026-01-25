
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Trade } from "@/types"
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, getDay } from "date-fns"

interface HeatmapProps {
    trades: Trade[]
}

export function CalendarHeatmap({ trades }: HeatmapProps) {
    const today = new Date()
    const currentMonthStart = startOfMonth(today)
    const currentMonthEnd = endOfMonth(today)

    // Generate all days for current month grid
    const days = eachDayOfInterval({ start: currentMonthStart, end: currentMonthEnd })

    // Map P&L per day
    const dailyPnL = new Map<string, number>()

    trades.forEach(t => {
        if (t.status === 'CLOSED' && t.exit_date && t.pnl_net) {
            const dateKey = format(new Date(t.exit_date), 'yyyy-MM-dd')
            const current = dailyPnL.get(dateKey) || 0
            dailyPnL.set(dateKey, current + t.pnl_net)
        }
    })

    // Helper for grid alignment (start day of week offset)
    const startDayOffset = getDay(currentMonthStart) // 0 (Sun) to 6 (Sat)
    const emptySlots = Array(startDayOffset).fill(null)

    const getColor = (pnl: number) => {
        if (pnl > 0) return 'bg-green-500 text-white'
        if (pnl < 0) return 'bg-red-500 text-white'
        return 'bg-muted text-muted-foreground'
    }

    return (
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle>{format(today, 'MMMM yyyy')}</CardTitle>
                <CardDescription>Mapa de Performance Diária</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2 text-muted-foreground">
                    <div>Dom</div>
                    <div>Seg</div>
                    <div>Ter</div>
                    <div>Qua</div>
                    <div>Qui</div>
                    <div>Sex</div>
                    <div>Sáb</div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {emptySlots.map((_, i) => (
                        <div key={`empty-${i}`} className="h-12 w-full" />
                    ))}

                    {days.map(day => {
                        const dateKey = format(day, 'yyyy-MM-dd')
                        const pnl = dailyPnL.get(dateKey)
                        const hasTrade = dailyPnL.has(dateKey)

                        return (
                            <div
                                key={dateKey}
                                className={`h-12 w-full rounded-md flex flex-col items-center justify-center text-xs transition-colors border ${hasTrade ? getColor(pnl!) : 'bg-background hover:bg-muted'}`}
                            >
                                <span className={hasTrade ? 'font-bold opacity-90' : 'text-muted-foreground'}>
                                    {format(day, 'd')}
                                </span>
                                {hasTrade && (
                                    <span className="font-mono text-[10px] scale-90">
                                        {pnl! >= 0 ? '+' : ''}{pnl?.toFixed(0)}
                                    </span>
                                )}
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
