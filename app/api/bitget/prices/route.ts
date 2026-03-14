import { NextResponse } from "next/server"

const BITGET_BASE = "https://api.bitget.com"

// 앱 티커 → Bitget 심볼 매핑
const TICKER_TO_SYMBOL: Record<string, string> = {
  BTC: "BTCUSDT",
  ETH: "ETHUSDT",
  SOL: "SOLUSDT",
  XRP: "XRPUSDT",
  DOGE: "DOGEUSDT",
  ADA: "ADAUSDT",
  AVAX: "AVAXUSDT",
  LINK: "LINKUSDT",
  DOT: "DOTUSDT",
  UNI: "UNIUSDT",
}

export async function GET() {
  try {
    const res = await fetch(`${BITGET_BASE}/api/v2/spot/market/tickers`, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 30 },
    })

    if (!res.ok) {
      return NextResponse.json({ error: "Bitget API 요청 실패" }, { status: 502 })
    }

    const data = await res.json()

    if (data.code !== "00000") {
      return NextResponse.json({ error: data.msg || "Bitget API 오류" }, { status: 502 })
    }

    const symbolToTicker = Object.fromEntries(
      Object.entries(TICKER_TO_SYMBOL).map(([t, s]) => [s, t])
    )
    const symbolSet = new Set(Object.values(TICKER_TO_SYMBOL))

    const prices: Record<string, number> = {}
    for (const item of data.data) {
      if (symbolSet.has(item.symbol)) {
        const ticker = symbolToTicker[item.symbol]
        if (ticker) prices[ticker] = parseFloat(item.lastPr)
      }
    }

    return NextResponse.json({ prices })
  } catch (error) {
    console.error("Bitget prices error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
