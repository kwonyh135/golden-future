import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.trim()

  if (!query) return NextResponse.json({ items: [] })

  try {
    // Yahoo Finance 검색 - 한국 거래소(KSC=KOSPI, KOE=KOSDAQ) 필터
    const res = await fetch(
      `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&newsCount=0&enableFuzzyQuery=false&enableEnhancedTrivialQuery=true`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          "Accept": "application/json",
          "Accept-Language": "ko-KR,ko;q=0.9",
        },
        next: { revalidate: 30 },
      }
    )

    if (!res.ok) throw new Error(`Yahoo Finance API 오류: ${res.status}`)

    const data = await res.json()

    const items = ((data.quotes as any[]) ?? [])
      .filter((q) => q.exchange === "KSC" || q.exchange === "KOE")
      .map((q) => ({
        code: (q.symbol as string).replace(".KS", "").replace(".KQ", ""),
        name: (q.shortname || q.longname || q.symbol) as string,
        market: q.exchange === "KSC" ? "KOSPI" : "KOSDAQ",
      }))
      .slice(0, 20)

    return NextResponse.json({ items })
  } catch (error) {
    console.error("KR stock search error:", error)
    return NextResponse.json({ error: "검색 실패", items: [] }, { status: 502 })
  }
}
