import { NextResponse } from "next/server"
import { createHmac } from "crypto"

const BITGET_BASE = "https://api.bitget.com"

function makeSign(secret: string, timestamp: string, method: string, requestPath: string, body = "") {
  return createHmac("sha256", secret)
    .update(timestamp + method + requestPath + body)
    .digest("base64")
}

export async function GET() {
  const apiKey = process.env.BITGET_API_KEY
  const apiSecret = process.env.BITGET_API_SECRET
  const passphrase = process.env.BITGET_API_PASSPHRASE

  if (!apiKey || !apiSecret || !passphrase) {
    return NextResponse.json({ error: "Bitget API 키가 설정되지 않았습니다" }, { status: 500 })
  }

  try {
    const timestamp = Date.now().toString()
    const method = "GET"
    const requestPath = "/api/v2/spot/account/assets"
    const sign = makeSign(apiSecret, timestamp, method, requestPath)

    const res = await fetch(`${BITGET_BASE}${requestPath}`, {
      headers: {
        "ACCESS-KEY": apiKey,
        "ACCESS-SIGN": sign,
        "ACCESS-TIMESTAMP": timestamp,
        "ACCESS-PASSPHRASE": passphrase,
        "Content-Type": "application/json",
        "locale": "en-US",
      },
    })

    if (!res.ok) {
      const text = await res.text()
      console.error("Bitget holdings API error:", text)
      return NextResponse.json({ error: "Bitget API 요청 실패" }, { status: 502 })
    }

    const data = await res.json()

    if (data.code !== "00000") {
      return NextResponse.json({ error: data.msg || "Bitget API 오류" }, { status: 502 })
    }

    const usdtItem = data.data.find((item: any) => item.coinName === "USDT")
    const usdtBalance = usdtItem ? parseFloat(usdtItem.available) : 0

    const holdings = data.data
      .filter((item: any) => item.coinName !== "USDT")
      .map((item: any) => {
        const available = parseFloat(item.available || "0")
        const frozen = parseFloat(item.frozen || "0")
        const locked = parseFloat(item.locked || "0")
        return {
          ticker: item.coinName,
          available,
          frozen,
          locked,
          total: available + frozen + locked,
        }
      })
      .filter((h: any) => h.total > 0)

    return NextResponse.json({ holdings, usdtBalance })
  } catch (error) {
    console.error("Bitget holdings error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
