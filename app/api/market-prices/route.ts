import { NextResponse } from "next/server"

type MarketAsset = {
  ticker: string
  marketType: "kr" | "us" | "crypto"
}

type PriceMap = Record<string, number>

type FxResult = {
  rate: number
  source: "kis" | "env"
}

let kisTokenCache: { token: string; expiresAt: number } | null = null

const readNumber = (value: unknown) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

const getKisBaseUrl = () => process.env.KIS_BASE_URL || "https://openapi.koreainvestment.com:9443"

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
    body: JSON.stringify({
      grant_type: "client_credentials",
      appkey: appKey,
      appsecret: appSecret,
    }),
    cache: "no-store",
  })

  if (!response.ok) return null
  const json = await response.json()
  const token = json?.access_token
  const expiresIn = Number(json?.expires_in ?? 3600)
  if (!token) return null

  kisTokenCache = {
    token,
    expiresAt: Date.now() + Math.max(300, expiresIn) * 1000,
  }
  return token
}

const getKisAuthHeaders = async (trId: string) => {
  const token = await getKisAccessToken()
  const appKey = process.env.KIS_APP_KEY
  const appSecret = process.env.KIS_APP_SECRET
  if (!token || !appKey || !appSecret) return null

  return {
    authorization: `Bearer ${token}`,
    appkey: appKey,
    appsecret: appSecret,
    tr_id: trId,
    custtype: "P",
  }
}

const fetchKrwUsdRate = async (): Promise<FxResult> => {
  const fallbackRate = Number(process.env.BITGET_USDT_TO_KRW || process.env.USDT_TO_KRW || 1380)

  const headers = await getKisAuthHeaders("HHDFS00000300")
  if (headers) {
    try {
      const query = new URLSearchParams({
        AUTH: "",
      })

      const response = await fetch(`${getKisBaseUrl()}/uapi/overseas-stock/v1/quotations/inquire-ccnl?${query.toString()}`, {
        headers,
        cache: "no-store",
      })

      if (response.ok) {
        const json = await response.json()
        const candidates = [
          json?.output?.frst_bltn_exrt,
          json?.output?.frst_bltn_xrt,
          json?.output?.stnd_exrt,
          json?.output?.ovrs_nmix_exrt,
          json?.output1?.frst_bltn_exrt,
          json?.output1?.stnd_exrt,
          json?.output2?.frst_bltn_exrt,
          json?.output2?.stnd_exrt,
        ]
        for (const candidate of candidates) {
          const rate = readNumber(candidate)
          if (rate && rate > 0) {
            return { rate, source: "kis" }
          }
        }
      }
    } catch {
      // fallback to env rate
    }
  }

  return { rate: fallbackRate, source: "env" }
}

const fetchKoreanStockPrice = async (ticker: string) => {
  const headers = await getKisAuthHeaders("FHKST01010100")
  if (!headers) return null

  const query = new URLSearchParams({
    fid_cond_mrkt_div_code: "J",
    fid_input_iscd: ticker,
  })

  const response = await fetch(`${getKisBaseUrl()}/uapi/domestic-stock/v1/quotations/inquire-price?${query.toString()}`, {
    headers,
    cache: "no-store",
  })

  if (!response.ok) return null
  const json = await response.json()
  return readNumber(json?.output?.stck_prpr)
}

const fetchUsStockPrice = async (ticker: string) => {
  const alphaKey = process.env.ALPHA_VANTAGE_API_KEY
  if (!alphaKey) return null

  const query = new URLSearchParams({
    function: "GLOBAL_QUOTE",
    symbol: ticker,
    apikey: alphaKey,
  })
  const response = await fetch(`https://www.alphavantage.co/query?${query.toString()}`, { cache: "no-store" })
  if (!response.ok) return null

  const json = await response.json()
  return readNumber(json?.["Global Quote"]?.["05. price"])
}

const fetchBitgetCryptoPrice = async (ticker: string) => {
  const normalized = ticker.toUpperCase().replace(/[^A-Z0-9_\-]/g, "")
  const symbolCandidates = [normalized, `${normalized}USDT`, `${normalized}USDC`, `${normalized}USD`]

  for (const symbol of symbolCandidates) {
    const spotRes = await fetch(`https://api.bitget.com/api/v2/spot/market/tickers?symbol=${encodeURIComponent(symbol)}`, {
      cache: "no-store",
    })
    if (spotRes.ok) {
      const spotJson = await spotRes.json()
      const spotPrice = readNumber(spotJson?.data?.[0]?.lastPr)
      if (spotPrice !== null) return spotPrice
    }

    for (const productType of ["USDT-FUTURES", "COIN-FUTURES", "USDC-FUTURES"]) {
      const futuresRes = await fetch(
        `https://api.bitget.com/api/v2/mix/market/ticker?symbol=${encodeURIComponent(symbol)}&productType=${encodeURIComponent(productType)}`,
        { cache: "no-store" },
      )
      if (!futuresRes.ok) continue
      const futuresJson = await futuresRes.json()
      const futuresPrice = readNumber(futuresJson?.data?.[0]?.lastPr ?? futuresJson?.data?.lastPr)
      if (futuresPrice !== null) return futuresPrice
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
          .filter((asset) => asset?.ticker && asset?.marketType)
          .map((asset) => [`${asset.marketType}:${asset.ticker}`, asset]),
      ).values(),
    )

    const prices: PriceMap = {}
    const fx = await fetchKrwUsdRate()

    await Promise.all(
      uniqueAssets.map(async (asset) => {
        const key = `${asset.marketType}:${asset.ticker}`
        try {
          if (asset.marketType === "kr") {
            const price = await fetchKoreanStockPrice(asset.ticker)
            if (price !== null) prices[key] = price
            return
          }
          if (asset.marketType === "us") {
            const price = await fetchUsStockPrice(asset.ticker)
            if (price !== null) prices[key] = price
            return
          }
          if (asset.marketType === "crypto") {
            const usdPrice = await fetchBitgetCryptoPrice(asset.ticker)
            if (usdPrice !== null) {
              prices[key] = usdPrice * fx.rate
            }
          }
        } catch {
          // keep partial success
        }
      }),
    )

    return NextResponse.json({
      prices,
      exchangeRate: fx.rate,
      exchangeRateSource: fx.source,
    })
  } catch {
    const fallbackRate = Number(process.env.BITGET_USDT_TO_KRW || process.env.USDT_TO_KRW || 1380)
    return NextResponse.json({ prices: {}, exchangeRate: fallbackRate, exchangeRateSource: "env" }, { status: 200 })
  }
}
