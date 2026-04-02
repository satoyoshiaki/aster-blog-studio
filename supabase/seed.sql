insert into allowed_domains (domain, note)
values
  ('dmm.co.jp', '公式ストア'),
  ('fanza.tv', '公式配信'),
  ('mgstage.com', '公式販売')
on conflict (domain) do update set note = excluded.note, is_active = true;

insert into blocked_keywords (keyword, note)
values
  ('未成年', 'minor'),
  ('JC', 'minor shorthand'),
  ('盗撮', 'illegal recording'),
  ('リベンジポルノ', 'illegal')
on conflict (keyword) do update set note = excluded.note, is_active = true;

insert into submissions (
  id,
  source_url,
  normalized_url,
  source_domain,
  title,
  description,
  tags,
  thumbnail_url,
  status,
  moderation_reason,
  submitter_ip_hash,
  exchange_count,
  created_at,
  approved_at
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'https://www.dmm.co.jp/digital/videoa/',
    'https://dmm.co.jp/digital/videoa/',
    'dmm.co.jp',
    '静かな夜に合う匿名おすすめ 01',
    '落ち着いたトーンで見られる一本。',
    array['ドラマ', '雰囲気重視'],
    null,
    'approved',
    null,
    'seed-ip',
    1,
    timezone('utc', now()) - interval '6 hour',
    timezone('utc', now()) - interval '6 hour'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'https://www.mgstage.com/',
    'https://mgstage.com/',
    'mgstage.com',
    '静かな夜に合う匿名おすすめ 02',
    '匿名メモ付きで届くフェティッシュ寄りの一本。',
    array['フェティッシュ', '匿名レビュー'],
    null,
    'approved',
    null,
    'seed-ip',
    2,
    timezone('utc', now()) - interval '4 hour',
    timezone('utc', now()) - interval '4 hour'
  )
on conflict (id) do nothing;

insert into exchanges (
  id,
  submitted_submission_id,
  received_submission_id,
  submitter_ip_hash,
  created_at
)
values
  (
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'seed-ip',
    timezone('utc', now()) - interval '3 hour'
  )
on conflict (id) do nothing;
