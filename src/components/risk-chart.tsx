
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Trade } from "@/types"

interface RiskChartProps {
    trades: Trade[]
}

export function RiskChart({ trades }: RiskChartProps) {
    // 1. Filter only closed trades with R-Multiple calculated or calculable
    const closed = trades.filter(t => t.status === 'CLOSED' && t.pnl_net !== null && (t.r_multiple != null || t.stop_loss))

    if (closed.length === 0) return null

    // 2. Bucketize Data
    // Buckets: <-1R, -1R to 0, 0 to 1R, 1R to 2R, 2R to 3R, >3R
    const distribution = {
        '<-1R': 0,
        '-1R a 0': 0,
        '0 a 1R': 0,
        '1R a 2R': 0,
        '2R a 3R': 0,
        '>3R': 0
    }

    closed.forEach(t => {
        let r = t.r_multiple

        // Auto-calculate if missing but SL exists
        if (r == null && t.stop_loss && t.entry_price && t.pnl_net !== undefined) {
            const risk = Math.abs(t.entry_price - t.stop_loss)
            const reward = (t.pnl_net / t.quantity) // approx per unit
            // This is rough approximation if contract size unknown, using stored r_multiple is better usually
            // Fallback to simpler PnL based if risk is known in $ terms? 
            // For now rely on provided r_multiple or simple logic
            if (risk !== 0) {
                const diff = t.direction === 'LONG'
                    ? (t.exit_price! - t.entry_price)
                    : (t.entry_price - t.exit_price!)
                r = diff / risk
            }
        }

        if (r == null) return

        if (r < -1) distribution['<-1R']++
        else if (r < 0) distribution['-1R a 0']++
        else if (r < 1) distribution['0 a 1R']++
        else if (r < 2) distribution['1R a 2R']++
        else if (r < 3) distribution['2R a 3R']++
        else distribution['>3R']++
    })

    const chartData = Object.entries(distribution).map(([key, value]) => ({
        name: key,
        count: value
    }))

    return (
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle>Distribuição de Risco (R-Multiples)</CardTitle>
                <CardDescription>
                    Seus ganhos são maiores que suas perdas?
                </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                            <XAxis
                                dataKey="name"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '6px', border: 'none', background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.name.includes('-') ? '#ef4444' : '#22c55e'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
