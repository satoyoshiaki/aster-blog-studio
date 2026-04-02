import type { Prisma } from "@prisma/client";

export type SubmissionStatus = "pending" | "approved" | "rejected";

export type SubmissionRecord = {
  id: string;
  source_url: string;
  normalized_url: string;
  source_domain: string;
  title: string;
  description: string | null;
  tags: string[];
  thumbnail_url: string | null;
  status: SubmissionStatus;
  moderation_reason: string | null;
  submitter_ip_hash: string;
  exchange_count: number;
  created_at: string;
  approved_at: string | null;
};

export type ExchangeRecord = {
  id: string;
  submitted_submission_id: string;
  received_submission_id: string | null;
  submitter_ip_hash: string;
  created_at: string;
};

export type ReportRecord = {
  id: string;
  exchange_id: string | null;
  submission_id: string | null;
  reason: string;
  details: string | null;
  reporter_ip_hash: string;
  created_at: string;
};

export type AllowedDomainRecord = {
  id: string;
  domain: string;
  note: string | null;
  is_active: boolean;
  created_at: string;
};

export type BlockedKeywordRecord = {
  id: string;
  keyword: string;
  note: string | null;
  is_active: boolean;
  created_at: string;
};

export type AdminLogRecord = {
  id: string;
  action: string;
  payload: Record<string, unknown>;
  created_at: string;
};

export type ExchangeWithSubmissions = ExchangeRecord & {
  submitted?: SubmissionRecord | null;
  received?: SubmissionRecord | null;
};

export type ProductFilters = {
  category?: string;
  search?: string;
  featured?: boolean;
};

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true;
    images: true;
    files: true;
    seller: true;
  };
}>;
