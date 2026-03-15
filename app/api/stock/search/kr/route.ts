import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.trim()

  if (!query) {
    return NextResponse.json({ items: [] })
  }

  try {
    // 네이버 금융 자동완성 API (공개, 인증 불필요)
    const res = await fetch(
      `https://ac.stock.naver.com/ac?query=${encodeURIComponent(query)}&target=stock,index`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          "Referer": "https://finance.naver.com",
          "Accept": "application/json",
        },
        next: { revalidate: 60 },
      }
    )

    if (!res.ok) throw new Error(`NAVER API 오류: ${res.status}`)

    const data = await res.json()

    // 응답 형식: { result: { items: [[이름, 코드, 시장유형, ...], ...] } }
    const raw: any[][] = data?.result?.items ?? []
    const items = raw.map((item) => ({
      name: item[0] as string,
      code: item[1] as string,
      market: item[2] === "0" ? "KOSPI" : item[2] === "1" ? "KOSDAQ" : (item[2] as string),
    })).slice(0, 20)

    return NextResponse.json({ items })
  } catch (error) {
    console.error("KR stock search error:", error)
    return NextResponse.json({ error: "검색 실패", items: [] }, { status: 502 })
  }
}
