import { NextResponse } from "next/server"
import { KR_STOCK_DB } from "@/lib/kr-stocks"

type StockItem = { code: string; name: string; market: string }

const isKorean = (str: string) => /[가-힣]/.test(str)
const isNumeric = (str: string) => /^\d+$/.test(str)

// KRX 전체 종목 캐시 (24시간)
let krxCache: { data: StockItem[]; fetchedAt: number } | null = null

const fetchKrxAll = async (): Promise<StockItem[]> => {
  if (krxCache && Date.now() - krxCache.fetchedAt < 24 * 3600 * 1000) {
    return krxCache.data
  }

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "Mozilla/5.0",
    Referer: "https://data.krx.co.kr/",
  }

  const fetchMarket = async (mktId: string, market: string): Promise<StockItem[]> => {
    const body = new URLSearchParams({
      bld: "dbms/MDC/STAT/standard/MDCSTAT01901",
      mktId,
      segTpCd: "ALL",
      idx_ind_cd: "",
      schStrtDd: "",
      schEndDd: "",
      csvxls_isNo: "false",
    })

    const res = await fetch("https://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd", {
      method: "POST",
      headers,
      body,
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    const json = await res.json()
    return ((json?.OutBlock_1 as any[]) ?? []).map((item) => ({
      code: String(item.ISU_SRT_CD ?? "").padStart(6, "0"),
      name: String(item.ISU_ABBRV ?? ""),
      market,
    }))
  }

  try {
    const [kospi, kosdaq] = await Promise.all([
      fetchMarket("STK", "KOSPI"),
      fetchMarket("KSQ", "KOSDAQ"),
    ])
    const data = [...kospi, ...kosdaq]
    if (data.length > 100) {
      krxCache = { data, fetchedAt: Date.now() }
    }
    return data
  } catch {
    return []
  }
}

// KRX 또는 로컬 DB에서 검색
const searchKoreanText = async (query: string): Promise<StockItem[]> => {
  // KRX 전체 목록 시도
  const krxList = await fetchKrxAll()
  if (krxList.length > 0) {
    return krxList.filter((s) => s.name.includes(query)).slice(0, 20)
  }
  // 실패 시 로컬 DB fallback
  return KR_STOCK_DB.filter((s) => s.name.includes(query)).slice(0, 20)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.trim()

  if (!query) return NextResponse.json({ items: [] })

  // 1) 한글 검색 → KRX 전체 종목 (fallback: 로컬 DB)
  if (isKorean(query)) {
    const items = await searchKoreanText(query)
    return NextResponse.json({ items })
  }

  // 2) 숫자(종목코드) 검색 → KRX 캐시 우선, 없으면 Yahoo Finance
  if (isNumeric(query)) {
    const krxList = await fetchKrxAll()
    const fromKrx = krxList.filter((s) => s.code.startsWith(query)).slice(0, 10)
    if (fromKrx.length > 0) return NextResponse.json({ items: fromKrx })

    const local = KR_STOCK_DB.filter((s) => s.code.startsWith(query)).slice(0, 10)
    if (local.length > 0) return NextResponse.json({ items: local })

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

  // 3) 영문 검색 → Yahoo Finance (KSC/KOE 필터)
  try {
    const res = await fetch(
      `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&newsCount=0&enableFuzzyQuery=false`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "application/json",
        },
        next: { revalidate: 30 },
      }
    )

    if (!res.ok) throw new Error(`Yahoo Finance 오류: ${res.status}`)
    const data = await res.json()

    const yahooItems: StockItem[] = ((data.quotes as any[]) ?? [])
      .filter((q) => q.exchange === "KSC" || q.exchange === "KOE")
      .map((q) => ({
        code: (q.symbol as string).replace(".KS", "").replace(".KQ", ""),
        name: (q.shortname || q.longname || q.symbol) as string,
        market: q.exchange === "KSC" ? "KOSPI" : "KOSDAQ",
      }))

    // KRX 캐시 또는 로컬 DB로 한글 이름 보완
    const krxList = await fetchKrxAll()
    const nameDb = krxList.length > 0 ? krxList : KR_STOCK_DB
    const enriched = yahooItems.map((item) => {
      const found = nameDb.find((s) => s.code === item.code)
      return found ? { ...item, name: found.name } : item
    })

    return NextResponse.json({ items: enriched.slice(0, 20) })
  } catch (error) {
    console.error("KR stock search error:", error)
    return NextResponse.json({ error: "검색 실패", items: [] }, { status: 502 })
  }
}
