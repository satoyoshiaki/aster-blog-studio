import test, { after, beforeEach, mock } from "node:test";
import assert from "node:assert/strict";

import { isHostWithinDomainBoundary } from "../src/lib/domain";
import { mockAllowedDomains, mockBlockedKeywords, mockSubmissions } from "../src/lib/mock-data";
import { moderateSubmission, submitBottle } from "../src/lib/service";
import type { SubmitInput } from "../src/lib/validations";

const initialAllowedDomains = structuredClone(mockAllowedDomains);
const initialBlockedKeywords = structuredClone(mockBlockedKeywords);
const initialSubmissions = structuredClone(mockSubmissions);

const validSubmitInput: SubmitInput = {
  url: "https://www.dmm.co.jp/digital/videoa/-/detail/=/cid=test/",
  title: "test title",
  note: "quiet night",
  tags: "drama, mellow",
  ageConfirmed: true,
  acceptPolicy: true,
  honeypot: "",
  csrfToken: "test",
};

beforeEach(() => {
  mockAllowedDomains.splice(0, mockAllowedDomains.length, ...structuredClone(initialAllowedDomains));
  mockBlockedKeywords.splice(0, mockBlockedKeywords.length, ...structuredClone(initialBlockedKeywords));
  mockSubmissions.splice(0, mockSubmissions.length, ...structuredClone(initialSubmissions));

  mock.restoreAll();
  mock.method(global, "fetch", async () => new Response("", { status: 500 }));
});

after(() => {
  mock.restoreAll();
});

test("submitBottle stores new submissions as pending until an admin approves them", async () => {
  const result = await submitBottle(validSubmitInput, "ip-hash");

  assert.equal(result.exchange, null);
  assert.equal(result.rejected, null);
  assert.match(result.reason ?? "", /承認|審査|受付/);

  const created = mockSubmissions[0];

  assert.equal(created.status, "pending");
  assert.equal(created.approved_at, null);
  assert.equal(created.exchange_count, 0);
});

test("moderateSubmission approves a pending submission and timestamps the approval", async () => {
  await submitBottle(validSubmitInput, "ip-hash");
  const created = mockSubmissions[0];

  const approved = await moderateSubmission(created.id, "approved", "");

  assert.ok(approved);
  assert.equal(approved.status, "approved");
  assert.equal(approved.moderation_reason, null);
  assert.ok(approved.approved_at);
});

test("host boundary checks only allow the exact host or its subdomains", () => {
  assert.equal(isHostWithinDomainBoundary("dmm.co.jp", "dmm.co.jp"), true);
  assert.equal(isHostWithinDomainBoundary("www.dmm.co.jp", "dmm.co.jp"), true);
  assert.equal(isHostWithinDomainBoundary("fake-dmm.co.jp", "dmm.co.jp"), false);
  assert.equal(isHostWithinDomainBoundary("dmm.co.jp.evil.example", "dmm.co.jp"), false);
});
