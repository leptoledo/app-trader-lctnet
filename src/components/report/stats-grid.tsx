interface StatRowProps {
    label: string
    value: string | number
    subValue?: string | number
    color?: string
}

function StatRow({ label, value, subValue, color }: StatRowProps) {
    return (
        <div className="flex flex-col border-b border-gray-100 py-2 last:border-0">
            <span className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">{label}</span>
            <div className="flex items-baseline justify-between">
                <span className={`font-bold text-sm ${color || 'text-gray-900'}`}>
                    {value}
                </span>
                {subValue && (
                    <span className="text-xs text-gray-400 font-normal">
                        {subValue}
                    </span>
                )}
            </div>
            <div className="h-1 w-full bg-gray-100 mt-1 rounded-lg overflow-hidden">
                <div className="h-full bg-gray-300 w-0" style={{ width: '40%' }}></div>
            </div>
        </div>
    )
}

interface StatsGridProps {
    winRate: number
    profitFactor: number
    maxDrawdown: number
    totalTrades: number
    avgHoldTime?: string
    sharpeRatio?: number
}

export function StatsGrid({ winRate, profitFactor, maxDrawdown, avgHoldTime = "4h 57m", sharpeRatio = 0.06 }: StatsGridProps) {
    return (
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 p-4">
            <StatRow label="Fator de Lucro" value={profitFactor.toFixed(2)} />
            <StatRow label="Drawdown Máximo" value={`${maxDrawdown.toFixed(2)}%`} color="text-red-500" />
            <StatRow label="Índice de Sharpe" value={sharpeRatio} />
            <StatRow label="Trades por Semana" value="19" subValue="29" />
            <StatRow label="Taxa de Acerto" value={`${winRate.toFixed(1)}%`} />
            <StatRow label="Tempo Médio" value={avgHoldTime} />
        </div>
    )
}
