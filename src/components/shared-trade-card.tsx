"use client"

import { ResponsiveContainer, Area, AreaChart } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SharedTradeCardProps {
    symbol: string
    direction: "LONG" | "SHORT"
    pnl: number
    date: string
    miniChartData: { val: number }[]
}

export function SharedTradeCard({ symbol, direction: _direction, pnl, date, miniChartData }: SharedTradeCardProps) {
    const isWin = pnl >= 0

    return (
        <Card className="rounded-md overflow-hidden bg-white dark:bg-[#0b1220] border-slate-200 dark:border-slate-800 shadow-sm transition-colors hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer">
            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <div className="text-[10px] text-slate-500 uppercase font-medium tracking-widest">
                            {new Date(date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <h3 className="text-xl font-medium text-slate-900 dark:text-white tracking-tight">{symbol}</h3>
                    </div>
                    <Badge variant="outline" className={cn(
                        "text-[10px] uppercase font-medium tracking-widest rounded-sm border-transparent",
                        isWin ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                    )}>
                        {isWin ? "Lucro" : "Prejuízo"}
                    </Badge>
                </div>

                <div className="h-[80px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={miniChartData}>
                            <Area
                                type="monotone"
                                dataKey="val"
                                stroke={isWin ? "#10b981" : "#ef4444"}
                                fill={isWin ? "#10b981" : "#ef4444"}
                                fillOpacity={0.1}
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
