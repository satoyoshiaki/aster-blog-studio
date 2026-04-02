import type {
  AdminLogRecord,
  AllowedDomainRecord,
  BlockedKeywordRecord,
  ExchangeRecord,
  ReportRecord,
  SubmissionRecord,
} from "@/types";

export const mockAllowedDomains: AllowedDomainRecord[] = [
  { id: "dmm", domain: "dmm.co.jp", note: "公式ストア", is_active: true, created_at: new Date().toISOString() },
  { id: "fanza", domain: "fanza.tv", note: "公式配信", is_active: true, created_at: new Date().toISOString() },
  { id: "mgstage", domain: "mgstage.com", note: "公式販売", is_active: true, created_at: new Date().toISOString() },
];

export const mockBlockedKeywords: BlockedKeywordRecord[] = [
  { id: "kw-1", keyword: "未成年", note: "minor", is_active: true, created_at: new Date().toISOString() },
  { id: "kw-2", keyword: "JC", note: "minor shorthand", is_active: true, created_at: new Date().toISOString() },
  { id: "kw-3", keyword: "盗撮", note: "voyeur", is_active: true, created_at: new Date().toISOString() },
  { id: "kw-4", keyword: "リベンジポルノ", note: "illegal", is_active: true, created_at: new Date().toISOString() },
];

export const mockSubmissions: SubmissionRecord[] = [
  {
    id: "sub-seed-1",
    source_url: "https://www.dmm.co.jp/digital/videoa/",
    normalized_url: "https://dmm.co.jp/digital/videoa/",
    source_domain: "dmm.co.jp",
    title: "静かな夜に合う匿名おすすめ 01",
    description: "世界のどこかの誰かが、落ち着いた雰囲気の作品として残した1本。",
    tags: ["ドラマ", "雰囲気重視"],
    thumbnail_url: null,
    status: "approved",
    moderation_reason: null,
    submitter_ip_hash: "seed",
    exchange_count: 1,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    approved_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: "sub-seed-2",
    source_url: "https://www.mgstage.com/",
    normalized_url: "https://mgstage.com/",
    source_domain: "mgstage.com",
    title: "静かな夜に合う匿名おすすめ 02",
    description: "匿名メモ付きで届く、ややフェティッシュ寄りの1本。",
    tags: ["フェティッシュ", "匿名レビュー"],
    thumbnail_url: null,
    status: "approved",
    moderation_reason: null,
    submitter_ip_hash: "seed",
    exchange_count: 2,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    approved_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
];

export const mockExchanges: ExchangeRecord[] = [
  {
    id: "exc-seed-1",
    submitted_submission_id: "sub-seed-1",
    received_submission_id: "sub-seed-2",
    submitter_ip_hash: "seed",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
];

export const mockReports: ReportRecord[] = [];
export const mockAdminLogs: AdminLogRecord[] = [];
