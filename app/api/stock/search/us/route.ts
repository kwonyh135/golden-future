import { NextResponse } from "next/server"

// 미국 거래소 식별자
const US_EXCHANGES = new Set(["PCX", "NYQ", "NMS", "NGM", "NCM", "ASE", "NAS", "BTS", "PNK", "NASDAQ", "NYSE"])

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.trim()

  if (!query) return NextResponse.json({ items: [] })

  try {
    // Yahoo Finance 검색 - rate limit 없음, SOXL 등 모든 티커 검색 가능
    const res = await fetch(
      `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&newsCount=0&enableFuzzyQuery=false&enableEnhancedTrivialQuery=true`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          "Accept": "application/json",
        },
        next: { revalidate: 30 },
      }
    )

    if (!res.ok) throw new Error(`Yahoo Finance API 오류: ${res.status}`)

    const data = await res.json()

    const items = ((data.quotes as any[]) ?? [])
      .filter((q) =>
        US_EXCHANGES.has(q.exchange) &&
        ["EQUITY", "ETF", "MUTUALFUND"].includes(q.quoteType)
      )
      .map((q) => ({
        ticker: q.symbol as string,
        name: (q.shortname || q.longname || q.symbol) as string,
        type: q.quoteType as string,
      }))
      .slice(0, 20)

    return NextResponse.json({ items })
  } catch (error) {
    console.error("US stock search error:", error)
    return NextResponse.json({ error: "검색 실패", items: [] }, { status: 502 })
  }
}
