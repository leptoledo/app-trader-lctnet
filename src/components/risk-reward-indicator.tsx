interface RiskRewardIndicatorProps {
    entryPrice: number
    stopLoss?: number
    takeProfit?: number
    direction: "LONG" | "SHORT"
}

export function RiskRewardIndicator({ entryPrice, stopLoss, takeProfit, direction }: RiskRewardIndicatorProps) {
    if (!stopLoss && !takeProfit) return null

    const risk = stopLoss ? Math.abs(entryPrice - stopLoss) : 0
    const reward = takeProfit ? Math.abs(takeProfit - entryPrice) : 0
    const rrRatio = risk > 0 ? (reward / risk).toFixed(2) : "N/A"

    const getRRColor = (rr: string) => {
        if (rr === "N/A") return "text-gray-500"
        const ratio = parseFloat(rr)
        if (ratio >= 2) return "text-green-600"
        if (ratio >= 1) return "text-yellow-600"
        return "text-red-600"
    }

    return (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-600 uppercase font-medium">Risco</span>
                    <span className="text-sm font-bold text-red-600">${risk.toFixed(2)}</span>
                </div>

                <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-600 uppercase font-medium">R:R</span>
                    <span className={`text-2xl font-bold ${getRRColor(rrRatio)}`}>
                        1:{rrRatio}
                    </span>
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-600 uppercase font-medium">Retorno</span>
                    <span className="text-sm font-bold text-green-600">${reward.toFixed(2)}</span>
                </div>
            </div>

            {parseFloat(rrRatio) < 1.5 && rrRatio !== "N/A" && (
                <p className="text-xs text-yellow-700 mt-2 text-center">
                    ⚠️ Risco/Retorno abaixo do ideal (recomendado: 1:2 ou maior)
                </p>
            )}
        </div>
    )
}
