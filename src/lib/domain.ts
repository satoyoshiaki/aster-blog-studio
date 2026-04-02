export function normalizeDomain(input: string) {
  const candidate = input.trim().toLowerCase().replace(/\.+$/, "");

  if (!candidate) {
    throw new Error("ドメインを入力してください。");
  }

  if (/[/?#\s]/.test(candidate) || candidate.includes("://")) {
    throw new Error("ドメインはホスト名のみ入力してください。");
  }

  const normalized = candidate.startsWith("www.") ? candidate.slice(4) : candidate;
  const parsed = new URL(`https://${normalized}`);

  if (parsed.hostname !== normalized || normalized.startsWith(".") || normalized.endsWith(".")) {
    throw new Error("有効なホスト名を入力してください。");
  }

  return normalized;
}

export function isHostWithinDomainBoundary(host: string, domain: string) {
  const normalizedHost = normalizeDomain(host);
  const normalizedDomain = normalizeDomain(domain);

  return normalizedHost === normalizedDomain || normalizedHost.endsWith(`.${normalizedDomain}`);
}
