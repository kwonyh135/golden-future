# golden-future
투자 상황 공유 앱

## Supabase 연동
앱은 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 설정되면
`golden_assets`, `golden_sold_history` 테이블과 동기화합니다.

### 1) 환경변수
`.env.local`
```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### 2) 테이블 생성 SQL
```sql
create table if not exists public.golden_assets (
  id bigserial primary key,
  owner text not null,
  ticker text not null,
  name text not null,
  market_type text not null,
  quantity numeric not null,
  avg_price numeric not null,
  current_price numeric not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_golden_assets_owner_ticker
  on public.golden_assets(owner, ticker);

create table if not exists public.golden_sold_history (
  id bigserial primary key,
  owner text not null,
  ticker text not null,
  name text not null,
  market_type text not null,
  quantity numeric not null,
  avg_price numeric not null,
  sell_price numeric not null,
  realized_pnl numeric not null,
  realized_pnl_pct numeric not null,
  sell_date text not null,
  created_at timestamptz not null default now()
);
```

### 3) RLS(테스트용)
빠른 테스트를 위해서는 두 테이블의 RLS를 잠시 비활성화하거나,
anon role에 select/insert/update/delete 정책을 추가하세요.


## 실시간 시세 API 연동
앱은 `/api/market-prices` 서버 라우트를 통해 마켓별 현재가를 조회합니다.

- 코인(`crypto`): **Bitget** Spot/Futures 티커 API + 한투 실시간 환율(USD/KRW) 적용
- 한국 주식(`kr`): **한국투자증권 Open API** 현재가 조회
- 미국 주식(`us`): **Alpha Vantage** GLOBAL_QUOTE (평가금액 환산은 한투 환율 사용)

### 추가 환경변수
`.env.local`
```bash
# 한국투자증권
KIS_APP_KEY=<your-kis-app-key>
KIS_APP_SECRET=<your-kis-app-secret>
# 선택: 모의/실전 엔드포인트
KIS_BASE_URL=https://openapi.koreainvestment.com:9443

# 미국 주식
ALPHA_VANTAGE_API_KEY=<your-alpha-vantage-key>

# 코인(USDT 가격을 KRW 환산할 때 사용, 기본 1380)
BITGET_USDT_TO_KRW=1380

# Bitget 계정 연동(보유 종목 가져오기)
BITGET_API_KEY=<your-bitget-api-key>
BITGET_API_SECRET=<your-bitget-api-secret>
BITGET_API_PASSPHRASE=<your-bitget-passphrase>

```

> 참고: Bitget **계정 보유종목 자동 불러오기(spot/futures 포지션)** 는 private API 인증(키/서명)이 필요하며, 서버 환경변수(`BITGET_API_KEY`, `BITGET_API_SECRET`, `BITGET_API_PASSPHRASE`)에 설정해야 합니다.
> 현재 구현은 포트폴리오에 등록된 코인 티커의 현재가를 Bitget에서 즉시 조회해 반영합니다.
> 환율은 한투 API 응답에서 우선 조회하고, 실패 시 `BITGET_USDT_TO_KRW`(또는 `USDT_TO_KRW`) 값으로 폴백합니다.

## GitHub Actions 설정 (Environment Secrets)
`Repository > Settings > Environments`에서 `development`, `production` 환경을 만들고,
각 환경에 아래 secret을 동일한 이름으로 등록하세요.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

추가된 워크플로우 파일: `.github/workflows/ci.yml`
- PR 생성 시 빌드 검증
- `main` 푸시 시 `production` environment 사용
- `develop` 푸시 시 `development` environment 사용
- `workflow_dispatch` 실행 시 환경 선택 가능


## 패키지 매니저
이 프로젝트는 **npm 기반**으로 관리합니다.
- 의존성 설치: `npm install`
- 개발 서버: `npm run dev`
- 빌드: `npm run build`
