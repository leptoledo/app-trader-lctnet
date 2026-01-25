"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

export type DateRangePreset = "today" | "week" | "7d" | "30d" | "90d" | "ytd" | "all" | "custom"

interface DateRangeFilterProps {
    value: DateRangePreset
    onChange: (value: DateRangePreset) => void
    customFrom?: string
    customTo?: string
    onCustomChange?: (from: string, to: string) => void
}

export function DateRangeFilter({ value, onChange, customFrom, customTo, onCustomChange }: DateRangeFilterProps) {
    return (
        <div className="flex items-center gap-2">
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-[180px] rounded-xl h-10 font-bold border-gray-200 bg-white">
                    <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-gray-200 shadow-xl">
                    <SelectItem value="today" className="font-medium">Hoje</SelectItem>
                    <SelectItem value="week" className="font-medium">Esta Semana</SelectItem>
                    <SelectItem value="7d" className="font-medium">Últimos 7 dias</SelectItem>
                    <SelectItem value="30d" className="font-medium">Últimos 30 dias</SelectItem>
                    <SelectItem value="90d" className="font-medium">Últimos 90 dias</SelectItem>
                    <SelectItem value="ytd" className="font-medium">Este ano</SelectItem>
                    <SelectItem value="all" className="font-medium">Todo período</SelectItem>
                    <SelectItem value="custom" className="font-medium border-t mt-1 pt-2">Personalizado...</SelectItem>
                </SelectContent>
            </Select>

            {value === "custom" && onCustomChange && (
                <div className="flex items-center gap-1 animate-in slide-in-from-left-2 duration-300">
                    <Input
                        type="date"
                        value={customFrom}
                        onChange={(e) => onCustomChange(e.target.value, customTo || "")}
                        className="h-10 w-[140px] rounded-xl font-bold border-gray-200"
                    />
                    <span className="text-gray-400 font-bold">à</span>
                    <Input
                        type="date"
                        value={customTo}
                        onChange={(e) => onCustomChange(customFrom || "", e.target.value)}
                        className="h-10 w-[140px] rounded-xl font-bold border-gray-200"
                    />
                </div>
            )}
        </div>
    )
}

export function getDateRangeFilter(preset: DateRangePreset): { from: Date | null, to: Date | null } {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (preset) {
        case "today":
            return { from: startOfToday, to: null }
        case "week": {
            const day = now.getDay()
            const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Monday
            const startOfWeek = new Date(now.setDate(diff))
            startOfWeek.setHours(0, 0, 0, 0)
            return { from: startOfWeek, to: null }
        }
        case "7d":
            return { from: new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000), to: null }
        case "30d":
            return { from: new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000), to: null }
        case "90d":
            return { from: new Date(startOfToday.getTime() - 90 * 24 * 60 * 60 * 1000), to: null }
        case "ytd":
            return { from: new Date(now.getFullYear(), 0, 1), to: null }
        case "all":
            return { from: null, to: null }
        case "custom":
            return { from: null, to: null } // Handled separately or with state
        default:
            return { from: null, to: null }
    }
}
