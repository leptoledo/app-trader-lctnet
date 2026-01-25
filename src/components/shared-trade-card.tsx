"use client"

import { Line, LineChart, ResponsiveContainer, YAxis, Area, AreaChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SharedTradeCardProps {
    symbol: string
    direction: "LONG" | "SHORT"
    pnl: number
    date: string
    miniChartData: { val: number }[]
}

export function SharedTradeCard({ symbol, direction, pnl, date, miniChartData }: SharedTradeCardProps) {
    const isWin = pnl >= 0

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <div className="text-xs text-muted-foreground uppercase font-semibold">
                            {new Date(date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{symbol}</h3>
                    </div>
                    <Badge variant={isWin ? "default" : "destructive"} className={cn(
                        "text-[10px] uppercase font-bold",
                        isWin ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"
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
