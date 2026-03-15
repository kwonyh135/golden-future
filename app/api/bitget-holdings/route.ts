import crypto from "crypto"
import { NextResponse } from "next/server"

type ImportedHolding = {
  owner: string
  ticker: string
  name: string
  marketType: "crypto"
  quantity: number
  avgPrice: number
  currentPrice: number
}

const BITGET_BASE_URL = "https://api.bitget.com"

const readNumber = (value: unknown) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

const signBitget = ({ timestamp, method, path, body, secret }: { timestamp: string; method: string; path: string; body?: string; secret: string }) => {
  const payload = `${timestamp}${method.toUpperCase()}${path}${body || ""}`
  return crypto.createHmac("sha256", secret).update(payload).digest("base64")
}

const bitgetRequest = async (path: string, { method = "GET", body }: { method?: string; body?: Record<string, unknown> } = {}) => {
  const apiKey = process.env.BITGET_API_KEY
  const apiSecret = process.env.BITGET_API_SECRET
  const passphrase = process.env.BITGET_API_PASSPHRASE
  if (!apiKey || !apiSecret || !passphrase) {
    throw new Error("Missing Bitget API credentials")
  }

  const timestamp = Date.now().toString()
  const payload = body ? JSON.stringify(body) : ""
  const signature = signBitget({ timestamp, method, path, body: payload, secret: apiSecret })

  const res = await fetch(`${BITGET_BASE_URL}${path}`, {
    method,
    headers: {
      "ACCESS-KEY": apiKey,
      "ACCESS-SIGN": signature,
      "ACCESS-TIMESTAMP": timestamp,
      "ACCESS-PASSPHRASE": passphrase,
      "Content-Type": "application/json",
    },
    body: method === "GET" ? undefined : payload,
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`Bitget request failed: ${res.status}`)
  }
  return res.json()
}

const fetchSpotHoldings = async (owner: string): Promise<ImportedHolding[]> => {
  const assets = await bitgetRequest("/api/v2/spot/account/assets")
  const rows = Array.isArray(assets?.data) ? assets.data : []

  return rows
    .map((row: Record<string, unknown>) => {
      const ticker = String(row.coin || row.coinName || "").toUpperCase()
      const available = readNumber(row.available)
      const frozen = readNumber(row.frozen)
      const quantity = (available || 0) + (frozen || 0)
      if (!ticker || quantity <= 0) return null

      return {
        owner,
        ticker,
        name: ticker,
        marketType: "crypto" as const,
        quantity,
        avgPrice: 0,
        currentPrice: 0,
      }
    })
    .filter((item): item is ImportedHolding => Boolean(item))
}

const fetchFuturesHoldings = async (owner: string): Promise<ImportedHolding[]> => {
  const productTypes = ["USDT-FUTURES", "COIN-FUTURES", "USDC-FUTURES"]
  const collected: ImportedHolding[] = []

  await Promise.all(
    productTypes.map(async (productType) => {
      try {
        const query = new URLSearchParams({ productType })
        const result = await bitgetRequest(`/api/v2/mix/position/all-position?${query.toString()}`)
        const rows = Array.isArray(result?.data) ? result.data : []

        rows.forEach((row: Record<string, unknown>) => {
          const symbol = String(row.symbol || "").toUpperCase()
          if (!symbol) return
          const baseTicker = symbol.replace(/USDT|USDC|USD|_UMCBL|_CMCBL|_DMCBL/g, "")
          const quantity = Math.abs(readNumber(row.total) || readNumber(row.openDelegateSize) || 0)
          const entry = readNumber(row.openPriceAvg) || readNumber(row.avgOpenPrice) || readNumber(row.openPrice)
          const mark = readNumber(row.markPrice) || readNumber(row.marketPrice)
          if (!baseTicker || quantity <= 0) return

          collected.push({
            owner,
            ticker: baseTicker,
            name: baseTicker,
            marketType: "crypto",
            quantity,
            avgPrice: entry || 0,
            currentPrice: mark || entry || 0,
          })
        })
      } catch {
        // ignore one productType failure, keep others
      }
    }),
  )

  return collected
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const owner = typeof body?.owner === "string" && body.owner.trim() ? body.owner.trim() : "용"

    const [spot, futures] = await Promise.all([fetchSpotHoldings(owner), fetchFuturesHoldings(owner)])
    const merged = [...spot, ...futures]

    return NextResponse.json({ holdings: merged })
  } catch (error) {
    return NextResponse.json(
      { holdings: [], message: error instanceof Error ? error.message : "Bitget holdings import failed" },
      { status: 200 },
    )
  }
}
