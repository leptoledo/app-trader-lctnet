import { NextResponse } from "next/server"

const API_BASE = "https://api.twelvedata.com/price"

const normalizeSymbol = (symbol: string) => symbol.trim().toUpperCase()

const mapToTwelveDataSymbol = (symbol: string) => {
  const normalized = normalizeSymbol(symbol)

  if (normalized === "GOLD") return "XAU/USD"
  if (normalized === "XAUUSD") return "XAU/USD"
  if (normalized === "XAGUSD") return "XAG/USD"

  if (normalized === "US30") return "US30"
  if (normalized === "NAS100") return "NAS100"
  if (normalized === "US100") return "US100"
  if (normalized === "US500") return "SPX500"

  if (normalized === "BTCUSD") return "BTC/USD"

  const forexMatches = normalized.match(/^([A-Z]{3})([A-Z]{3})$/)
  if (forexMatches) {
    return `${forexMatches[1]}/${forexMatches[2]}`
  }

  return normalized
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbolsParam = searchParams.get("symbols") || ""
  const apiKey = process.env.TWELVE_DATA_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: "Missing TWELVE_DATA_API_KEY" }, { status: 400 })
  }

  const symbols = symbolsParam
    .split(",")
    .map(mapToTwelveDataSymbol)
    .filter(Boolean)

  if (symbols.length === 0) {
    return NextResponse.json({ data: {} })
  }

  const url = `${API_BASE}?symbol=${encodeURIComponent(symbols.join(","))}&apikey=${apiKey}`

  let response;
  try {
    response = await fetch(url, { next: { revalidate: 30 } })
  } catch (error) {
    console.error("quotes API fetch error:", error)
    return NextResponse.json({ error: "API connection failed" }, { status: 502 })
  }

  if (!response.ok) {
    return NextResponse.json({ error: "Failed to fetch prices" }, { status: 502 })
  }

  const payload = await response.json()

  // Twelve Data returns either { price: "123.45" } or { SYMBOL: { price: "123.45" }, ... }
  const data: Record<string, number> = {}

  if (payload?.status === "error") {
    return NextResponse.json({ error: payload?.message || "Twelve Data error" }, { status: 400 })
  }

  if (typeof payload?.price === "string") {
    const symbol = symbols[0]
    const value = Number(payload.price)
    if (!Number.isNaN(value)) data[symbol] = value
  } else if (payload && typeof payload === "object") {
    for (const [key, value] of Object.entries(payload)) {
      const price = (value as { price?: string })?.price
      if (typeof price === "string") {
        const numeric = Number(price)
        if (!Number.isNaN(numeric)) data[key.toUpperCase()] = numeric
      }
    }
  }

  return NextResponse.json({ data })
}
