import { TradeDirection } from "@/types"

type InstrumentSpec = {
    symbol: string
    aliases?: string[]
    contractSize?: number
    tickSize?: number
    tickValue?: number
    profitCurrency?: string
}

const INSTRUMENT_SPECS: InstrumentSpec[] = [
    {
        symbol: "GOLD",
        aliases: ["XAUUSD"],
        contractSize: 100,
        tickSize: 0.01,
        tickValue: 1,
        profitCurrency: "USD"
    }
]

const normalizeSymbol = (symbol?: string) => (symbol || "").trim().toUpperCase()

export const getInstrumentSpec = (symbol?: string) => {
    const normalized = normalizeSymbol(symbol)
    return INSTRUMENT_SPECS.find((spec) =>
        spec.symbol === normalized || spec.aliases?.includes(normalized)
    )
}

export const calculatePnL = ({
    symbol,
    direction,
    entryPrice,
    exitPrice,
    quantity,
    fees = 0
}: {
    symbol?: string
    direction: TradeDirection
    entryPrice?: number | null
    exitPrice?: number | null
    quantity?: number | null
    fees?: number
}) => {
    if (
        entryPrice == null ||
        exitPrice == null ||
        quantity == null ||
        Number.isNaN(entryPrice) ||
        Number.isNaN(exitPrice) ||
        Number.isNaN(quantity)
    ) {
        return { pnl_gross: null, pnl_net: null, spec: getInstrumentSpec(symbol) }
    }

    const spec = getInstrumentSpec(symbol)
    const priceMove = direction === "LONG" ? exitPrice - entryPrice : entryPrice - exitPrice

    let gross = 0
    if (spec?.tickSize && spec.tickValue && spec.tickSize > 0) {
        const points = priceMove / spec.tickSize
        gross = points * spec.tickValue * quantity
    } else {
        gross = priceMove * quantity
    }

    const net = gross - fees
    return { pnl_gross: gross, pnl_net: net, spec }
}
