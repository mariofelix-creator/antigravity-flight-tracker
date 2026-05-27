-- MicroGuard — Seed Data for Development
-- Run: supabase db seed

-- ─── Sample campaigns ─────────────────────────────────────────────────────────
insert into campaigns (title, description, offer_type, asset_symbol, min_investment, max_return_pct, target_profiles, expires_at, is_active)
values
  (
    'Oportunidad del mes: S&P 500 ETF',
    'El índice más diversificado del mundo. Invierte en las 500 empresas más grandes de EE.UU. con solo $50.',
    'investment',
    'VOO',
    50.00,
    10.5,
    array['moderate','aggressive']::risk_profile[],
    now() + interval '7 days',
    true
  ),
  (
    'Estabilidad garantizada: Bono del Tesoro USA',
    'La inversión más segura del mercado. Respaldada por el gobierno de los Estados Unidos.',
    'investment',
    'GOVT',
    25.00,
    3.8,
    array['conservative','moderate']::risk_profile[],
    now() + interval '14 days',
    true
  ),
  (
    'Oro digital: SPDR Gold Shares',
    'El activo refugio por excelencia. El oro ha mantenido su valor durante siglos.',
    'investment',
    'GLD',
    50.00,
    7.8,
    array['conservative','moderate','aggressive']::risk_profile[],
    now() + interval '5 days',
    true
  );

-- Note: User-specific seed data (profiles, portfolios, investments) should be
-- created through the application signup flow to respect RLS policies.
-- For testing, create a user via Supabase Auth dashboard first.
