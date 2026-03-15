import { NextResponse } from "next/server"
import { KR_STOCK_DB } from "@/lib/kr-stocks"

const isKorean = (str: string) => /[가-힣]/.test(str)
const isNumeric = (str: string) => /^\d+$/.test(str)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.trim()

  if (!query) return NextResponse.json({ items: [] })

  const q = query.toLowerCase()

  // 1) 한글 검색 → 로컬 DB에서 이름 매칭
  if (isKorean(query)) {
    const items = KR_STOCK_DB
      .filter((s) => s.name.includes(query))
      .slice(0, 20)
    return NextResponse.json({ items })
  }

  // 2) 숫자(종목코드) 검색 → 로컬 DB 우선, 없으면 Yahoo Finance
  if (isNumeric(query)) {
    const local = KR_STOCK_DB.filter((s) => s.code.startsWith(query)).slice(0, 10)
    if (local.length > 0) return NextResponse.json({ items: local })

    // 로컬에 없으면 Yahoo Finance로 코드 조회
    try {
      const res = await fetch(
        `https://query2.finance.yahoo.com/v1/finance/search?q=${query}&newsCount=0`,
        { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 30 } }
      )
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
    } catch {
      return NextResponse.json({ items: [] })
    }
  }

  // 3) 영문 검색 → Yahoo Finance
  try {
    const res = await fetch(
      `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&newsCount=0&enableFuzzyQuery=false`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          "Accept": "application/json",
        },
        next: { revalidate: 30 },
      }
    )

    if (!res.ok) throw new Error(`Yahoo Finance 오류: ${res.status}`)

    const data = await res.json()

    // Yahoo Finance 결과 + 로컬 DB 영문 포함 검색 병합
    const yahooItems: { code: string; name: string; market: string }[] = ((data.quotes as any[]) ?? [])
      .filter((q) => q.exchange === "KSC" || q.exchange === "KOE")
      .map((q) => ({
        code: (q.symbol as string).replace(".KS", "").replace(".KQ", ""),
        name: (q.shortname || q.longname || q.symbol) as string,
        market: q.exchange === "KSC" ? "KOSPI" : "KOSDAQ",
      }))

    // 로컬 DB에서 코드로 한글 이름 보완
    const enriched = yahooItems.map((item) => {
      const local = KR_STOCK_DB.find((s) => s.code === item.code)
      return local ? { ...item, name: local.name } : item
    })

    return NextResponse.json({ items: enriched.slice(0, 20) })
  } catch (error) {
    console.error("KR stock search error:", error)
    return NextResponse.json({ error: "검색 실패", items: [] }, { status: 502 })
  }
}
