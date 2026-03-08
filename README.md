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
