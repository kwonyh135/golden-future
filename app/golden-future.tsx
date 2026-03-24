"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

/* ═══════════════════════════════════════════
   Blue Tone Design System & Config
   ═══════════════════════════════════════════ */
const S = {
  bg: "linear-gradient(180deg, #f5f7fb 0%, #eef2f8 100%)",
  card: {
    background: "rgba(255,255,255,0.78)",
    boxShadow: "0 14px 32px rgba(15,23,42,0.08)",
    borderRadius: 24,
    border: "1px solid rgba(255,255,255,0.85)",
  },
  inset: {
    background: "rgba(238,243,251,0.9)",
    boxShadow: "inset 0 1px 3px rgba(148,163,184,0.25)",
    borderRadius: 14,
    border: "1px solid rgba(226,232,240,0.9)",
  },
  btn: {
    background: "rgba(255,255,255,0.78)",
    boxShadow: "0 6px 16px rgba(15,23,42,0.07)",
    borderRadius: 14,
    border: "1px solid rgba(226,232,240,0.9)",
    cursor: "pointer",
    transition: "all 0.18s ease",
  },
  btnPress: {
    background: "rgba(219,234,254,0.9)",
    boxShadow: "inset 0 1px 2px rgba(59,130,246,0.2)",
  },
  accent: "#2563eb",
  accentGrad: "linear-gradient(135deg, #1d4ed8, #2563eb, #3b82f6)",
  accentLight: "#60a5fa",
  textPrimary: "#0f172a",
  textSecondary: "#1d4ed8",
  textMuted: "#64748b",
  profit: "#e63946",
  loss: "#1e88e5",
  glass: {
    background: "rgba(255,255,255,0.65)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(255,255,255,0.8)",
    borderRadius: 24,
  },
}

const goldText = {
  background: S.accentGrad,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
}

/* ═══════════════════════════════════════════
   Data & Constants
   ═══════════════════════════════════════════ */
const KR_STOCKS = [
  { code: "005930", name: "삼성전자", eng: "Samsung Electronics" },
  { code: "000660", name: "SK하이닉스", eng: "SK Hynix" },
  { code: "005935", name: "삼성전자우", eng: "Samsung Elec Pref" },
  { code: "373220", name: "LG에너지솔루션", eng: "LG Energy Solution" },
  { code: "005380", name: "현대차", eng: "Hyundai Motor" },
  { code: "000270", name: "기아", eng: "Kia" },
  { code: "068270", name: "셀트리온", eng: "Celltrion" },
  { code: "035420", name: "NAVER", eng: "NAVER" },
  { code: "035720", name: "카카오", eng: "Kakao" },
  { code: "051910", name: "LG화학", eng: "LG Chem" },
  { code: "006400", name: "삼성SDI", eng: "Samsung SDI" },
  { code: "028260", name: "삼성물산", eng: "Samsung C&T" },
  { code: "105560", name: "KB금융", eng: "KB Financial" },
  { code: "055550", name: "신한지주", eng: "Shinhan Financial" },
  { code: "003670", name: "포스코퓨처엠", eng: "POSCO Future M" },
  { code: "042700", name: "한미반도체", eng: "Hanmi Semiconductor" },
  { code: "259960", name: "크래프톤", eng: "Krafton" },
  { code: "352820", name: "하이브", eng: "HYBE" },
  { code: "207940", name: "삼성바이오로직스", eng: "Samsung Biologics" },
]

const US_STOCKS = [
  { ticker: "AAPL", name: "Apple Inc." },
  { ticker: "MSFT", name: "Microsoft Corporation" },
  { ticker: "GOOGL", name: "Alphabet Inc. Class A" },
  { ticker: "AMZN", name: "Amazon.com Inc." },
  { ticker: "NVDA", name: "NVIDIA Corporation" },
  { ticker: "META", name: "Meta Platforms Inc." },
  { ticker: "TSLA", name: "Tesla Inc." },
  { ticker: "SCHD", name: "Schwab US Dividend ETF" },
  { ticker: "VOO", name: "Vanguard S&P 500 ETF" },
  { ticker: "QQQ", name: "Invesco QQQ Trust" },
  { ticker: "PLTR", name: "Palantir Technologies" },
  { ticker: "COIN", name: "Coinbase Global" },
  { ticker: "SOFI", name: "SoFi Technologies" },
  { ticker: "ARM", name: "Arm Holdings" },
  { ticker: "KO", name: "Coca-Cola Company" },
]

const CRYPTO_LIST = [
  { ticker: "BTC", name: "Bitcoin", coingeckoId: "bitcoin" },
  { ticker: "ETH", name: "Ethereum", coingeckoId: "ethereum" },
  { ticker: "SOL", name: "Solana", coingeckoId: "solana" },
  { ticker: "XRP", name: "Ripple", coingeckoId: "ripple" },
  { ticker: "DOGE", name: "Dogecoin", coingeckoId: "dogecoin" },
]

const getSimPrice = (t) => {
  const p = {
    "005930": 72500, "000660": 178000, "005380": 245000, "000270": 118000,
    "035420": 215000, "035720": 52300, "068270": 185000, "051910": 365000,
    "006400": 412000, "105560": 65800, "055550": 45200, "373220": 380000,
    "259960": 245000, "352820": 215000, "003490": 24500, "042700": 125000,
    "207940": 785000, "090430": 142000, "329180": 168000, "196170": 89500,
    AAPL: 195.2, MSFT: 420.5, GOOGL: 175.3, AMZN: 192.8, NVDA: 880.5,
    META: 510.2, TSLA: 245.6, VOO: 495.3, QQQ: 435.2, SCHD: 78.5,
    NFLX: 625, AMD: 168.3, PLTR: 24.5, COIN: 245.8, SOFI: 9.8, ARM: 155, KO: 62.5,
    JPM: 198.4, BTC: 97250000, ETH: 4850000, SOL: 285000, XRP: 3250, DOGE: 580,
    ADA: 1350, AVAX: 52000, LINK: 22500, DOT: 11200, UNI: 16800,
  }
  return p[t] || (t.length <= 5 ? Math.random() * 500 + 50 : Math.random() * 300000 + 10000)
}

const EXCHANGE_RATE = 1450
const fmt = (v) =>
  v >= 100000000
    ? `${(v / 100000000).toFixed(2)}억`
    : v >= 10000
    ? `${Math.round(v / 10000).toLocaleString()}만`
    : Math.round(v).toLocaleString()
const fmtU = (v) =>
  v >= 1e6 ? `$${(v / 1e6).toFixed(2)}M` : v >= 1e3 ? `$${(v / 1e3).toFixed(1)}K` : `$${v.toFixed(2)}`

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

const supabaseRequest = async (table, { method = "GET", query = "", body } = {}) => {
  if (!hasSupabaseConfig) return null
  const url = `${SUPABASE_URL}/rest/v1/${table}${query ? `?${query}` : ""}`
  const res = await fetch(url, {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || `Supabase ${method} ${table} failed`)
  }
  if (res.status === 204) return null
  return res.json()
}

const toAssetRow = (asset) => ({
  owner: asset.owner,
  ticker: asset.ticker,
  name: asset.name,
  market_type: asset.marketType,
  quantity: asset.quantity,
  avg_price: asset.avgPrice,
  current_price: asset.currentPrice,
  leverage: asset.leverage ?? 1,
})

const fromAssetRow = (row) => ({
  owner: row.owner,
  ticker: row.ticker,
  name: row.name,
  marketType: row.market_type,
  quantity: row.quantity,
  leverage: row.leverage ?? 1,
  avgPrice: row.avg_price,
  currentPrice: row.current_price,
})

const toSoldRow = (asset) => ({
  owner: asset.owner,
  ticker: asset.ticker,
  name: asset.name,
  market_type: asset.marketType,
  quantity: asset.quantity,
  avg_price: asset.avgPrice,
  sell_price: asset.sellPrice,
  realized_pnl: asset.realizedPnl,
  realized_pnl_pct: asset.realizedPnlPct,
  sell_date: asset.sellDate,
})

const fromSoldRow = (row) => ({
  owner: row.owner,
  ticker: row.ticker,
  name: row.name,
  marketType: row.market_type,
  quantity: row.quantity,
  avgPrice: row.avg_price,
  sellPrice: row.sell_price,
  realizedPnl: row.realized_pnl,
  realizedPnlPct: row.realized_pnl_pct,
  sellDate: row.sell_date,
})

const normalizeAssetsForCompare = (list = []) =>
  [...list]
    .map((asset) => ({
      owner: asset.owner,
      ticker: asset.ticker,
      name: asset.name,
      marketType: asset.marketType,
      quantity: Number(asset.quantity),
      avgPrice: Number(asset.avgPrice),
      currentPrice: Number(asset.currentPrice),
    }))
    .sort((a, b) => `${a.owner}-${a.ticker}`.localeCompare(`${b.owner}-${b.ticker}`))

const normalizeSoldForCompare = (list = []) =>
  [...list]
    .map((asset) => ({
      owner: asset.owner,
      ticker: asset.ticker,
      name: asset.name,
      marketType: asset.marketType,
      quantity: Number(asset.quantity),
      avgPrice: Number(asset.avgPrice),
      sellPrice: Number(asset.sellPrice),
      realizedPnl: Number(asset.realizedPnl),
      realizedPnlPct: Number(asset.realizedPnlPct),
      sellDate: asset.sellDate,
    }))
    .sort((a, b) => `${a.owner}-${a.ticker}-${a.sellDate}`.localeCompare(`${b.owner}-${b.ticker}-${b.sellDate}`))

const isSameData = (left, right) => JSON.stringify(left) === JSON.stringify(right)

const INITIAL_ASSETS = []

const INITIAL_SOLD_HISTORY = []

/* ═══════════════════════════════════════════
   SellModal — 매도 가격 입력
   ═══════════════════════════════════════════ */
function SellModal({ asset, onConfirm, onClose }) {
  const [sellPrice, setSellPrice] = useState("")
  const [sellQty, setSellQty] = useState(String(asset.quantity))
  const inputRef = useRef(null)
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100) }, [])
  useEffect(() => { setSellQty(String(asset.quantity)) }, [asset])

  const price = parseFloat(sellPrice) || 0
  const requestedQty = parseFloat(sellQty) || 0
  const sellQuantity = Math.min(Math.max(requestedQty, 0), asset.quantity)
  const proceeds = price * sellQuantity
  const cost = asset.avgPrice * sellQuantity
  const pnl = proceeds - cost
  const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0
  const isUs = asset.marketType === "us" || asset.marketType === "crypto"

  const handleConfirm = () => {
    if (!sellPrice || price <= 0 || sellQuantity <= 0) return
    onConfirm({
      ...asset,
      quantity: sellQuantity,
      sellPrice: price,
      sellDate: new Date().toLocaleDateString("ko-KR"),
      realizedPnl: pnl,
      realizedPnlPct: pnlPct,
    })
    onClose()
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(17,45,78,0.15)", backdropFilter: "blur(12px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          ...S.glass,
          background: "#F9F7F7",
          padding: 28,
          width: "min(400px,90vw)",
          boxShadow: "8px 8px 20px rgba(17,45,78,0.2), -4px -4px 12px rgba(255,255,255,0.9)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ ...goldText, fontSize: 18, fontWeight: 700 }}>매도</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: S.textMuted, fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        {/* Asset info */}
        <div style={{ ...S.inset, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: S.textPrimary }}>{asset.name}</div>
            <div style={{ fontSize: 11, color: S.textMuted, fontFamily: "'JetBrains Mono',monospace" }}>
              {asset.ticker} · {asset.quantity}{asset.marketType === "crypto" ? "" : "주"} 보유
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: S.textMuted }}>평단가</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: S.accent, fontFamily: "'JetBrains Mono',monospace" }}>
              {isUs ? `$${asset.avgPrice.toLocaleString()}` : `${asset.avgPrice.toLocaleString()}원`}
            </div>
          </div>
        </div>

        {/* Sell quantity input */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: S.textMuted, display: "block", marginBottom: 6 }}>
            매도 수량
          </label>
          <div style={{ ...S.inset, padding: "12px 16px" }}>
            <input
              value={sellQty}
              onChange={(e) => setSellQty(e.target.value)}
              type="number"
              min={0}
              max={asset.quantity}
              step={asset.marketType === "crypto" ? "0.0001" : "1"}
              placeholder="0"
              style={{
                width: "100%", background: "transparent", border: "none", outline: "none",
                color: S.textPrimary, fontSize: 16, fontFamily: "'JetBrains Mono',monospace",
              }}
            />
          </div>
          <div style={{ fontSize: 10, color: S.textMuted, marginTop: 5 }}>
            최대 {asset.quantity}{asset.marketType === "crypto" ? "" : "주"}까지 매도 가능
          </div>
        </div>

        {/* Sell price input */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: S.textMuted, display: "block", marginBottom: 6 }}>
            매도 단가 ({isUs ? "USD" : "KRW"})
          </label>
          <div style={{ ...S.inset, padding: "12px 16px" }}>
            <input
              ref={inputRef}
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value)}
              type="number"
              placeholder={isUs ? "0.00" : "0"}
              style={{
                width: "100%", background: "transparent", border: "none", outline: "none",
                color: S.textPrimary, fontSize: 16, fontFamily: "'JetBrains Mono',monospace",
              }}
            />
          </div>
        </div>

        {/* Preview */}
        {price > 0 && sellQuantity > 0 && (
          <div style={{ ...S.inset, padding: 14, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: S.textMuted, marginBottom: 8, fontWeight: 600 }}>매도 예상 결과</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                ["매도 수량", `${sellQuantity}${asset.marketType === "crypto" ? "" : "주"}`],
                ["매도 금액", isUs ? fmtU(proceeds) : `${fmt(proceeds)}원`],
                ["투자 원금", isUs ? fmtU(cost) : `${fmt(cost)}원`],
                ["실현 손익", `${pnl >= 0 ? "+" : ""}${isUs ? fmtU(pnl) : `${fmt(pnl)}원`}`],
                ["수익률", `${pnl >= 0 ? "+" : ""}${pnlPct.toFixed(2)}%`],
              ].map(([label, value], i) => (
                <div key={i}>
                  <div style={{ fontSize: 10, color: S.textMuted }}>{label}</div>
                  <div style={{
                    fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace",
                    color: i >= 3 ? (pnl >= 0 ? S.profit : S.loss) : S.textPrimary,
                  }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onClose}
            style={{ ...S.btn, flex: 1, padding: 12, color: S.textSecondary, fontSize: 13 }}
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={!sellPrice || price <= 0 || sellQuantity <= 0 || sellQuantity > asset.quantity}
            style={{
              ...S.btn, flex: 2, padding: 12, fontSize: 14, fontWeight: 700, border: "none",
              background: price > 0 && sellQuantity > 0 ? "linear-gradient(135deg, #c0392b, #e74c3c)" : S.btn.background,
              color: price > 0 && sellQuantity > 0 ? "#fff" : S.textMuted,
              boxShadow: price > 0 && sellQuantity > 0 ? "3px 3px 10px rgba(192,57,43,0.35)" : S.btn.boxShadow,
              cursor: price > 0 && sellQuantity > 0 ? "pointer" : "not-allowed",
            }}
          >
            매도 확정
          </button>
        </div>
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════
   EditModal — 자산 수정
   ═══════════════════════════════════════════ */
function EditModal({ asset, onConfirm, onClose }) {
  const [qty, setQty] = useState(String(asset.quantity))
  const [avg, setAvg] = useState(String(asset.avgPrice))
  const [leverage, setLeverage] = useState(asset.leverage ?? 1)
  const isCrypto = asset.marketType === "crypto"
  const isCash = asset.marketType === "cash"
  const isUsd = asset.marketType === "us" || isCrypto

  const handleConfirm = () => {
    const newQty = parseFloat(qty)
    const newAvg = parseFloat(avg)
    if (!newQty || newQty <= 0 || !newAvg || newAvg <= 0) return
    onConfirm({ ...asset, quantity: newQty, avgPrice: newAvg, leverage: isCrypto ? leverage : (asset.leverage ?? 1) })
    onClose()
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(17,45,78,0.15)", backdropFilter: "blur(12px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          ...S.glass, background: "#F9F7F7", padding: 28,
          width: "min(400px,90vw)",
          boxShadow: "8px 8px 20px rgba(17,45,78,0.2), -4px -4px 12px rgba(255,255,255,0.9)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ ...goldText, fontSize: 18, fontWeight: 700 }}>수정</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: S.textMuted, fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        {/* 종목 정보 */}
        <div style={{ ...S.inset, padding: "12px 16px", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: S.textPrimary }}>{asset.name}</div>
          <div style={{ fontSize: 11, color: S.textMuted, fontFamily: "'JetBrains Mono',monospace" }}>
            {asset.ticker} · {asset.marketType.toUpperCase()}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {isCash ? (
            /* 현금: 금액만 수정 */
            <div>
              <label style={{ fontSize: 11, color: S.textMuted, display: "block", marginBottom: 6 }}>
                보유 금액 ({asset.ticker})
              </label>
              <div style={{ ...S.inset, padding: "12px 16px" }}>
                <input
                  value={qty} onChange={(e) => setQty(e.target.value)} type="number"
                  style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: S.textPrimary, fontSize: 16, fontFamily: "'JetBrains Mono',monospace" }}
                />
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: S.textMuted, display: "block", marginBottom: 6 }}>수량</label>
                  <div style={{ ...S.inset, padding: "10px 14px" }}>
                    <input
                      value={qty} onChange={(e) => setQty(e.target.value)} type="number"
                      style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: S.textPrimary, fontSize: 14, fontFamily: "'JetBrains Mono',monospace" }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: S.textMuted, display: "block", marginBottom: 6 }}>
                    평단가 ({isUsd ? "USD" : "KRW"})
                  </label>
                  <div style={{ ...S.inset, padding: "10px 14px" }}>
                    <input
                      value={avg} onChange={(e) => setAvg(e.target.value)} type="number"
                      style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: S.textPrimary, fontSize: 14, fontFamily: "'JetBrains Mono',monospace" }}
                    />
                  </div>
                </div>
              </div>

              {/* 레버리지 (코인만) */}
              {isCrypto && (
                <div>
                  <label style={{ fontSize: 11, color: S.textMuted, display: "block", marginBottom: 6 }}>
                    레버리지{leverage > 1 && <span style={{ color: "#e63946", fontWeight: 700, marginLeft: 6 }}>{leverage}×</span>}
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {[1, 2, 3, 5, 10, 15, 20].map((lv) => (
                      <button
                        key={lv}
                        onClick={() => setLeverage(lv)}
                        style={{
                          ...S.btn, padding: "6px 12px", fontSize: 12,
                          fontWeight: leverage === lv ? 700 : 400,
                          color: leverage === lv ? (lv === 1 ? S.accent : "#e63946") : S.textMuted,
                          border: leverage === lv ? `1px solid ${lv === 1 ? S.accent : "#e63946"}` : "1px solid transparent",
                          background: leverage === lv && lv > 1 ? "rgba(230,57,70,0.08)" : undefined,
                        }}
                      >
                        {lv}×
                      </button>
                    ))}
                    <div style={{ ...S.inset, padding: "5px 10px", display: "flex", alignItems: "center", gap: 4 }}>
                      <input
                        type="number" min={1} max={20} placeholder="직접"
                        value={[1,2,3,5,10,15,20].includes(leverage) ? "" : leverage}
                        onChange={(e) => setLeverage(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                        style={{ width: 36, background: "transparent", border: "none", outline: "none", color: S.textPrimary, fontSize: 12, fontFamily: "'JetBrains Mono',monospace" }}
                      />
                      <span style={{ fontSize: 11, color: S.textMuted }}>×</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button onClick={onClose} style={{ ...S.btn, flex: 1, padding: 12, color: S.textSecondary, fontSize: 13 }}>
              취소
            </button>
            <button
              onClick={handleConfirm}
              style={{
                ...S.btn, flex: 2, padding: 12,
                background: S.accentGrad, color: "#fff", fontSize: 14, fontWeight: 700,
                border: "none", boxShadow: "3px 3px 10px rgba(37,99,235,0.3)",
              }}
            >
              수정 확정
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   Components
   ═══════════════════════════════════════════ */
function StockSearch({ marketType, onSelect, onClose }) {
  const [query, setQuery] = useState("")
  const [apiResults, setApiResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100) }, [])

  // API 검색 (debounce 350ms) - kr/us만
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim() || marketType === "crypto") {
      setApiResults([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const endpoint = marketType === "kr"
          ? `/api/stock/search/kr?q=${encodeURIComponent(query)}`
          : `/api/stock/search/us?q=${encodeURIComponent(query)}`
        const res = await fetch(endpoint)
        const data = await res.json()
        setApiResults(data.items || [])
      } catch {
        setApiResults([])
      } finally {
        setIsSearching(false)
      }
    }, 350)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, marketType])

  const results = useMemo(() => {
    if (!query.trim()) {
      if (marketType === "kr") return KR_STOCKS.slice(0, 12)
      if (marketType === "us") return US_STOCKS.slice(0, 12)
      return CRYPTO_LIST.slice(0, 12)
    }
    const q = query.toLowerCase().trim()
    // 암호화폐는 정적 리스트
    if (marketType === "crypto")
      return CRYPTO_LIST.filter((s) => s.ticker.toLowerCase().startsWith(q) || s.name.toLowerCase().includes(q)).slice(0, 12)
    // kr/us: API 결과 우선, 없으면 정적 fallback
    if (apiResults.length > 0) return apiResults
    if (marketType === "kr")
      return KR_STOCKS.filter(
        (s) => s.code.startsWith(q) || s.name.toLowerCase().includes(q) || s.eng.toLowerCase().includes(q),
      ).slice(0, 12)
    return US_STOCKS.filter((s) => s.ticker.toLowerCase().startsWith(q) || s.name.toLowerCase().includes(q)).slice(0, 12)
  }, [query, marketType, apiResults])

  const titles = { kr: "🇰🇷 국내 주식 검색", us: "🇺🇸 해외 주식 검색", crypto: "🪙 암호화폐 검색" }
  const placeholders = {
    kr: "종목코드 (005930) 또는 이름 (삼성전자)",
    us: "Ticker (AAPL) or Name (Apple)",
    crypto: "심볼 (BTC) or 이름 (Bitcoin)",
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(17,45,78,0.15)", backdropFilter: "blur(12px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          ...S.glass,
          background: "#F9F7F7",
          padding: 0,
          width: "min(480px,92vw)",
          boxShadow: "8px 8px 20px rgba(17,45,78,0.2), -4px -4px 12px rgba(255,255,255,0.9)",
          display: "flex", flexDirection: "column",
          height: "min(560px,80vh)", overflow: "hidden",
        }}
      >
        <div style={{ padding: "24px 24px 16px", borderBottom: "1px solid rgba(180,185,200,0.3)", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ ...goldText, fontSize: 18, fontWeight: 700, fontFamily: "'Noto Serif KR',serif" }}>
              {titles[marketType]}
            </span>
            <button onClick={onClose} style={{ background: "none", border: "none", color: S.textMuted, fontSize: 20, cursor: "pointer", padding: 4 }}>✕</button>
          </div>
          <div style={{ ...S.inset, padding: "12px 16px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: S.textMuted, fontSize: 16 }}>⌕</span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholders[marketType]}
              style={{
                width: "100%", background: "transparent", border: "none", outline: "none",
                color: S.textPrimary, fontSize: 14, fontFamily: "'JetBrains Mono',monospace",
              }}
            />
            {query && (
              <button onClick={() => setQuery("")} style={{ background: "none", border: "none", color: S.textMuted, cursor: "pointer", fontSize: 14 }}>✕</button>
            )}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px 16px" }}>
          {!query.trim() && (
            <div style={{ fontSize: 11, color: S.textMuted, padding: "8px 8px 4px", fontWeight: 600 }}>인기 종목</div>
          )}
          {isSearching && (
            <div style={{ textAlign: "center", color: S.textMuted, padding: "16px 0", fontSize: 12 }}>검색 중...</div>
          )}
          {!isSearching && results.map((item, i) => (
            <div
              key={i}
              onClick={() => onSelect(item)}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "11px 14px", marginBottom: 2, borderRadius: 12,
                cursor: "pointer", transition: "all 0.12s",
                background: "transparent", border: "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(63,114,175,0.08)"
                e.currentTarget.style.borderColor = "rgba(63,114,175,0.2)"
                e.currentTarget.style.boxShadow = "2px 2px 8px rgba(17,45,78,0.15)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent"
                e.currentTarget.style.borderColor = "transparent"
                e.currentTarget.style.boxShadow = "none"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: S.accent, fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700, minWidth: 60 }}>
                  {marketType === "kr" ? item.code : item.ticker}
                </span>
                <span style={{ color: S.textPrimary, fontSize: 13, fontWeight: 500 }}>{item.name}</span>
              </div>
              <span style={{ color: S.textMuted, fontSize: 11 }}>
                {marketType === "kr" ? (item.market || item.eng || "") : (item.type || "")}
              </span>
            </div>
          ))}
          {query && !isSearching && results.length === 0 && (
            <div style={{ textAlign: "center", color: S.textMuted, padding: 32, fontSize: 13 }}>검색 결과가 없습니다</div>
          )}
        </div>
      </div>
    </div>
  )
}

function AddAssetModal({ owner, defaultMarket, cashFor, onAdd, onClose }) {
  // cashFor: "kr" | "us" | "crypto" — 어느 계좌의 현금인지
  const CASH_TICKER_MAP = { kr: "KRW", us: "USD", crypto: "USDT" }
  const CASH_NAME_MAP = { kr: "원화 현금", us: "달러 현금", crypto: "USDT 현금" }
  const fixedCashCurrency = cashFor ? CASH_TICKER_MAP[cashFor] : null

  const [step, setStep] = useState(cashFor ? "cash" : defaultMarket === "cash" ? "cash" : defaultMarket ? "search" : "type")
  const [marketType, setMarketType] = useState(defaultMarket || null)
  const [selected, setSelected] = useState(null)
  const [qty, setQty] = useState("")
  const [avg, setAvg] = useState("")
  const [leverage, setLeverage] = useState(1)
  const [selectedOwner, setSelectedOwner] = useState(owner || "용")
  const [cashCurrency, setCashCurrency] = useState(fixedCashCurrency || "KRW")
  const [cashAmount, setCashAmount] = useState("")

  const handleSelect = (item) => { setSelected(item); setStep("detail") }
  const handleAdd = () => {
    if (!selected || !qty || !avg) return
    const ticker = marketType === "kr" ? selected.code : selected.ticker
    onAdd({
      owner: selectedOwner, ticker, name: selected.name, marketType,
      quantity: parseFloat(qty), avgPrice: parseFloat(avg),
      currentPrice: getSimPrice(ticker),
      leverage: marketType === "crypto" ? leverage : 1,
    })
    onClose()
  }
  const handleAddCash = () => {
    const amount = parseFloat(cashAmount)
    if (!amount || amount <= 0) return
    const curName = cashFor
      ? CASH_NAME_MAP[cashFor]
      : cashCurrency === "KRW" ? "원화 현금" : cashCurrency === "USDT" ? "USDT 현금" : "달러 현금"
    onAdd({
      owner: selectedOwner,
      ticker: cashCurrency,
      name: curName,
      marketType: "cash",
      quantity: amount,
      avgPrice: 1,
      currentPrice: 1,
      leverage: 1,
    })
    onClose()
  }

  if (step === "search" && marketType)
    return <StockSearch marketType={marketType} onSelect={handleSelect} onClose={onClose} />

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(17,45,78,0.15)", backdropFilter: "blur(12px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          ...S.glass, background: "#F9F7F7", padding: 28,
          width: "min(420px,90vw)",
          boxShadow: "8px 8px 20px rgba(17,45,78,0.2), -4px -4px 12px rgba(255,255,255,0.9)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ ...goldText, fontSize: 18, fontWeight: 700 }}>
            {step === "type" ? "자산 추가" : step === "cash" ? "현금 추가" : "매수 상세 정보"}
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: S.textMuted, fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        {/* 소유자 선택 (공통) */}
        {(step === "type" || step === "cash") && !owner && (
          <div style={{ marginBottom: 14, display: "flex", gap: 10 }}>
            {["용", "령"].map((o) => (
              <button
                key={o}
                onClick={() => setSelectedOwner(o)}
                style={{
                  ...S.btn, flex: 1, padding: "10px",
                  color: selectedOwner === o ? S.accent : S.textMuted,
                  fontWeight: selectedOwner === o ? 700 : 400,
                  border: selectedOwner === o ? `1px solid ${S.accent}` : "1px solid transparent",
                }}
              >
                {o === "용" ? "🐉" : "🐲"} {o}
              </button>
            ))}
          </div>
        )}

        {step === "type" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["kr", "🇰🇷 국내 주식", "코드 / 이름 검색"],
              ["us", "🇺🇸 해외 주식", "Ticker / Name"],
              ["crypto", "🪙 암호화폐", "Symbol / Name"],
            ].map(([t, l, sub]) => (
              <button
                key={t}
                onClick={() => {
                  setMarketType(t)
                  setStep("search")
                }}
                style={{
                  ...S.btn, padding: "15px 18px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  color: S.textPrimary, fontSize: 14, fontWeight: 500,
                }}
                onMouseDown={(e) => Object.assign(e.currentTarget.style, S.btnPress)}
                onMouseUp={(e) => Object.assign(e.currentTarget.style, { boxShadow: S.btn.boxShadow, background: S.btn.background })}
              >
                <span>{l}</span>
                <span style={{ fontSize: 11, color: S.textMuted }}>{sub}</span>
              </button>
            ))}
          </div>
        )}

        {step === "cash" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* 통화 표시 (cashFor가 있으면 고정, 없으면 선택) */}
            {fixedCashCurrency ? (
              <div style={{ ...S.inset, padding: "12px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>
                  {fixedCashCurrency === "KRW" ? "🇰🇷" : fixedCashCurrency === "USDT" ? "🪙" : "🇺🇸"}
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: S.textPrimary }}>
                  {fixedCashCurrency === "KRW" ? "원화 (KRW)" : fixedCashCurrency === "USDT" ? "USDT" : "달러 (USD)"}
                </span>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 10 }}>
                {[["KRW", "🇰🇷 원화 (KRW)"], ["USD", "🇺🇸 달러 (USD)"]].map(([cur, label]) => (
                  <button
                    key={cur}
                    onClick={() => setCashCurrency(cur)}
                    style={{
                      ...S.btn, flex: 1, padding: "12px 10px", fontSize: 13,
                      color: cashCurrency === cur ? S.accent : S.textMuted,
                      fontWeight: cashCurrency === cur ? 700 : 400,
                      border: cashCurrency === cur ? `1px solid ${S.accent}` : "1px solid transparent",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            {/* 금액 입력 */}
            <div>
              <label style={{ color: S.textMuted, fontSize: 11, marginBottom: 6, display: "block" }}>
                보유 금액 ({cashCurrency === "KRW" ? "원" : cashCurrency})
              </label>
              <div style={{ ...S.inset, padding: "12px 16px" }}>
                <input
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  type="number"
                  placeholder={cashCurrency === "KRW" ? "1000000" : "5000"}
                  style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: S.textPrimary, fontSize: 16, fontFamily: "'JetBrains Mono',monospace" }}
                />
              </div>
              {cashAmount && (
                <div style={{ fontSize: 11, color: S.textMuted, marginTop: 4, textAlign: "right" }}>
                  {cashCurrency === "KRW"
                    ? `${Number(cashAmount).toLocaleString()}원`
                    : `${cashCurrency} ${Number(cashAmount).toLocaleString()}`}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              {!cashFor && (
                <button onClick={() => setStep("type")} style={{ ...S.btn, flex: 1, padding: 12, color: S.textSecondary, fontSize: 13 }}>
                  ← 뒤로
                </button>
              )}
              <button
                onClick={handleAddCash}
                disabled={!cashAmount || parseFloat(cashAmount) <= 0}
                style={{
                  ...S.btn, flex: 2, padding: 12,
                  background: S.accentGrad, color: "#fff", fontSize: 14, fontWeight: 700,
                  border: "none", boxShadow: "3px 3px 10px rgba(160,128,80,0.35)",
                  opacity: !cashAmount || parseFloat(cashAmount) <= 0 ? 0.5 : 1,
                }}
              >
                추가 확정
              </button>
            </div>
          </div>
        )}

        {step === "detail" && selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ ...S.inset, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: S.accent, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 14 }}>
                {marketType === "kr" ? selected.code : selected.ticker}
              </span>
              <span style={{ color: S.textPrimary, fontSize: 14 }}>{selected.name}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ color: S.textMuted, fontSize: 11, marginBottom: 3, display: "block" }}>수량</label>
                <div style={{ ...S.inset, padding: "10px 14px" }}>
                  <input
                    value={qty} onChange={(e) => setQty(e.target.value)} type="number" placeholder="0"
                    style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: S.textPrimary, fontSize: 14, fontFamily: "'JetBrains Mono',monospace" }}
                  />
                </div>
              </div>
              <div>
                <label style={{ color: S.textMuted, fontSize: 11, marginBottom: 3, display: "block" }}>
                  평단가 ({marketType === "kr" ? "KRW" : "USD"})
                </label>
                <div style={{ ...S.inset, padding: "10px 14px" }}>
                  <input
                    value={avg} onChange={(e) => setAvg(e.target.value)} type="number" placeholder="0"
                    style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: S.textPrimary, fontSize: 14, fontFamily: "'JetBrains Mono',monospace" }}
                  />
                </div>
              </div>
            </div>

            {/* 레버리지 선택 (코인만) */}
            {marketType === "crypto" && (
              <div>
                <label style={{ color: S.textMuted, fontSize: 11, marginBottom: 6, display: "block" }}>
                  레버리지 배수
                  {leverage > 1 && <span style={{ color: "#e63946", fontWeight: 700, marginLeft: 6 }}>{leverage}×</span>}
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {[1, 2, 3, 5, 10, 15, 20].map((lv) => (
                    <button
                      key={lv}
                      onClick={() => setLeverage(lv)}
                      style={{
                        ...S.btn,
                        padding: "6px 12px",
                        fontSize: 12,
                        fontWeight: leverage === lv ? 700 : 400,
                        color: leverage === lv ? (lv === 1 ? S.accent : "#e63946") : S.textMuted,
                        border: leverage === lv ? `1px solid ${lv === 1 ? S.accent : "#e63946"}` : "1px solid transparent",
                        background: leverage === lv && lv > 1 ? "rgba(230,57,70,0.08)" : undefined,
                      }}
                    >
                      {lv}×
                    </button>
                  ))}
                  {/* 직접 입력 */}
                  <div style={{ ...S.inset, padding: "5px 10px", display: "flex", alignItems: "center", gap: 4 }}>
                    <input
                      type="number"
                      min={1} max={20}
                      placeholder="직접"
                      value={[1,2,3,5,10,15,20].includes(leverage) ? "" : leverage}
                      onChange={(e) => {
                        const v = Math.min(20, Math.max(1, parseInt(e.target.value) || 1))
                        setLeverage(v)
                      }}
                      style={{ width: 36, background: "transparent", border: "none", outline: "none", color: S.textPrimary, fontSize: 12, fontFamily: "'JetBrains Mono',monospace" }}
                    />
                    <span style={{ fontSize: 11, color: S.textMuted }}>×</span>
                  </div>
                </div>
                {leverage > 1 && (
                  <div style={{ fontSize: 11, color: "#e63946", marginTop: 6 }}>
                    ⚠ 손익이 {leverage}배로 계산됩니다 (평가금액은 실제 포지션 기준)
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button onClick={() => setStep("type")} style={{ ...S.btn, flex: 1, padding: 12, color: S.textSecondary, fontSize: 13 }}>
                ← 뒤로
              </button>
              <button
                onClick={handleAdd}
                style={{
                  ...S.btn, flex: 2, padding: 12,
                  background: S.accentGrad, color: "#fff", fontSize: 14, fontWeight: 700,
                  border: "none", boxShadow: "3px 3px 10px rgba(160,128,80,0.35)",
                }}
              >
                매수 확정
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DividendCalendar({ assets }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const months = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"]
  const now = new Date().getMonth()

  // 배당 데이터 (전체 목록) — 실제 보유 종목만 필터링하여 사용
  const allDividendSchedule = [
    { month: 0, ticker: "AAPL", name: "Apple", amount: 24.0, currency: "USD", payDate: "1/15", type: "분기" },
    { month: 0, ticker: "SCHD", name: "Schwab Div", amount: 42.0, currency: "USD", payDate: "1/20", type: "분기" },
    { month: 1, ticker: "MSFT", name: "Microsoft", amount: 22.4, currency: "USD", payDate: "2/12", type: "분기" },
    { month: 2, ticker: "005930", name: "삼성전자", amount: 361, currency: "KRW", payDate: "3/20", type: "결산", unit: "원/주" },
    { month: 2, ticker: "KO", name: "Coca-Cola", amount: 18.6, currency: "USD", payDate: "3/15", type: "분기" },
    { month: 3, ticker: "AAPL", name: "Apple", amount: 24.0, currency: "USD", payDate: "4/15", type: "분기" },
    { month: 3, ticker: "SCHD", name: "Schwab Div", amount: 43.5, currency: "USD", payDate: "4/20", type: "분기" },
    { month: 4, ticker: "MSFT", name: "Microsoft", amount: 22.4, currency: "USD", payDate: "5/12", type: "분기" },
    { month: 4, ticker: "005930", name: "삼성전자", amount: 361, currency: "KRW", payDate: "5/17", type: "중간", unit: "원/주" },
    { month: 5, ticker: "KO", name: "Coca-Cola", amount: 18.6, currency: "USD", payDate: "6/15", type: "분기" },
    { month: 5, ticker: "VOO", name: "Vanguard 500", amount: 1.58, currency: "USD", payDate: "6/28", type: "분기" },
    { month: 6, ticker: "AAPL", name: "Apple", amount: 24.0, currency: "USD", payDate: "7/15", type: "분기" },
    { month: 6, ticker: "SCHD", name: "Schwab Div", amount: 45.2, currency: "USD", payDate: "7/20", type: "분기" },
    { month: 7, ticker: "MSFT", name: "Microsoft", amount: 22.4, currency: "USD", payDate: "8/12", type: "분기" },
    { month: 8, ticker: "KO", name: "Coca-Cola", amount: 18.6, currency: "USD", payDate: "9/15", type: "분기" },
    { month: 8, ticker: "005930", name: "삼성전자", amount: 361, currency: "KRW", payDate: "9/20", type: "중간", unit: "원/주" },
    { month: 8, ticker: "VOO", name: "Vanguard 500", amount: 1.62, currency: "USD", payDate: "9/28", type: "분기" },
    { month: 9, ticker: "AAPL", name: "Apple", amount: 24.0, currency: "USD", payDate: "10/15", type: "분기" },
    { month: 9, ticker: "SCHD", name: "Schwab Div", amount: 47.0, currency: "USD", payDate: "10/20", type: "분기" },
    { month: 10, ticker: "MSFT", name: "Microsoft", amount: 22.4, currency: "USD", payDate: "11/12", type: "분기" },
    { month: 11, ticker: "005930", name: "삼성전자", amount: 361, currency: "KRW", payDate: "12/20", type: "결산", unit: "원/주" },
    { month: 11, ticker: "KO", name: "Coca-Cola", amount: 18.6, currency: "USD", payDate: "12/15", type: "분기" },
    { month: 11, ticker: "VOO", name: "Vanguard 500", amount: 1.65, currency: "USD", payDate: "12/28", type: "분기" },
  ]
  // 보유 종목의 ticker 집합 (cash 제외)
  const heldTickers = new Set(assets.filter((a) => a.marketType !== "cash").map((a) => a.ticker))
  const dividendSchedule = allDividendSchedule.filter((d) => heldTickers.has(d.ticker))

  const monthlyTotals = useMemo(() => {
    return months.map((_, i) => {
      const mDivs = dividendSchedule.filter((d) => d.month === i)
      const krwTotal = mDivs.reduce((s, d) => {
        if (d.currency === "USD") return s + d.amount * EXCHANGE_RATE
        const held = assets.filter((a) => a.ticker === d.ticker).reduce((sum, a) => sum + a.quantity, 0)
        return s + d.amount * held
      }, 0)
      return { month: i, total: krwTotal, count: mDivs.length, divs: mDivs }
    })
  }, [assets])

  const annualTotal = monthlyTotals.reduce((s, m) => s + m.total, 0)
  const selectedDivs = monthlyTotals[selectedMonth]

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 12, color: S.textMuted, marginBottom: 2 }}>연간 예상 배당금</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: S.accent, fontFamily: "'JetBrains Mono',monospace" }}>{fmt(annualTotal)}원</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: S.textMuted }}>월 평균</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: S.textPrimary, fontFamily: "'JetBrains Mono',monospace" }}>{fmt(annualTotal / 12)}원</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 6, marginBottom: 16 }}>
        {months.map((m, i) => {
          const data = monthlyTotals[i]
          const isNow = i === now
          const isSel = i === selectedMonth
          const isPast = i < now
          return (
            <div
              key={i}
              onClick={() => setSelectedMonth(i)}
              style={{
                background: isSel ? "rgba(160,128,80,0.1)" : "linear-gradient(145deg, #eef0f5, #dcdfe6)",
                boxShadow: isSel
                  ? "inset 2px 2px 6px rgba(163,167,180,0.5), inset -2px -2px 6px rgba(255,255,255,0.6)"
                  : "2px 2px 6px rgba(163,167,180,0.4), -2px -2px 4px rgba(255,255,255,0.7)",
                borderRadius: 12, padding: "10px 6px", textAlign: "center", cursor: "pointer",
                border: isSel ? `1.5px solid ${S.accentLight}` : isNow ? "1.5px solid rgba(160,128,80,0.3)" : "1px solid rgba(255,255,255,0.4)",
                opacity: isPast && !isSel ? 0.55 : 1,
                transition: "all 0.15s",
              }}
            >
              <div style={{ fontSize: 11, color: isSel ? S.accent : isNow ? S.accent : S.textMuted, fontWeight: isNow || isSel ? 700 : 400, marginBottom: 4 }}>{m}</div>
              {data.total > 0 ? (
                <>
                  <div style={{ fontSize: 12, color: S.textPrimary, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace" }}>{fmt(data.total)}</div>
                  <div style={{ display: "flex", justifyContent: "center", gap: 2, marginTop: 3 }}>
                    {Array.from({ length: Math.min(data.count, 4) }).map((_, j) => (
                      <div key={j} style={{ width: 4, height: 4, borderRadius: "50%", background: S.accentLight }} />
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 11, color: S.textMuted }}>—</div>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ ...S.inset, padding: 16 }}>
        <div style={{ fontSize: 12, color: S.textMuted, fontWeight: 600, marginBottom: 10 }}>{months[selectedMonth]} 배당 상세</div>
        {selectedDivs.divs.length > 0 ? (
          selectedDivs.divs.map((d, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < selectedDivs.divs.length - 1 ? "1px solid rgba(180,185,200,0.2)" : "none" }}>
              <div>
                <span style={{ fontSize: 13, color: S.textPrimary, fontWeight: 600 }}>{d.name}</span>
                <span style={{ fontSize: 11, color: S.textMuted, marginLeft: 8 }}>{d.ticker}</span>
                <span style={{ fontSize: 10, color: S.accentLight, marginLeft: 6, padding: "1px 5px", background: "rgba(160,128,80,0.08)", borderRadius: 4 }}>{d.type}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: S.accent, fontFamily: "'JetBrains Mono',monospace" }}>
                  {d.currency === "USD" ? `$${d.amount.toFixed(2)}` : `${d.amount}${d.unit || "원"}`}
                </div>
                <div style={{ fontSize: 10, color: S.textMuted }}>{d.payDate} 지급예정</div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", color: S.textMuted, fontSize: 13, padding: 12 }}>이 달에는 배당금이 없습니다</div>
        )}
      </div>

      {annualTotal > 300000 && (
        <div style={{ ...S.card, padding: "14px 18px", marginTop: 14, display: "flex", alignItems: "center", gap: 12, background: "linear-gradient(145deg, #f5f0e8, #e8e0d5)", border: "1px solid rgba(196,162,101,0.3)" }}>
          <span style={{ fontSize: 22 }}>🥃</span>
          <div>
            <div style={{ fontSize: 13, color: S.accent, fontWeight: 700 }}>위스키 모먼트!</div>
            <div style={{ fontSize: 11, color: S.textSecondary }}>연 배당금 {fmt(annualTotal)}원 — 분기마다 라가불린 16년산 한 병!</div>
          </div>
        </div>
      )}
    </div>
  )
}

function WeeklyReview({ evaluated, grandTotal }) {
  const lastWeekTotal = grandTotal * 0.985
  const weekChange = grandTotal - lastWeekTotal
  const weekPct = (weekChange / lastWeekTotal) * 100
  const topGainer = [...evaluated].sort((a, b) => b.pnlPct - a.pnlPct)[0]
  const topLoser = [...evaluated].sort((a, b) => a.pnlPct - b.pnlPct)[0]

  const dailyData = useMemo(() => {
    const days = ["월", "화", "수", "목", "금"]
    return days.map((d, i) => ({
      day: d,
      value: grandTotal * (0.993 + i * 0.002 + (Math.random() - 0.3) * 0.003),
    }))
  }, [grandTotal])

  const weekDate = new Date()
  const weekStart = new Date(weekDate)
  weekStart.setDate(weekDate.getDate() - weekDate.getDay() + 1)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 4)

  return (
    <div style={{ ...S.card, padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: S.textMuted, marginBottom: 2 }}>📊 Weekly Review</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: S.textPrimary }}>
            {weekStart.getMonth() + 1}/{weekStart.getDate()} — {weekEnd.getMonth() + 1}/{weekEnd.getDate()} 주간 리뷰
          </div>
        </div>
        <div style={{ ...S.inset, padding: "6px 14px", color: weekChange >= 0 ? S.profit : S.loss, fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>
          {weekChange >= 0 ? "+" : ""}{weekPct.toFixed(2)}%
        </div>
      </div>

      <div style={{ ...S.inset, padding: "16px 12px 8px", marginBottom: 16 }}>
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={dailyData}>
            <defs>
              <linearGradient id="weekGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={S.accent} stopOpacity={0.25} />
                <stop offset="100%" stopColor={S.accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fill: S.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide domain={["dataMin-1000000", "dataMax+1000000"]} />
            <Tooltip contentStyle={{ ...S.glass, background: "#f5f6fa", fontSize: 12, color: S.textPrimary, border: `1px solid ${S.accentLight}` }} formatter={(v) => [fmt(v) + "원", ""]} />
            <Area type="monotone" dataKey="value" stroke={S.accent} strokeWidth={2} fill="url(#weekGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <div style={{ ...S.inset, padding: 12, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: S.textMuted, marginBottom: 4 }}>주간 변동</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: weekChange >= 0 ? S.profit : S.loss, fontFamily: "'JetBrains Mono',monospace" }}>
            {weekChange >= 0 ? "+" : ""}{fmt(weekChange)}
          </div>
        </div>
        <div style={{ ...S.inset, padding: 12, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: S.textMuted, marginBottom: 4 }}>🏆 주간 MVP</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: S.profit }}>{topGainer?.name?.slice(0, 8)}</div>
          <div style={{ fontSize: 11, color: S.textMuted }}>+{topGainer?.pnlPct?.toFixed(1)}%</div>
        </div>
        <div style={{ ...S.inset, padding: 12, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: S.textMuted, marginBottom: 4 }}>📉 관심 필요</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: S.loss }}>{topLoser?.name?.slice(0, 8)}</div>
          <div style={{ fontSize: 11, color: S.textMuted }}>{topLoser?.pnlPct?.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════════ */
export default function GoldenFuture() {
  const [tab, setTab] = useState("dashboard")
  const [selectedUser, setSelectedUser] = useState<"전체" | "용" | "령">("전체")
  const [showAdd, setShowAdd] = useState(null)
  const [sellTarget, setSellTarget] = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [assets, setAssets] = useState([])

  // Sold assets history
  const [soldHistory, setSoldHistory] = useState(hasSupabaseConfig ? [] : INITIAL_SOLD_HISTORY)
  const [syncStatus, setSyncStatus] = useState(hasSupabaseConfig ? "Supabase 동기화 대기" : "Supabase 환경변수 미설정 (로컬 모드)")
  const [saveLogs, setSaveLogs] = useState<string[]>([])
  const [toastLogs, setToastLogs] = useState<{ id: number; msg: string }[]>([])
  const [showLogPanel, setShowLogPanel] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isRefreshingPrices, setIsRefreshingPrices] = useState(false)
  const [isImportingBitget, setIsImportingBitget] = useState(false)
  const assetsRef = useRef(assets)
  const refreshingRef = useRef(false)

  const [bitgetStatus, setBitgetStatus] = useState("미연결")
  const [isBitgetSyncing, setIsBitgetSyncing] = useState(false)
  const [bitgetHoldings, setBitgetHoldings] = useState<{
    ticker: string; available: number; total: number; usdtPrice?: number; krwValue?: number
  }[]>([])
  const [bitgetUsdtBalance, setBitgetUsdtBalance] = useState(0)

  const pushSaveLog = (msg) => {
    const t = new Date().toLocaleTimeString("ko-KR", { hour12: false })
    const entry = `${t} · ${msg}`
    setSaveLogs((prev) => [entry, ...prev].slice(0, 50))
    const id = Date.now()
    setToastLogs((prev) => [...prev, { id, msg: entry }])
    setTimeout(() => setToastLogs((prev) => prev.filter((l) => l.id !== id)), 30000)
  }

  useEffect(() => {
    assetsRef.current = assets
  }, [assets])

  useEffect(() => {
    if (!hasSupabaseConfig) return

    const loadFromSupabase = async () => {
      try {
        const assetRows = await supabaseRequest("golden_assets", { query: "select=owner,ticker,name,market_type,quantity,avg_price,current_price,leverage&order=created_at.asc" })
        const soldRows = await supabaseRequest("golden_sold_history", { query: "select=owner,ticker,name,market_type,quantity,avg_price,sell_price,realized_pnl,realized_pnl_pct,sell_date&order=created_at.asc" })

        const remoteAssets = Array.isArray(assetRows) ? assetRows.map(fromAssetRow) : []
        const remoteSoldHistory = Array.isArray(soldRows) ? soldRows.map(fromSoldRow) : []

        const normalizedRemoteAssets = normalizeAssetsForCompare(remoteAssets)
        const normalizedRemoteSold = normalizeSoldForCompare(remoteSoldHistory)
        const normalizedInitialAssets = normalizeAssetsForCompare(INITIAL_ASSETS)
        const isAssetDataSame = isSameData(normalizedRemoteAssets, normalizedInitialAssets)
        const isSoldDataSame = isSameData(normalizedRemoteSold, INITIAL_SOLD_HISTORY)

        if (!isAssetDataSame || !isSoldDataSame) {
          pushSaveLog("초기 데이터와 Supabase 데이터 불일치 감지")
          setSyncStatus("Supabase 데이터 불일치 감지")
        } else {
          setSyncStatus("Supabase 동기화 완료")
          pushSaveLog("Supabase 데이터 일치 확인 완료")
        }

        setAssets(remoteAssets)
        setSoldHistory(remoteSoldHistory)
      } catch (error) {
        console.error(error)
        setSyncStatus("Supabase 점검 실패 (테이블/데이터 확인 필요)")
        pushSaveLog("Supabase 점검 실패: 테이블/권한/데이터 확인 필요")
      }
    }

    loadFromSupabase()
  }, [])

  const [goalAmount] = useState(100000000)
  const [goalLabel] = useState("2027 싱가포르 정착 자금 1억")
  const [exchangeRate, setExchangeRate] = useState(EXCHANGE_RATE)

  const evalAsset = (a) => {
    if (a.marketType === "cash") {
      const isUsdCash = a.ticker === "USD" || a.ticker === "USDT"
      const krw = isUsdCash ? a.quantity * exchangeRate : a.quantity
      return {
        ...a,
        value: a.quantity,
        cost: a.quantity,
        krwValue: krw,
        krwCost: krw,
        pnl: 0,
        pnlPct: 0,
      }
    }
    if (a.marketType === "crypto") {
      const lev = (a.leverage > 1) ? a.leverage : 1
      // 평가금액 = 평단가 * 수량 / 레버리지 (USD, 실제 투입 증거금)
      const val = (a.avgPrice * a.quantity) / lev
      // 손익금액 = (현재가 - 평단가) * 수량  (USD) → table에서 * exchangeRate → KRW
      const rawPnl = (a.currentPrice - a.avgPrice) * a.quantity
      // 수익률 = rawPnl / val * 100  (레버리지 반영됨)
      return {
        ...a,
        value: val,                   // 평가금액 (USD)
        cost: val,
        krwValue: val * exchangeRate, // 총자산 계산용
        krwCost: val * exchangeRate,
        pnl: rawPnl,                  // USD P&L → table에서 * exchangeRate = KRW 손익
        pnlPct: val > 0 ? (rawPnl / val) * 100 : 0,
      }
    }
    const val = a.quantity * a.currentPrice
    const cost = a.quantity * a.avgPrice
    // us는 USD 기준 → KRW 환산
    const isUsd = a.marketType === "us"
    const krw = isUsd ? val * exchangeRate : val
    const krwC = isUsd ? cost * exchangeRate : cost
    return {
      ...a,
      value: val,
      cost,
      krwValue: krw,
      krwCost: krwC,
      pnl: val - cost,
      pnlPct: cost > 0 ? ((val - cost) / cost) * 100 : 0,
    }
  }

  const evaluated = useMemo(() => {
    const all = assets.map(evalAsset)
    return selectedUser === "전체" ? all : all.filter((a) => a.owner === selectedUser)
  }, [assets, exchangeRate, selectedUser])

  const refreshMarketPrices = async (source = "자동") => {
    const baseAssets = assetsRef.current
    if (baseAssets.length === 0 || refreshingRef.current) return

    refreshingRef.current = true
    setIsRefreshingPrices(true)
    try {
      const response = await fetch("/api/market-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assets: baseAssets
            .filter((asset) => asset.marketType !== "cash")
            .map((asset) => ({ ticker: asset.ticker, marketType: asset.marketType })),
        }),
      })

      if (!response.ok) throw new Error("시세 API 호출 실패")
      const payload = await response.json()
      const prices = payload?.prices || {}
      const nextExchangeRate = Number(payload?.exchangeRate)
      const exchangeRateSource = payload?.exchangeRateSource
      if (Number.isFinite(nextExchangeRate) && nextExchangeRate > 0) {
        setExchangeRate(nextExchangeRate)
      }

      const updatedAssets = baseAssets.map((asset) => {
        const key = `${asset.marketType}:${asset.ticker}`
        const nextPrice = Number(prices[key])
        if (!Number.isFinite(nextPrice) || nextPrice <= 0) return asset
        return { ...asset, currentPrice: nextPrice }
      })

      const changedCount = updatedAssets.filter((asset, i) => asset.currentPrice !== baseAssets[i].currentPrice).length
      if (changedCount > 0) {
        assetsRef.current = updatedAssets
        setAssets(updatedAssets)
        setSyncStatus(`실시간 시세 반영 완료 (${changedCount}건)`)
        pushSaveLog(`${source} 시세 연동: ${changedCount}건 반영 · 환율 ${Number.isFinite(nextExchangeRate) ? nextExchangeRate.toFixed(2) : exchangeRate.toFixed(2)} (${exchangeRateSource || "unknown"})`)
      } else {
        pushSaveLog(`${source} 시세 연동: 반영할 데이터 없음 · 환율 ${Number.isFinite(nextExchangeRate) ? nextExchangeRate.toFixed(2) : exchangeRate.toFixed(2)} (${exchangeRateSource || "unknown"})`)
      }
    } catch (error) {
      console.error(error)
      pushSaveLog(`${source} 시세 연동 실패`)
    } finally {
      refreshingRef.current = false
      setIsRefreshingPrices(false)
    }
  }

  useEffect(() => {
    if (assetsRef.current.length === 0) return
    refreshMarketPrices("초기")
  }, [assets.length])

  const handleImportBitgetHoldings = async ({ skipPriceRefresh = false } = {}) => {
    if (isImportingBitget) return
    setIsImportingBitget(true)

    const owner = selectedUser === "전체" ? "용" : selectedUser

    try {
      const response = await fetch("/api/bitget-holdings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner }),
      })
      if (!response.ok) throw new Error("Bitget 보유 자산 조회 실패")

      const payload = await response.json()
      const imported = Array.isArray(payload?.holdings) ? payload.holdings : []

      if (imported.length === 0) {
        pushSaveLog("Bitget 보유 자산 없음 또는 API 키 확인 필요")
        setSyncStatus("Bitget 보유 자산 없음")
        return
      }

      setAssets((prev) => {
        const next = [...prev]

        imported.forEach((item) => {
          const idx = next.findIndex((asset) => asset.owner === item.owner && asset.marketType === "crypto" && asset.ticker === item.ticker)
          if (idx === -1) {
            next.push({
              owner: item.owner,
              ticker: item.ticker,
              name: item.name || item.ticker,
              marketType: "crypto",
              quantity: Number(item.quantity) || 0,
              avgPrice: Number(item.avgPrice) || Number(item.currentPrice) || 0,
              currentPrice: Number(item.currentPrice) || Number(item.avgPrice) || 0,
            })
            return
          }

          const target = next[idx]
          const incomingQty = Number(item.quantity) || 0
          const incomingAvg = Number(item.avgPrice) || Number(item.currentPrice) || target.avgPrice
          const mergedQty = target.quantity + incomingQty
          const mergedAvg = mergedQty > 0 ? ((target.avgPrice * target.quantity) + (incomingAvg * incomingQty)) / mergedQty : target.avgPrice

          next[idx] = {
            ...target,
            quantity: mergedQty,
            avgPrice: mergedAvg,
            currentPrice: Number(item.currentPrice) || target.currentPrice,
          }
        })

        assetsRef.current = next
        return next
      })

      setSyncStatus(`Bitget 보유 종목 반영 완료 (${imported.length}건)`)
      pushSaveLog(`Bitget 보유 종목 가져오기 완료: ${imported.length}건`)
      if (!skipPriceRefresh) {
        await refreshMarketPrices("Bitget 불러오기 후")
      }
    } catch (error) {
      console.error(error)
      setSyncStatus("Bitget 보유 종목 연동 실패")
      pushSaveLog("Bitget 보유 종목 연동 실패: API 키/권한 확인")
    } finally {
      setIsImportingBitget(false)
    }
  }
  
  const handleSyncAll = async () => {
    if (isRefreshingPrices || isImportingBitget) return

    await handleImportBitgetHoldings({ skipPriceRefresh: true })
    await refreshMarketPrices("통합")
    await handleSaveToSupabase()
  }

  const grandTotal = evaluated.reduce((s, a) => s + a.krwValue, 0)
  const totalCost = evaluated.reduce((s, a) => s + a.krwCost, 0)
  const totalPnl = grandTotal - totalCost
  const goalPct = Math.min((grandTotal / goalAmount) * 100, 100)

  const byMarket = (mkt) => evaluated.filter((a) => a.marketType === mkt)
  const byOwner = (own) => evaluated.filter((a) => a.owner === own)
  const marketTotal = (mkt) => byMarket(mkt).reduce((s, a) => s + a.krwValue, 0)
  const ownerTotal = (own) => byOwner(own).reduce((s, a) => s + a.krwValue, 0)
  const ownerPnl = (own) => byOwner(own).reduce((s, a) => s + (a.krwValue - a.krwCost), 0)

  // 탭별 현금 (kr→KRW, us→USD, crypto→USDT)
  const CASH_TICKER: Record<string, string> = { kr: "KRW", us: "USD", crypto: "USDT" }
  const cashByTab = (mkt: string) => evaluated.filter((a) => a.marketType === "cash" && a.ticker === CASH_TICKER[mkt])
  const cashTotal = (mkt: string) => cashByTab(mkt).reduce((s, a) => s + a.krwValue, 0)

  const allocationData = [
    { name: "국내주식", value: marketTotal("kr") + cashTotal("kr"), color: "#3F72AF" },
    { name: "해외주식", value: marketTotal("us") + cashTotal("us"), color: "#5a8fc7" },
    { name: "암호화폐", value: marketTotal("crypto") + cashTotal("crypto"), color: "#112D4E" },
  ].filter((d) => d.value > 0)

  const contribData = selectedUser !== "전체"
    ? []
    : [
        { name: "용", value: ownerTotal("용"), color: "#3F72AF" },
        { name: "령", value: ownerTotal("령"), color: "#5a8fc7" },
      ]

  const historyData = useMemo(() => {
    const d = []
    for (let i = 11; i >= 0; i--) {
      const dt = new Date()
      dt.setMonth(dt.getMonth() - i)
      const f = 0.72 + (11 - i) * 0.025 + (Math.random() - 0.3) * 0.02
      d.push({
        month: `${dt.getMonth() + 1}월`,
        total: Math.round(grandTotal * f),
        용: Math.round(ownerTotal("용") * f * (0.96 + Math.random() * 0.08)),
        령: Math.round(ownerTotal("령") * f * (0.96 + Math.random() * 0.08)),
      })
    }
    return d
  }, [grandTotal])

  const handleSaveToSupabase = async () => {
    if (!hasSupabaseConfig) {
      setSyncStatus("Supabase 환경변수 미설정 (로컬 모드)")
      pushSaveLog("저장 실패: Supabase 환경변수 미설정")
      return
    }

    setIsSaving(true)
    setSyncStatus("Supabase 저장 중...")
    pushSaveLog("수동 저장 시작")

    try {
      await supabaseRequest("golden_assets", { method: "DELETE", query: "id=gt.0" })
      await supabaseRequest("golden_sold_history", { method: "DELETE", query: "id=gt.0" })

      if (assets.length > 0) {
        await supabaseRequest("golden_assets", { method: "POST", body: assets.map(toAssetRow) })
      }
      if (soldHistory.length > 0) {
        await supabaseRequest("golden_sold_history", { method: "POST", body: soldHistory.map(toSoldRow) })
      }

      setSyncStatus("Supabase 저장 완료")
      pushSaveLog(`저장 완료: 자산 ${assets.length}건, 매도이력 ${soldHistory.length}건`)
    } catch (error) {
      console.error(error)
      setSyncStatus("Supabase 저장 실패")
      pushSaveLog("저장 실패: RLS/테이블/키 설정 확인 필요")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSell = async (soldAsset) => {
    const assetIdx = assets.findIndex(
      (a) => a.ticker === soldAsset.ticker && a.owner === soldAsset.owner
    )
    if (assetIdx === -1) return

    const target = assets[assetIdx]
    const remainQty = target.quantity - soldAsset.quantity

    setSoldHistory((prev) => [...prev, soldAsset])
    setAssets((prev) => {
      if (remainQty <= 0) return prev.filter((_, i) => i !== assetIdx)
      return prev.map((item, i) => (i === assetIdx ? { ...item, quantity: remainQty } : item))
    })

    if (!hasSupabaseConfig) return

    try {
      await supabaseRequest("golden_sold_history", { method: "POST", body: toSoldRow(soldAsset) })
      if (remainQty <= 0) {
        await supabaseRequest("golden_assets", {
          method: "DELETE",
          query: `owner=eq.${encodeURIComponent(soldAsset.owner)}&ticker=eq.${encodeURIComponent(soldAsset.ticker)}`,
        })
      } else {
        await supabaseRequest("golden_assets", {
          method: "PATCH",
          query: `owner=eq.${encodeURIComponent(soldAsset.owner)}&ticker=eq.${encodeURIComponent(soldAsset.ticker)}`,
          body: { quantity: remainQty },
        })
      }
      setSyncStatus("Supabase 동기화 완료")
    } catch (error) {
      console.error(error)
      setSyncStatus("Supabase 동기화 실패 (재시도 필요)")
    }
  }

  const handleAddAsset = async (asset) => {
    setAssets((prev) => [...prev, asset])
    if (!hasSupabaseConfig) return
    try {
      await supabaseRequest("golden_assets", { method: "POST", body: toAssetRow(asset) })
      setSyncStatus("Supabase 동기화 완료")
    } catch (error) {
      console.error(error)
      setSyncStatus("Supabase 동기화 실패 (재시도 필요)")
    }
  }

  const handleEditAsset = async (updated) => {
    setAssets((prev) => prev.map((a) =>
      a.owner === updated.owner && a.ticker === updated.ticker ? updated : a
    ))
    if (!hasSupabaseConfig) return
    try {
      await supabaseRequest("golden_assets", {
        method: "PATCH",
        query: `owner=eq.${encodeURIComponent(updated.owner)}&ticker=eq.${encodeURIComponent(updated.ticker)}`,
        body: { quantity: updated.quantity, avg_price: updated.avgPrice, leverage: updated.leverage ?? 1 },
      })
      setSyncStatus("수정 완료")
    } catch (error) {
      console.error(error)
      setSyncStatus("수정 실패 (재시도 필요)")
    }
  }

  const handleBitgetSync = async () => {
    setIsBitgetSyncing(true)
    setBitgetStatus("동기화 중...")
    pushSaveLog("Bitget 동기화 시작")

    try {
      // 1. 실시간 가격 조회 (공개 API)
      const pricesRes = await fetch("/api/bitget/prices")
      const pricesData = await pricesRes.json()
      if (!pricesRes.ok) throw new Error(pricesData.error || "가격 조회 실패")

      // 암호화폐 현재가 업데이트 (USDT → KRW)
      setAssets((prev) =>
        prev.map((asset) => {
          if (asset.marketType === "crypto" && pricesData.prices[asset.ticker] !== undefined) {
            // crypto currentPrice는 USD(USDT) 기준으로 저장
            return { ...asset, currentPrice: pricesData.prices[asset.ticker] }
          }
          return asset
        })
      )
      pushSaveLog(`가격 업데이트: ${Object.keys(pricesData.prices).length}개 코인`)

      // 2. 잔고 조회 (인증 API)
      const holdingsRes = await fetch("/api/bitget/holdings")
      const holdingsData = await holdingsRes.json()
      if (!holdingsRes.ok) throw new Error(holdingsData.error || "잔고 조회 실패")

      const enriched = (holdingsData.holdings || [])
        .map((h: any) => ({
          ...h,
          usdtPrice: pricesData.prices[h.ticker] || 0,
          krwValue: Math.round((pricesData.prices[h.ticker] || 0) * h.total * exchangeRate),
        }))
        .filter((h: any) => h.krwValue >= 1000) // 1,000원 미만 dust 제거
      setBitgetHoldings(enriched)
      setBitgetUsdtBalance(holdingsData.usdtBalance || 0)

      const time = new Date().toLocaleTimeString("ko-KR", { hour12: false })
      setBitgetStatus(`동기화 완료 ${time}`)
      pushSaveLog(`Bitget 잔고 ${holdingsData.holdings?.length || 0}개 코인`)
    } catch (error: any) {
      setBitgetStatus(`실패: ${error.message}`)
      pushSaveLog(`Bitget 동기화 실패: ${error.message}`)
    } finally {
      setIsBitgetSyncing(false)
    }
  }


  // Asset table with avgPrice column + monetary PnL + 매도 button
  const renderAssetTable = (items) => (
    <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 3px" }}>
      <thead>
        <tr style={{ fontSize: 11, color: S.textMuted }}>
          <td style={{ padding: "6px 10px" }}>종목</td>
          <td style={{ padding: "6px 10px" }}>보유자</td>
          <td style={{ padding: "6px 10px", textAlign: "right" }}>평단가</td>
          <td style={{ padding: "6px 10px", textAlign: "right" }}>현재가</td>
          <td style={{ padding: "6px 10px", textAlign: "right" }}>평가금액</td>
          <td style={{ padding: "6px 10px", textAlign: "right" }}>수익률</td>
          <td style={{ padding: "6px 10px", textAlign: "right" }}>손익금액</td>
          <td style={{ padding: "6px 8px", textAlign: "center", width: 52 }}></td>
        </tr>
      </thead>
      <tbody>
        {items.map((a, i) => {
          const isUs = a.marketType === "us"
          const isCrypto = a.marketType === "crypto"
          const isUsd = isUs || isCrypto  // USD 기준 자산
          const pnlKrw = isUsd ? a.pnl * exchangeRate : a.pnl
          return (
            <tr key={i} style={{ background: "rgba(255,255,255,0.35)", borderRadius: 10 }}>
              <td style={{ padding: "10px 10px", borderRadius: "10px 0 0 10px" }}>
                <div style={{ fontSize: 13, color: S.textPrimary, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                  {a.name}
                  {a.marketType === "crypto" && a.leverage > 1 && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 4, background: "rgba(230,57,70,0.12)", color: "#e63946", fontFamily: "'JetBrains Mono',monospace" }}>
                      {a.leverage}×
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: S.textMuted, fontFamily: "'JetBrains Mono',monospace" }}>
                  {a.ticker} · {a.quantity}{a.marketType === "crypto" ? "" : "주"}
                </div>
              </td>
              <td style={{ padding: "10px" }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                  background: a.owner === "용" ? "rgba(212,175,55,0.12)" : "rgba(30,136,229,0.12)",
                  color: a.owner === "용" ? "#d4af37" : "#1e88e5",
                }}>
                  {a.owner}
                </span>
              </td>
              {/* 평단가 */}
              <td style={{ padding: "10px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: S.textMuted }}>
                {isUsd ? `$${a.avgPrice.toLocaleString()}` : `${a.avgPrice.toLocaleString()}원`}
              </td>
              {/* 현재가 */}
              <td style={{ padding: "10px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: S.textSecondary }}>
                {isUsd ? `$${a.currentPrice.toLocaleString()}` : `${a.currentPrice.toLocaleString()}원`}
              </td>
              {/* 평가금액 (USD) */}
              <td style={{ padding: "10px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: S.textPrimary, fontWeight: 600 }}>
                {isUsd ? fmtU(a.value) : `${fmt(a.value)}원`}
              </td>
              {/* 수익률 */}
              <td style={{ padding: "10px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700, color: a.pnlPct >= 0 ? S.profit : S.loss }}>
                {a.pnlPct >= 0 ? "+" : ""}{a.pnlPct.toFixed(1)}%
              </td>
              {/* 손익금액 (원화) */}
              <td style={{ padding: "10px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 600, color: pnlKrw >= 0 ? S.profit : S.loss, borderRadius: "0 10px 10px 0" }}>
                {pnlKrw >= 0 ? "+" : ""}{fmt(pnlKrw)}원
              </td>
              {/* 수정/매도 버튼 */}
              <td style={{ padding: "4px 8px", textAlign: "center" }}>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    onClick={() => setEditTarget(a)}
                    style={{
                      ...S.btn, padding: "4px 8px", fontSize: 11, fontWeight: 700,
                      color: S.accent, border: "1px solid rgba(37,99,235,0.2)",
                      boxShadow: "2px 2px 6px rgba(37,99,235,0.08), -1px -1px 4px rgba(255,255,255,0.7)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = S.accentGrad; e.currentTarget.style.color = "#fff" }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = S.btn.background; e.currentTarget.style.color = S.accent }}
                  >
                    수정
                  </button>
                  <button
                    onClick={() => setSellTarget(a)}
                    style={{
                      ...S.btn, padding: "4px 8px", fontSize: 11, fontWeight: 700,
                      color: "#c0392b", border: "1px solid rgba(192,57,43,0.2)",
                      boxShadow: "2px 2px 6px rgba(192,57,43,0.1), -1px -1px 4px rgba(255,255,255,0.7)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "linear-gradient(135deg, #c0392b, #e74c3c)"; e.currentTarget.style.color = "#fff" }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = S.btn.background; e.currentTarget.style.color = "#c0392b" }}
                  >
                    매도
                  </button>
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )

  const tabs = selectedUser !== "전체"
    ? [
        ["kr", "🇰🇷 국내주식"],
        ["us", "🇺🇸 해외주식"],
        ["crypto", "🪙 암호화폐"],
        ["insights", "리포트"],
      ]
    : [
        ["dashboard", "통합 대시보드"],
        ["kr", "🇰🇷 국내주식"],
        ["us", "🇺🇸 해외주식"],
        ["crypto", "🪙 암호화폐"],
        ["insights", "리포트"],
      ];

  const filteredSoldHistory = selectedUser === "전체"
    ? soldHistory
    : soldHistory.filter((item) => item.owner === selectedUser)

  // Total realized PnL from sold history
  const totalRealizedPnl = filteredSoldHistory.reduce((s, a) => {
    const pnl = a.realizedPnl
    if (a.marketType === "us") return s + pnl * exchangeRate
    return s + pnl
  }, 0)

  return (
    <div
      style={{
        minHeight: "100vh",
        background: S.bg,
        color: S.textPrimary,
        fontFamily: "var(--font-apple)",
        padding: "16px",
        maxWidth: 1000,
        margin: "0 auto",
      }}
    >
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(17,45,78,0.25); border-radius:3px; }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
      `}</style>

      {/* User Selection Buttons */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 20 }}>
        <button
          onClick={handleSyncAll}
          disabled={isRefreshingPrices || isImportingBitget}
          style={{
            ...((isRefreshingPrices || isImportingBitget) ? { ...S.btn, ...S.btnPress, color: S.textMuted } : { ...S.btn, color: S.accent }),
            padding: "8px 14px",
            fontSize: 13,
            fontWeight: 700,
            cursor: (isRefreshingPrices || isImportingBitget) ? "wait" : "pointer",
          }}
        >
          {(isRefreshingPrices || isImportingBitget) ? "동기화 중..." : "🔄 통합 동기화"}
        </button>
        {["전체", "용", "령"].map((user) => (
          <button
            key={user}
            onClick={() => {
              if (user === "전체") {
                setSelectedUser("전체")
                setTab("dashboard")
                return
              }
              setSelectedUser(user as "용" | "령")
              setTab("kr")
            }}
            style={{
              ...(selectedUser === user ? { ...S.btn, ...S.btnPress, color: S.accent } : S.btn),
              padding: "8px 16px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {user}
          </button>
        ))}
      </div>



      {/* ═══ TABS ═══ */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, justifyContent: "center", flexWrap: "wrap" }}>
        {tabs.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              ...(tab === key
                ? { ...S.btn, ...S.btnPress, color: S.accent, border: `1px solid rgba(63,114,175,0.25)` }
                : { ...S.btn, color: S.textSecondary }),
              padding: "9px 18px", fontSize: 12, fontWeight: 600,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ═══════════ DASHBOARD TAB ═══════════ */}
      {tab === "dashboard" && (
        <div>
          {/* Goal Tracker */}
          <div style={{ ...S.card, padding: 24, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 12, color: S.textMuted, marginBottom: 2 }}>🎯 {goalLabel}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ ...goldText, fontSize: 30, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace" }}>{fmt(grandTotal)}원</span>
                  <span style={{ fontSize: 13, color: S.textMuted }}>/ {fmt(goalAmount)}</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ ...goldText, fontSize: 26, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace" }}>{goalPct.toFixed(1)}%</div>
                <div style={{ fontSize: 11, color: S.textMuted }}>달성률</div>
              </div>
            </div>
            <div style={{ ...S.inset, padding: 4, height: 24, position: "relative", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 10, background: S.accentGrad, width: `${goalPct}%`, transition: "width 1.5s cubic-bezier(0.4,0,0.2,1)", boxShadow: "0 0 16px rgba(160,128,80,0.3)" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: S.textMuted }}>
              <span>남은 금액: {fmt(Math.max(goalAmount - grandTotal, 0))}</span>
              <span>월 필요액(24개월): {fmt(Math.max((goalAmount - grandTotal) / 24, 0))}</span>
            </div>
          </div>

          {/* 용 & 령 Summary */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[["용", "🐉", "#8b7355"], ["령", "🐲", "#6b83a8"]].map(([name, emoji, color]) => {
              const pnl = ownerPnl(name)
              const total = ownerTotal(name)
              return (
                <div key={name} style={{ ...S.card, padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${color}, ${color}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{emoji}</div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: S.textPrimary }}>{name}</div>
                      <div style={{ fontSize: 11, color: S.textMuted }}>{byOwner(name).length}개 종목</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: S.textPrimary, fontFamily: "'JetBrains Mono',monospace", marginBottom: 4 }}>{fmt(total)}원</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: pnl >= 0 ? S.profit : S.loss, fontFamily: "'JetBrains Mono',monospace" }}>
                    {pnl >= 0 ? "+" : ""}{fmt(pnl)} ({((total / (total - pnl) - 1) * 100).toFixed(1)}%)
                  </div>
                </div>
              )
            })}
          </div>

          {/* Charts Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div style={{ ...S.card, padding: 20 }}>
              <div style={{ fontSize: 12, color: S.textMuted, marginBottom: 14 }}>기여도 (용 vs 령)</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 100, height: 100 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={contribData} innerRadius={30} outerRadius={48} paddingAngle={3} dataKey="value">
                        {contribData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ flex: 1 }}>
                  {contribData.map((d, i) => (
                    <div key={i} style={{ marginBottom: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                        <span style={{ color: d.color, fontWeight: 600 }}>{d.name}</span>
                        <span style={{ color: S.textMuted, fontFamily: "'JetBrains Mono',monospace" }}>{((d.value / grandTotal) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ ...S.card, padding: 20 }}>
              <div style={{ fontSize: 12, color: S.textMuted, marginBottom: 14 }}>자산 배분</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 100, height: 100 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={allocationData} innerRadius={30} outerRadius={48} paddingAngle={3} dataKey="value">
                        {allocationData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ flex: 1 }}>
                  {allocationData.map((d, i) => (
                    <div key={i} style={{ marginBottom: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                        <span style={{ color: d.color, fontWeight: 600 }}>{d.name}</span>
                        <span style={{ color: S.textMuted, fontFamily: "'JetBrains Mono',monospace" }}>{((d.value / grandTotal) * 100).toFixed(1)}%</span>
                      </div>
                      <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono',monospace", color: S.textSecondary }}>{fmt(d.value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* History Chart */}
          <div style={{ ...S.card, padding: 24, marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: S.textMuted, marginBottom: 14 }}>자산 추이 (12개월)</div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={S.accent} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={S.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: S.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ ...S.glass, background: "#f5f6fa", fontSize: 12, color: S.textPrimary, border: `1px solid ${S.accentLight}` }} formatter={(v) => [fmt(v) + "원", ""]} />
                <Area type="monotone" dataKey="total" stroke={S.accent} strokeWidth={2} fill="url(#tGrad)" />
                <Area type="monotone" dataKey="용" stroke="#8b7355" strokeWidth={1} strokeDasharray="4 4" fill="none" opacity={0.5} />
                <Area type="monotone" dataKey="령" stroke="#6b83a8" strokeWidth={1} strokeDasharray="4 4" fill="none" opacity={0.5} />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 8 }}>
              {[["합계", S.accent, "━"], ["용", "#8b7355", "┄"], ["령", "#6b83a8", "┄"]].map(([l, c, dash]) => (
                <span key={l} style={{ fontSize: 11, color: S.textMuted }}><span style={{ color: c }}>{dash}</span> {l}</span>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {[
              ["총 투자원금", fmt(totalCost) + "원", S.textPrimary],
              ["총 평가손익", `${totalPnl >= 0 ? "+" : ""}${fmt(totalPnl)}`, totalPnl >= 0 ? S.profit : S.loss],
              ["총 수익률", `${((grandTotal / totalCost - 1) * 100).toFixed(1)}%`, totalPnl >= 0 ? S.profit : S.loss],
            ].map(([l, v, c], i) => (
              <div key={i} style={{ ...S.card, padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: S.textMuted, marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: c, fontFamily: "'JetBrains Mono',monospace" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════ MARKET CATEGORY TABS ═══════════ */}
      {["kr", "us", "crypto"].includes(tab) && (
        <div>
          <div style={{ ...S.card, padding: 24, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: S.textPrimary }}>
                  {tab === "kr" ? "🇰🇷 국내주식" : tab === "us" ? "🇺🇸 해외주식" : "🪙 암호화폐"}
                </div>
                <div style={{ fontSize: 12, color: S.textMuted }}>
                  {byMarket(tab).length}개 종목 · 총 {fmt(marketTotal(tab) + cashTotal(tab))}원
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setShowAdd({ owner: selectedUser === "전체" ? null : selectedUser, cashFor: tab })}
                  style={{ ...S.btn, padding: "8px 14px", fontSize: 13, color: "#22c55e", fontWeight: 600, border: "1px solid rgba(34,197,94,0.3)" }}
                >
                  + 현금
                </button>
                <button
                  onClick={() => setShowAdd({ owner: selectedUser === "전체" ? null : selectedUser, market: tab })}
                  style={{ ...S.btn, padding: "8px 16px", fontSize: 13, color: S.accent, fontWeight: 600 }}
                >
                  + 매수
                </button>
              </div>
            </div>

            {/* Market summary */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
              {(() => {
                const items = byMarket(tab)
                // 평가손익: crypto는 pnl(USD) * 환율, 나머지는 krwValue - krwCost
                const mktPnl = items.reduce((s, a) => {
                  const pnlKrw = a.marketType === "crypto"
                    ? a.pnl * exchangeRate
                    : (a.marketType === "us" ? a.pnl * exchangeRate : a.pnl)
                  return s + pnlKrw
                }, 0)
                const mktCost = items.reduce((s, a) => s + a.krwCost, 0)
                // 평가금액 = 종목 합계 + 현금 합계
                const totalWithCash = marketTotal(tab) + cashTotal(tab)
                const pct = mktCost > 0 ? (mktPnl / mktCost) * 100 : 0
                const isUsdTab = tab === "us" || tab === "crypto"
                const usdTotal = isUsdTab ? (totalWithCash / exchangeRate) : 0
                const usdPnl = isUsdTab ? (mktPnl / exchangeRate) : 0
                return [
                  ["평가금액", isUsdTab ? fmtU(usdTotal) : fmt(totalWithCash) + "원", S.textPrimary, isUsdTab ? `≈ ${fmt(totalWithCash)}원` : null],
                  ["평가손익", isUsdTab ? `${usdPnl >= 0 ? "+" : "-"}${fmtU(Math.abs(usdPnl))}` : `${mktPnl >= 0 ? "+" : ""}${fmt(mktPnl)}원`, mktPnl >= 0 ? S.profit : S.loss, isUsdTab ? `≈ ${mktPnl >= 0 ? "+" : ""}${fmt(mktPnl)}원` : null],
                  ["수익률", `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`, mktPnl >= 0 ? S.profit : S.loss, null],
                ].map(([l, v, c, sub], i) => (
                  <div key={i} style={{ ...S.inset, padding: 12, textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: S.textMuted, marginBottom: 3 }}>{l}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: c, fontFamily: "'JetBrains Mono',monospace" }}>{v}</div>
                    {sub && <div style={{ fontSize: 11, color: S.textMuted, marginTop: 2, fontFamily: "'JetBrains Mono',monospace" }}>{sub}</div>}
                  </div>
                ))
              })()}
            </div>

            {/* Asset table with scrollable wrapper */}
            <div style={{ overflowX: "auto" }}>{renderAssetTable(byMarket(tab))}</div>

            {/* 현금 섹션 */}
            {cashByTab(tab).length > 0 && (
              <div style={{ marginTop: 16, borderTop: "1px solid rgba(226,232,240,0.6)", paddingTop: 14 }}>
                <div style={{ fontSize: 12, color: "#22c55e", fontWeight: 600, marginBottom: 8 }}>💵 현금</div>
                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 3px" }}>
                  <tbody>
                    {cashByTab(tab).map((a, i) => {
                      const isUsdCash = a.ticker !== "KRW"
                      return (
                        <tr key={i} style={{ background: "rgba(34,197,94,0.05)", borderRadius: 10 }}>
                          <td style={{ padding: "8px 10px", borderRadius: "10px 0 0 10px", fontSize: 13, color: S.textPrimary, fontWeight: 600 }}>
                            {a.name}
                          </td>
                          <td style={{ padding: "8px 10px" }}>
                            <span style={{
                              fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                              background: a.owner === "용" ? "rgba(212,175,55,0.12)" : "rgba(30,136,229,0.12)",
                              color: a.owner === "용" ? "#d4af37" : "#1e88e5",
                            }}>
                              {a.owner}
                            </span>
                          </td>
                          <td style={{ padding: "8px 10px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700, color: S.textPrimary }}>
                            {isUsdCash ? `${a.ticker} ${a.quantity.toLocaleString()}` : `${fmt(a.quantity)}원`}
                          </td>
                          <td style={{ padding: "8px 10px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: S.textMuted }}>
                            {isUsdCash ? `≈ ${fmt(a.krwValue)}원` : ""}
                          </td>
                          <td style={{ padding: "4px 8px", textAlign: "center", borderRadius: "0 10px 10px 0" }}>
                            <div style={{ display: "flex", gap: 4 }}>
                              <button
                                onClick={() => setEditTarget(a)}
                                style={{
                                  ...S.btn, padding: "4px 8px", fontSize: 11, fontWeight: 700,
                                  color: S.accent, border: "1px solid rgba(37,99,235,0.2)",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = S.accentGrad; e.currentTarget.style.color = "#fff" }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = S.btn.background; e.currentTarget.style.color = S.accent }}
                              >
                                수정
                              </button>
                              <button
                                onClick={() => setSellTarget(a)}
                                style={{
                                  ...S.btn, padding: "4px 8px", fontSize: 11, fontWeight: 700,
                                  color: "#c0392b", border: "1px solid rgba(192,57,43,0.2)",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "linear-gradient(135deg, #c0392b, #e74c3c)"; e.currentTarget.style.color = "#fff" }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = S.btn.background; e.currentTarget.style.color = "#c0392b" }}
                              >
                                삭제
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Bitget 잔고 카드 - 암호화폐 탭에서만 표시 */}
          {tab === "crypto" && bitgetHoldings.length > 0 && (
            <div style={{ ...S.card, padding: 24, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: S.textPrimary }}>⚡ Bitget 잔고</div>
                  <div style={{ fontSize: 11, color: S.textMuted, marginTop: 2 }}>{bitgetStatus}</div>
                </div>
                {bitgetUsdtBalance > 0 && (
                  <div style={{ ...S.inset, padding: "6px 12px", fontSize: 12, fontFamily: "'JetBrains Mono',monospace", color: S.textSecondary }}>
                    USDT {bitgetUsdtBalance.toFixed(2)}
                  </div>
                )}
              </div>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 3px" }}>
                <thead>
                  <tr style={{ fontSize: 11, color: S.textMuted }}>
                    <td style={{ padding: "6px 10px" }}>코인</td>
                    <td style={{ padding: "6px 10px", textAlign: "right" }}>보유량</td>
                    <td style={{ padding: "6px 10px", textAlign: "right" }}>현재가 (USDT)</td>
                    <td style={{ padding: "6px 10px", textAlign: "right" }}>평가금액 (KRW)</td>
                  </tr>
                </thead>
                <tbody>
                  {bitgetHoldings.map((h, i) => (
                    <tr key={i} style={{ background: "rgba(255,255,255,0.35)", borderRadius: 10 }}>
                      <td style={{ padding: "10px 10px", borderRadius: "10px 0 0 10px" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: S.textPrimary, fontFamily: "'JetBrains Mono',monospace" }}>
                          {h.ticker}
                        </span>
                      </td>
                      <td style={{ padding: "10px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: S.textSecondary }}>
                        {h.total.toLocaleString(undefined, { maximumSignificantDigits: 8 })}
                      </td>
                      <td style={{ padding: "10px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: S.textMuted }}>
                        ${(h.usdtPrice || 0).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                      </td>
                      <td style={{ padding: "10px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 600, color: S.textPrimary, borderRadius: "0 10px 10px 0" }}>
                        {fmt(h.krwValue || 0)}원
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* ═══════════ INSIGHTS TAB ═══════════ */}
      {tab === "insights" && (
        <div>
          {/* Weekly Review */}
          <div style={{ marginBottom: 16 }}>
            <WeeklyReview evaluated={evaluated} grandTotal={grandTotal} />
          </div>

          {/* Top Performers */}
          <div style={{ ...S.card, padding: 24, marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: S.textMuted, marginBottom: 16, fontWeight: 600 }}>🏆 수익률 랭킹</div>
            {[...evaluated]
              .sort((a, b) => b.pnlPct - a.pnlPct)
              .slice(0, 6)
              .map((a, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 5 ? "1px solid rgba(180,185,200,0.15)" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ ...goldText, fontSize: 16, fontWeight: 800, width: 22 }}>{i + 1}</span>
                    <div>
                      <div style={{ fontSize: 13, color: S.textPrimary, fontWeight: 600 }}>{a.name}</div>
                      <div style={{ fontSize: 11, color: S.textMuted }}>{a.ticker} · {a.owner === "용" ? "🐉" : "🐲"} {a.owner}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: a.pnlPct >= 0 ? S.profit : S.loss, fontFamily: "'JetBrains Mono',monospace" }}>
                      {a.pnlPct >= 0 ? "+" : ""}{a.pnlPct.toFixed(1)}%
                    </div>
                    <div style={{ fontSize: 11, color: S.textMuted }}>{a.marketType === "us" ? fmtU(a.pnl) : fmt(a.pnl)}</div>
                  </div>
                </div>
              ))}
          </div>

          {/* ═══ 매도 이력 (Sell History) ═══ */}
          <div style={{ ...S.card, padding: 24, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: S.textMuted, fontWeight: 600 }}>📤 매도 이력</div>
              {filteredSoldHistory.length > 0 && (
                <div style={{ ...S.inset, padding: "4px 12px", fontSize: 12, fontFamily: "'JetBrains Mono',monospace", color: totalRealizedPnl >= 0 ? S.profit : S.loss, fontWeight: 700 }}>
                  실현손익 합계: {totalRealizedPnl >= 0 ? "+" : ""}{fmt(totalRealizedPnl)}원
                </div>
              )}
            </div>

            {filteredSoldHistory.length === 0 ? (
              <div style={{ textAlign: "center", color: S.textMuted, padding: "24px 0", fontSize: 13 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
                {selectedUser === "전체" ? "아직 매도한 종목이 없습니다" : "해당 사용자의 매도 이력이 없습니다"}
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 4px" }}>
                <thead>
                  <tr style={{ fontSize: 11, color: S.textMuted }}>
                    <td style={{ padding: "4px 10px" }}>종목</td>
                    <td style={{ padding: "4px 10px" }}>보유자</td>
                    <td style={{ padding: "4px 10px", textAlign: "right" }}>평단가</td>
                    <td style={{ padding: "4px 10px", textAlign: "right" }}>매도가</td>
                    <td style={{ padding: "4px 10px", textAlign: "right" }}>수량</td>
                    <td style={{ padding: "4px 10px", textAlign: "right" }}>실현손익</td>
                    <td style={{ padding: "4px 10px", textAlign: "right" }}>수익률</td>
                    <td style={{ padding: "4px 10px", textAlign: "right" }}>매도일</td>
                  </tr>
                </thead>
                <tbody>
                  {[...filteredSoldHistory].reverse().map((a, i) => {
                    const isUs = a.marketType === "us"
                    const pnlKrw = isUs ? a.realizedPnl * exchangeRate : a.realizedPnl
                    return (
                      <tr key={i} style={{ background: "rgba(255,255,255,0.3)" }}>
                        <td style={{ padding: "10px 10px", borderRadius: "10px 0 0 10px" }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: S.textPrimary }}>{a.name}</div>
                          <div style={{ fontSize: 11, color: S.textMuted, fontFamily: "'JetBrains Mono',monospace" }}>{a.ticker}</div>
                        </td>
                        <td style={{ padding: "10px" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: a.owner === "용" ? "rgba(212,175,55,0.12)" : "rgba(30,136,229,0.12)", color: a.owner === "용" ? "#d4af37" : "#1e88e5" }}>
                            {a.owner}
                          </span>
                        </td>
                        <td style={{ padding: "10px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: S.textMuted }}>
                          {isUs ? `$${a.avgPrice.toLocaleString()}` : `${a.avgPrice.toLocaleString()}`}
                        </td>
                        <td style={{ padding: "10px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: S.textSecondary, fontWeight: 600 }}>
                          {isUs ? `$${a.sellPrice.toLocaleString()}` : `${a.sellPrice.toLocaleString()}`}
                        </td>
                        <td style={{ padding: "10px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: S.textMuted }}>
                          {a.quantity}{a.marketType === "crypto" ? "" : "주"}
                        </td>
                        <td style={{ padding: "10px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700, color: pnlKrw >= 0 ? S.profit : S.loss }}>
                          {pnlKrw >= 0 ? "+" : ""}{fmt(pnlKrw)}원
                        </td>
                        <td style={{ padding: "10px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700, color: a.realizedPnlPct >= 0 ? S.profit : S.loss }}>
                          {a.realizedPnlPct >= 0 ? "+" : ""}{a.realizedPnlPct.toFixed(1)}%
                        </td>
                        <td style={{ padding: "10px", textAlign: "right", fontSize: 11, color: S.textMuted, borderRadius: "0 10px 10px 0" }}>
                          {a.sellDate}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Dividend Calendar */}
          <div style={{ ...S.card, padding: 24, marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: S.textMuted, marginBottom: 16, fontWeight: 600 }}>📅 배당금 달력</div>
            <DividendCalendar assets={selectedUser === "전체" ? assets : assets.filter((a) => a.owner === selectedUser)} />
          </div>

          {/* Monthly P&L */}
          <div style={{ ...S.card, padding: 24, marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: S.textMuted, marginBottom: 14 }}>월별 손익 변동</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={historyData.map((d, i, a) => ({ month: d.month, pnl: i > 0 ? d.total - a[i - 1].total : 0 })).slice(1)}>
                <XAxis dataKey="month" tick={{ fill: S.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ ...S.glass, background: "#f5f6fa", fontSize: 12, color: S.textPrimary }} formatter={(v) => [fmt(v) + "원", "변동"]} />
                <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
                  {historyData.slice(1).map((d, i) => {
                    const pnl = i > 0 ? d.total - historyData[i].total : 0
                    return <Cell key={i} fill={pnl >= 0 ? "rgba(212,175,55,0.6)" : "rgba(30,136,229,0.6)"} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* API Status */}
          <div style={{ ...S.card, padding: 18 }}>
            <div style={{ fontSize: 12, color: S.textMuted, marginBottom: 10, fontWeight: 600 }}>🔌 API 연동 상태</div>
            {[
              ["Supabase", syncStatus, syncStatus.includes("실패") ? "#e63946" : "#3F72AF"],
              ["Bitget API", bitgetStatus, bitgetStatus.includes("실패") ? "#e63946" : bitgetStatus === "미연결" ? "#94a3b8" : "#f59e0b"],
              ["KIS 국내주식 API", "준비완료 (키 필요)", "#3F72AF"],
              ["Yahoo Finance / Alpha Vantage", "준비완료 (키 필요)", "#3F72AF"],
              ["CoinGecko 암호화폐", "준비완료 (무료)", "#3F72AF"],
              ["환율 API (open.er-api)", "준비완료 (무료)", "#3F72AF"],
            ].map(([name, status, color], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < 5 ? "1px solid rgba(180,185,200,0.15)" : "none" }}>
                <span style={{ fontSize: 12, color: S.textSecondary }}>{name}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color, padding: "2px 8px", background: "rgba(63,114,175,0.1)", borderRadius: 4 }}>{status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ 매수 MODAL ═══ */}
      {showAdd && (
        <AddAssetModal
          owner={showAdd.owner}
          defaultMarket={showAdd.cashFor ? "cash" : showAdd.market || null}
          cashFor={showAdd.cashFor || null}
          onAdd={handleAddAsset}
          onClose={() => setShowAdd(null)}
        />
      )}

      {/* ═══ 매도 MODAL ═══ */}
      {sellTarget && (
        <SellModal
          asset={sellTarget}
          onConfirm={handleSell}
          onClose={() => setSellTarget(null)}
        />
      )}

      {/* ═══ 수정 MODAL ═══ */}
      {editTarget && (
        <EditModal
          asset={editTarget}
          onConfirm={handleEditAsset}
          onClose={() => setEditTarget(null)}
        />
      )}

      {/* 토스트 로그 (30초 자동 소멸) */}
      {toastLogs.length > 0 && (
        <div style={{
          position: "fixed", right: 16, bottom: 64,
          zIndex: 1100, width: "min(340px, calc(100vw - 32px))",
          display: "flex", flexDirection: "column", gap: 6,
          pointerEvents: "none",
        }}>
          {toastLogs.map((l) => (
            <div key={l.id} style={{ ...S.glass, padding: "9px 13px", fontSize: 12, color: S.textPrimary, borderRadius: 12 }}>
              {l.msg}
            </div>
          ))}
        </div>
      )}

      {/* 로그 버튼 (항상 표시) */}
      <button
        onClick={() => setShowLogPanel((v) => !v)}
        style={{
          position: "fixed", right: 16, bottom: 16, zIndex: 1200,
          ...S.btn, padding: "8px 14px", fontSize: 12, fontWeight: 700,
          color: showLogPanel ? S.accent : S.textMuted,
          border: showLogPanel ? `1px solid ${S.accent}` : "1px solid rgba(226,232,240,0.9)",
        }}
      >
        📋 로그
      </button>

      {/* 로그 패널 */}
      {showLogPanel && (
        <div style={{
          position: "fixed", right: 16, bottom: 56, zIndex: 1150,
          width: "min(380px, calc(100vw - 32px))",
          ...S.glass, background: "rgba(249,247,247,0.97)",
          boxShadow: "0 8px 32px rgba(15,23,42,0.15)",
          borderRadius: 16, overflow: "hidden",
        }}>
          <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid rgba(180,185,200,0.25)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: S.textPrimary }}>📋 시스템 로그</span>
            <button onClick={() => setShowLogPanel(false)} style={{ background: "none", border: "none", color: S.textMuted, fontSize: 16, cursor: "pointer" }}>✕</button>
          </div>
          <div style={{ maxHeight: 280, overflowY: "auto", padding: "8px 12px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
            {saveLogs.length === 0
              ? <div style={{ textAlign: "center", color: S.textMuted, padding: 20, fontSize: 12 }}>로그가 없습니다</div>
              : saveLogs.map((log, idx) => (
                <div key={idx} style={{ fontSize: 11, color: idx === 0 ? S.textPrimary : S.textMuted, padding: "5px 8px", borderRadius: 8, background: idx === 0 ? "rgba(63,114,175,0.07)" : "transparent", fontFamily: "'JetBrains Mono',monospace" }}>
                  {log}
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* Footer */}

    </div>
  )
}
