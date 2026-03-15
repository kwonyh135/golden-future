import { NextResponse } from "next/server"

type MarketAsset = {
  ticker: string
  marketType: "kr" | "us" | "crypto"
}

type PriceMap = Record<string, number>

const FALLBACK_RATE = 1450

const readNumber = (value: unknown) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

const getKisBaseUrl = () => process.env.KIS_BASE_URL || "https://openapi.koreainvestment.com:9443"

// KIS 토큰 캐시
let kisTokenCache: { token: string; expiresAt: number } | null = null

const getKisAccessToken = async () => {
  const appKey = process.env.KIS_APP_KEY
  const appSecret = process.env.KIS_APP_SECRET
  if (!appKey || !appSecret) return null

  if (kisTokenCache && kisTokenCache.expiresAt > Date.now() + 60_000) {
    return kisTokenCache.token
  }

  const response = await fetch(`${getKisBaseUrl()}/oauth2/tokenP`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ grant_type: "client_credentials", appkey: appKey, appsecret: appSecret }),
    cache: "no-store",
  })

  if (!response.ok) return null
  const json = await response.json()
  const token = json?.access_token
  if (!token) return null

  kisTokenCache = { token, expiresAt: Date.now() + Math.max(300, Number(json?.expires_in ?? 3600)) * 1000 }
  return token
}

const getKisAuthHeaders = async (trId: string) => {
  const token = await getKisAccessToken()
  const appKey = process.env.KIS_APP_KEY
  const appSecret = process.env.KIS_APP_SECRET
  if (!token || !appKey || !appSecret) return null
  return { authorization: `Bearer ${token}`, appkey: appKey, appsecret: appSecret, tr_id: trId, custtype: "P" }
}

// 실시간 환율 (Frankfurter.app - 무료, 제한 없음)
const fetchExchangeRate = async (): Promise<{ rate: number; source: string }> => {
  const fallback = Number(process.env.BITGET_USDT_TO_KRW || FALLBACK_RATE)

  try {
    const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=KRW", {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    })
    if (res.ok) {
      const json = await res.json()
      const rate = readNumber(json?.rates?.KRW)
      if (rate && rate > 100) return { rate, source: "frankfurter" }
    }
  } catch {
    // fallback
  }

  return { rate: fallback, source: "env" }
}

// 한국 주식 현재가 (KIS API - KRW)
const fetchKoreanStockPrice = async (ticker: string) => {
  const headers = await getKisAuthHeaders("FHKST01010100")
  if (!headers) return null

  const query = new URLSearchParams({ fid_cond_mrkt_div_code: "J", fid_input_iscd: ticker })
  const response = await fetch(`${getKisBaseUrl()}/uapi/domestic-stock/v1/quotations/inquire-price?${query}`, {
    headers,
    cache: "no-store",
  })

  if (!response.ok) return null
  const json = await response.json()
  return readNumber(json?.output?.stck_prpr)
}

// 미국 주식 현재가 (Yahoo Finance - USD, 제한 없음)
const fetchUsStockPrice = async (ticker: string) => {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`,
      {
        headers: { "User-Agent": "Mozilla/5.0" },
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      }
    )
    if (!res.ok) return null
    const json = await res.json()
    const price = readNumber(json?.chart?.result?.[0]?.meta?.regularMarketPrice)
    return price
  } catch {
    return null
  }
}

// 코인 현재가 (Bitget - USD/USDT)
const fetchCryptoPrice = async (ticker: string) => {
  const normalized = ticker.toUpperCase().replace(/[^A-Z0-9]/g, "")
  const symbols = [`${normalized}USDT`, normalized, `${normalized}USDC`]

  for (const symbol of symbols) {
    try {
      const res = await fetch(`https://api.bitget.com/api/v2/spot/market/tickers?symbol=${symbol}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(4000),
      })
      if (!res.ok) continue
      const json = await res.json()
      const price = readNumber(json?.data?.[0]?.lastPr)
      if (price !== null) return price
    } catch {
      continue
    }
  }
  return null
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const assets: MarketAsset[] = Array.isArray(body?.assets) ? body.assets : []

    const uniqueAssets = Array.from(
      new Map(
        assets
          .filter((a) => a?.ticker && a?.marketType)
          .map((a) => [`${a.marketType}:${a.ticker}`, a])
      ).values()
    )

    // 환율 먼저 조회
    const fx = await fetchExchangeRate()

    const prices: PriceMap = {}
    await Promise.all(
      uniqueAssets.map(async (asset) => {
        const key = `${asset.marketType}:${asset.ticker}`
        try {
          if (asset.marketType === "kr") {
            const price = await fetchKoreanStockPrice(asset.ticker)
            if (price !== null) prices[key] = price  // KRW
          } else if (asset.marketType === "us") {
            const price = await fetchUsStockPrice(asset.ticker)
            if (price !== null) prices[key] = price  // USD
          } else if (asset.marketType === "crypto") {
            const price = await fetchCryptoPrice(asset.ticker)
            if (price !== null) prices[key] = price  // USD (USDT)
          }
        } catch {
          // 개별 실패 무시
        }
      })
    )

    return NextResponse.json({ prices, exchangeRate: fx.rate, exchangeRateSource: fx.source })
  } catch {
    return NextResponse.json({ prices: {}, exchangeRate: FALLBACK_RATE, exchangeRateSource: "env" }, { status: 200 })
  }
}
