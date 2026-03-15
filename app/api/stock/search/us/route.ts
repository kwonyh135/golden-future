import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.trim()
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY

  if (!query) {
    return NextResponse.json({ items: [] })
  }

  if (!apiKey) {
    return NextResponse.json({ error: "Alpha Vantage API 키 없음", items: [] }, { status: 500 })
  }

  try {
    const res = await fetch(
      `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${apiKey}`,
      { next: { revalidate: 60 } }
    )

    if (!res.ok) throw new Error(`Alpha Vantage API 오류: ${res.status}`)

    const data = await res.json()

    // API 호출 제한 초과 시
    if (data.Note || data.Information) {
      return NextResponse.json({ items: [], limitReached: true })
    }

    const items = ((data.bestMatches as any[]) ?? [])
      .filter((m) => m["4. region"] === "United States")
      .map((m) => ({
        ticker: m["1. symbol"] as string,
        name: m["2. name"] as string,
        type: m["3. type"] as string,
      }))
      .slice(0, 20)

    return NextResponse.json({ items })
  } catch (error) {
    console.error("US stock search error:", error)
    return NextResponse.json({ error: "검색 실패", items: [] }, { status: 502 })
  }
}
