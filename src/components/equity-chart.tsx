"use client"

import { ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts"

interface EquityChartProps {
    data: { date: string; equity: number }[]
}

export function EquityChart({ data }: EquityChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
                Sem dados de trades disponíveis.
            </div>
        )
    }


    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                    dataKey="date"
                    stroke="#9ca3af"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={80}
                    tickMargin={10}
                />
                <YAxis
                    stroke="#9ca3af"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => {
                        const abs = Math.abs(v);
                        if (abs >= 1000000) return `${v < 0 ? '-' : ''}${(abs / 1000000).toFixed(1)}M`;
                        if (abs >= 1000) return `${v < 0 ? '-' : ''}${(abs / 1000).toFixed(0)}K`;
                        return `${v < 0 ? '-' : ''}$${abs}`;
                    }}
                    width={60}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "4px",
                        fontSize: "12px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                    }}
                    itemStyle={{ color: "#1f2937" }}
                    formatter={(value: number | undefined) => [`$${(value ?? 0).toFixed(2)}`, "Patrimônio"]}
                />
                <Area
                    type="monotone"
                    dataKey="equity"
                    stroke="#22c55e"
                    fillOpacity={1}
                    fill="url(#colorEquity)"
                    strokeWidth={2}
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}
