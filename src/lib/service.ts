import { isHostWithinDomainBoundary, normalizeDomain } from "@/lib/domain";
import { fetchUrlMetadata } from "@/lib/metadata";
import {
  addAllowedDomain,
  addBlockedKeyword,
  getExchangeById,
  insertReport,
  insertSubmission,
  listApprovedSubmissions,
  listAdminSubmissions,
  listAllowedDomains,
  listBlockedKeywords,
  listHistory,
  listReports,
  logAdminAction,
  removeAllowedDomain,
  removeBlockedKeyword,
  updateSubmissionStatus,
} from "@/lib/repository";
import { containsBlockedKeyword, normalizeUrl } from "@/lib/security";
import type { ExchangeWithSubmissions, SubmissionRecord } from "@/types";
import type { ReportInput, SubmitInput } from "@/lib/validations";

type SubmitBottleResult = {
  rejected: SubmissionRecord | null;
  exchange: ExchangeWithSubmissions | null;
  reason: string | null;
};

export async function buildHomepageData() {
  const [domains, history] = await Promise.all([listAllowedDomains(), listHistory(6)]);
  return { domains, history };
}

export async function submitBottle(input: SubmitInput, ipHash: string): Promise<SubmitBottleResult> {
  const allowedDomains = await listAllowedDomains();
  const blockedKeywords = (await listBlockedKeywords()).map((item) => item.keyword);
  const normalizedUrl = normalizeUrl(input.url);
  const metadata = await fetchUrlMetadata(normalizedUrl, input.title);
  const domainMatch = allowedDomains.find((item) =>
    isHostWithinDomainBoundary(metadata.domain, item.domain),
  );

  if (!domainMatch) {
    throw new Error("許可された公式ドメインの URL のみ投稿できます。");
  }

  const searchableText = [normalizedUrl, metadata.title, input.note, input.tags].join(" ");
  const blocked = containsBlockedKeyword(searchableText, blockedKeywords);

  if (blocked) {
    const rejected = await insertSubmission({
      source_url: input.url,
      normalized_url: normalizedUrl,
      source_domain: metadata.domain,
      title: metadata.title,
      description: input.note || null,
      tags: input.tags
        ? input.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
      thumbnail_url: metadata.thumbnailUrl,
      status: "rejected",
      moderation_reason: `blocked keyword: ${blocked}`,
      submitter_ip_hash: ipHash,
      approved_at: null,
    });

    return {
      rejected,
      exchange: null,
      reason: "禁止ワードまたは違法性を疑う語句が含まれているため受付できませんでした。",
    };
  }

  const submitted = await insertSubmission({
    source_url: input.url,
    normalized_url: normalizedUrl,
    source_domain: metadata.domain,
    title: metadata.title,
    description: input.note || null,
    tags: input.tags
      ? input.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [],
    thumbnail_url: metadata.thumbnailUrl,
    status: "pending",
    moderation_reason: null,
    submitter_ip_hash: ipHash,
    approved_at: null,
  });

  return {
    rejected: null,
    exchange: null,
    reason: "投稿を受け付けました。管理者の確認後に承認されると公開候補に追加されます。",
  };
}

export async function getExchange(exchangeId: string) {
  return getExchangeById(exchangeId);
}

export async function getHistory() {
  return listHistory(20);
}

export async function getApprovedHistory(page = 1, pageSize = 12) {
  return listApprovedSubmissions(page, pageSize);
}

export async function submitReport(input: ReportInput, ipHash: string) {
  return insertReport({
    exchange_id: input.exchangeId ?? null,
    submission_id: input.submissionId ?? null,
    reason: input.reason,
    details: input.details || null,
    reporter_ip_hash: ipHash,
  });
}

export async function getAdminDashboardData() {
  const [submissions, domains, keywords, reports] = await Promise.all([
    listAdminSubmissions(),
    listAllowedDomains(),
    listBlockedKeywords(),
    listReports(),
  ]);

  return { submissions, domains, keywords, reports };
}

export async function moderateSubmission(
  submissionId: string,
  decision: "approved" | "rejected",
  reason: string,
) {
  const updated = await updateSubmissionStatus(submissionId, decision, reason || null);
  await logAdminAction("moderate_submission", { submissionId, decision, reason });
  return updated;
}

export async function mutateDomain(action: "add" | "remove", domain: string) {
  const normalizedDomain = normalizeDomain(domain);

  if (action === "add") {
    await addAllowedDomain(normalizedDomain);
  } else {
    await removeAllowedDomain(normalizedDomain);
  }

  await logAdminAction("mutate_domain", { action, domain: normalizedDomain });
}

export async function mutateKeyword(action: "add" | "remove", keyword: string) {
  if (action === "add") {
    await addBlockedKeyword(keyword);
  } else {
    await removeBlockedKeyword(keyword);
  }

  await logAdminAction("mutate_keyword", { action, keyword });
}
