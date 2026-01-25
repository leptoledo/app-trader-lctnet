import { Badge } from "@/components/ui/badge"

interface ReportHeaderProps {
    name: string
    accountId: string
    broker: string
    type: "REAL" | "DEMO"
    currency: string
    stats: {
        gain: number
        activity: number
        deposits: number
        withdrawals: number
        dividends: number
        corrections: number
        credit: number
    }
}

export function ReportHeader({ name, accountId, broker, type, currency, stats }: ReportHeaderProps) {
    return (
        <div className="w-full bg-white p-6 border-b">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                {/* Account Info */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-gray-900">{name} <span className="font-normal text-gray-600">{accountId}</span></h1>
                        <Badge variant={type === 'REAL' ? 'default' : 'secondary'} className={`rounded-sm px-1.5 py-0 text-[10px] uppercase ${type === 'REAL' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-100 text-blue-800'}`}>
                            {type}
                        </Badge>
                    </div>
                    <p className="text-sm font-medium text-gray-700">{broker}</p>
                </div>

                <div className="hidden md:block text-right">
                </div>
            </div>

            {/* Stats Bar */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 md:gap-8 border-t pt-4">
                <div className="flex flex-col">
                    <span className="text-xl font-bold text-gray-900 lg:text-lg">{currency}</span>
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Moeda</span>
                </div>

                <div className="flex flex-col">
                    <span className={`text-xl font-bold lg:text-lg ${stats.gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.gain > 0 ? '+' : ''}{stats.gain.toFixed(2)}%
                    </span>
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Ganho</span>
                </div>

                <div className="flex flex-col">
                    <span className="text-xl font-bold text-gray-900 lg:text-lg">{stats.activity.toFixed(2)}%</span>
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Atividade</span>
                </div>

                <div className="flex flex-col">
                    <span className="text-xl font-bold text-gray-900 lg:text-lg">{stats.deposits.toFixed(2)}</span>
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Depósitos</span>
                </div>

                <div className="flex flex-col">
                    <span className="text-xl font-bold text-gray-900 lg:text-lg">{stats.withdrawals.toFixed(2)}</span>
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Saques</span>
                </div>

                <div className="flex flex-col">
                    <span className="text-xl font-bold text-gray-900 lg:text-lg">{stats.dividends.toFixed(2)}</span>
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Dividendos</span>
                </div>
            </div>
        </div>
    )
}
