import crypto from "crypto";

import { env, hasSupabaseEnv } from "@/lib/env";
import {
  mockAdminLogs,
  mockAllowedDomains,
  mockBlockedKeywords,
  mockExchanges,
  mockReports,
  mockSubmissions,
} from "@/lib/mock-data";
import type {
  AllowedDomainRecord,
  BlockedKeywordRecord,
  ExchangeRecord,
  ExchangeWithSubmissions,
  ReportRecord,
  SubmissionRecord,
  SubmissionStatus,
} from "@/types";

export type PaginatedSubmissions = {
  items: SubmissionRecord[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

async function supabaseFetch<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${env.supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: env.supabaseServiceRoleKey,
      Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Supabase request failed.");
  }

  if (response.status === 204) {
    return [] as T;
  }

  return (await response.json()) as T;
}

async function supabaseCount(path: string) {
  const response = await fetch(`${env.supabaseUrl}/rest/v1/${path}`, {
    method: "HEAD",
    headers: {
      apikey: env.supabaseServiceRoleKey,
      Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
      Prefer: "count=exact",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Supabase count request failed.");
  }

  const range = response.headers.get("content-range");
  const total = range?.split("/")[1];
  return total ? Number(total) : 0;
}

function hydrateExchange(exchange: ExchangeRecord): ExchangeWithSubmissions {
  return {
    ...exchange,
    submitted: mockSubmissions.find((item) => item.id === exchange.submitted_submission_id) ?? null,
    received: mockSubmissions.find((item) => item.id === exchange.received_submission_id) ?? null,
  };
}

export async function listAllowedDomains() {
  if (!hasSupabaseEnv()) {
    return mockAllowedDomains.filter((item) => item.is_active);
  }

  return supabaseFetch<AllowedDomainRecord[]>(
    "allowed_domains?select=*&is_active=eq.true&order=domain.asc",
  );
}

export async function listBlockedKeywords() {
  if (!hasSupabaseEnv()) {
    return mockBlockedKeywords.filter((item) => item.is_active);
  }

  return supabaseFetch<BlockedKeywordRecord[]>(
    "blocked_keywords?select=*&is_active=eq.true&order=keyword.asc",
  );
}

export async function insertSubmission(
  input: Omit<SubmissionRecord, "id" | "created_at" | "approved_at" | "exchange_count"> & {
    approved_at?: string | null;
  },
) {
  const now = new Date().toISOString();

  if (!hasSupabaseEnv()) {
    const record: SubmissionRecord = {
      ...input,
      id: createId("sub"),
      created_at: now,
      approved_at: input.approved_at ?? null,
      exchange_count: 0,
    };
    mockSubmissions.unshift(record);
    return record;
  }

  const [record] = await supabaseFetch<SubmissionRecord[]>("submissions", {
    method: "POST",
    body: JSON.stringify([
      {
        ...input,
        approved_at: input.approved_at ?? null,
      },
    ]),
  });

  return record;
}

export async function pickRandomApprovedSubmission(excludeSubmissionId: string) {
  if (!hasSupabaseEnv()) {
    const pool = mockSubmissions.filter(
      (item) => item.status === "approved" && item.id !== excludeSubmissionId,
    );
    return pool[Math.floor(Math.random() * pool.length)] ?? null;
  }

  const records = await supabaseFetch<SubmissionRecord[]>(
    `submissions?select=*&status=eq.approved&id=neq.${excludeSubmissionId}&limit=100&order=approved_at.desc.nullslast`,
  );

  if (records.length === 0) {
    return null;
  }

  return records[Math.floor(Math.random() * records.length)] ?? null;
}

export async function insertExchange(input: Omit<ExchangeRecord, "id" | "created_at">) {
  const now = new Date().toISOString();

  if (!hasSupabaseEnv()) {
    const record: ExchangeRecord = {
      ...input,
      id: createId("exc"),
      created_at: now,
    };
    mockExchanges.unshift(record);

    const received = mockSubmissions.find((item) => item.id === input.received_submission_id);
    if (received) {
      received.exchange_count += 1;
    }

    return hydrateExchange(record);
  }

  const [record] = await supabaseFetch<ExchangeRecord[]>("exchanges", {
    method: "POST",
    body: JSON.stringify([input]),
  });

  return getExchangeById(record.id);
}

export async function getExchangeById(id: string) {
  if (!hasSupabaseEnv()) {
    const exchange = mockExchanges.find((item) => item.id === id);
    return exchange ? hydrateExchange(exchange) : null;
  }

  const [exchange] = await supabaseFetch<ExchangeWithSubmissions[]>(
    `exchanges?select=*,submitted:submitted_submission_id(*),received:received_submission_id(*)&id=eq.${id}&limit=1`,
  );
  return exchange ?? null;
}

export async function listHistory(limit = 20) {
  if (!hasSupabaseEnv()) {
    return mockExchanges.slice(0, limit).map(hydrateExchange);
  }

  return supabaseFetch<ExchangeWithSubmissions[]>(
    `exchanges?select=*,submitted:submitted_submission_id(*),received:received_submission_id(*)&order=created_at.desc&limit=${limit}`,
  );
}

export async function listApprovedSubmissions(page = 1, pageSize = 12): Promise<PaginatedSubmissions> {
  const safePage = Math.max(page, 1);
  const safePageSize = Math.max(1, Math.min(pageSize, 50));

  if (!hasSupabaseEnv()) {
    const approved = mockSubmissions
      .filter((item) => item.status === "approved")
      .sort((left, right) => {
        const leftValue = left.approved_at ?? left.created_at;
        const rightValue = right.approved_at ?? right.created_at;
        return rightValue.localeCompare(leftValue);
      });
    const offset = (safePage - 1) * safePageSize;
    const items = approved.slice(offset, offset + safePageSize);
    const total = approved.length;

    return {
      items,
      page: safePage,
      pageSize: safePageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / safePageSize)),
    };
  }

  const offset = (safePage - 1) * safePageSize;
  const [items, total] = await Promise.all([
    supabaseFetch<SubmissionRecord[]>(
      `submissions?select=*&status=eq.approved&order=approved_at.desc.nullslast,created_at.desc&limit=${safePageSize}&offset=${offset}`,
    ),
    supabaseCount("submissions?status=eq.approved"),
  ]);

  return {
    items,
    page: safePage,
    pageSize: safePageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / safePageSize)),
  };
}

export async function insertReport(input: Omit<ReportRecord, "id" | "created_at">) {
  const now = new Date().toISOString();

  if (!hasSupabaseEnv()) {
    const record: ReportRecord = { ...input, id: createId("rep"), created_at: now };
    mockReports.unshift(record);
    return record;
  }

  const [record] = await supabaseFetch<ReportRecord[]>("reports", {
    method: "POST",
    body: JSON.stringify([input]),
  });

  return record;
}

export async function listAdminSubmissions() {
  if (!hasSupabaseEnv()) {
    return mockSubmissions.slice(0, 50);
  }

  return supabaseFetch<SubmissionRecord[]>("submissions?select=*&order=created_at.desc&limit=50");
}

export async function listReports() {
  if (!hasSupabaseEnv()) {
    return mockReports.slice(0, 100);
  }

  return supabaseFetch<ReportRecord[]>("reports?select=*&order=created_at.desc&limit=100");
}

export async function updateSubmissionStatus(
  submissionId: string,
  status: SubmissionStatus,
  moderationReason: string | null,
) {
  const approvedAt = status === "approved" ? new Date().toISOString() : null;

  if (!hasSupabaseEnv()) {
    const target = mockSubmissions.find((item) => item.id === submissionId);
    if (!target) {
      return null;
    }
    target.status = status;
    target.moderation_reason = moderationReason;
    target.approved_at = approvedAt;
    return target;
  }

  const [record] = await supabaseFetch<SubmissionRecord[]>(
    `submissions?id=eq.${submissionId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
        moderation_reason: moderationReason,
        approved_at: approvedAt,
      }),
    },
  );

  return record ?? null;
}

export async function logAdminAction(action: string, payload: Record<string, unknown>) {
  if (!hasSupabaseEnv()) {
    mockAdminLogs.unshift({
      id: createId("log"),
      action,
      payload,
      created_at: new Date().toISOString(),
    });
    return;
  }

  await supabaseFetch("admin_logs", {
    method: "POST",
    body: JSON.stringify([{ action, payload }]),
  });
}

export async function addAllowedDomain(domain: string) {
  if (!hasSupabaseEnv()) {
    mockAllowedDomains.unshift({
      id: createId("domain"),
      domain,
      note: null,
      is_active: true,
      created_at: new Date().toISOString(),
    });
    return;
  }

  await supabaseFetch("allowed_domains", {
    method: "POST",
    body: JSON.stringify([{ domain, is_active: true }]),
  });
}

export async function removeAllowedDomain(domain: string) {
  if (!hasSupabaseEnv()) {
    const target = mockAllowedDomains.find((item) => item.domain === domain);
    if (target) {
      target.is_active = false;
    }
    return;
  }

  await supabaseFetch(`allowed_domains?domain=eq.${encodeURIComponent(domain)}`, {
    method: "PATCH",
    body: JSON.stringify({ is_active: false }),
  });
}

export async function addBlockedKeyword(keyword: string) {
  if (!hasSupabaseEnv()) {
    mockBlockedKeywords.unshift({
      id: createId("kw"),
      keyword,
      note: null,
      is_active: true,
      created_at: new Date().toISOString(),
    });
    return;
  }

  await supabaseFetch("blocked_keywords", {
    method: "POST",
    body: JSON.stringify([{ keyword, is_active: true }]),
  });
}

export async function removeBlockedKeyword(keyword: string) {
  if (!hasSupabaseEnv()) {
    const target = mockBlockedKeywords.find((item) => item.keyword === keyword);
    if (target) {
      target.is_active = false;
    }
    return;
  }

  await supabaseFetch(`blocked_keywords?keyword=eq.${encodeURIComponent(keyword)}`, {
    method: "PATCH",
    body: JSON.stringify({ is_active: false }),
  });
}
