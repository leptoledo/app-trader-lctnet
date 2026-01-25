"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts"

interface SummaryDonutProps {
    grossProfit: number
    grossLoss: number
    netPnl: number
}

export function SummaryDonut({ grossProfit, grossLoss, netPnl }: SummaryDonutProps) {
    // Data for the donut
    const lossAbs = Math.abs(grossLoss)
    const total = grossProfit + lossAbs

    // If no data, show empty gray ring
    const data = total === 0
        ? [{ name: 'Vazio', value: 1 }]
        : [
            { name: 'Perda', value: lossAbs },
            { name: 'Lucro', value: grossProfit },
        ]

    const COLORS = total === 0 ? ['#e5e7eb'] : ['#ef4444', '#22c55e'] // red-500, green-500

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="h-[180px] w-[180px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={65}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            startAngle={180}
                            endAngle={-180}
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                            <Label
                                value={`${netPnl >= 0 ? '+' : ''}${netPnl.toFixed(2)}`}
                                position="center"
                                className="fill-gray-900 text-lg font-bold"
                                style={{ fontSize: '20px', fontWeight: 'bold' }}
                            />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text Labels */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-6">
                    <span className="text-xs font-medium text-gray-500 uppercase mt-4">Total</span>
                </div>
            </div>

            {/* Legend / Values */}
            <div className="flex w-full justify-between px-4 mt-2 text-sm">
                <div className="flex flex-col items-start">
                    <span className="flex items-center gap-1 text-red-600 font-bold">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        -${lossAbs.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-gray-500 uppercase ml-3">Perda Bruta</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="flex items-center gap-1 text-green-600 font-bold">
                        +${grossProfit.toFixed(2)}
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    </span>
                    <span className="text-[10px] text-gray-500 uppercase mr-3">Lucro Bruto</span>
                </div>
            </div>
        </div>
    )
}
