import crypto from "crypto";
import { cookies } from "next/headers";

import { env } from "@/lib/env";

const COOKIE_NAME = "nb_admin_session";

function sign(value: string) {
  return crypto.createHmac("sha256", env.adminSessionSecret).update(value).digest("hex");
}

export function createAdminSessionValue() {
  const payload = `${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminSessionValue(value: string | undefined) {
  if (!value) {
    return false;
  }

  const [payload, signature] = value.split(".");

  if (!payload || !signature) {
    return false;
  }

  return sign(payload) === signature;
}

export function getAdminSessionCookieName() {
  return COOKIE_NAME;
}

export function isAdminSession() {
  return verifyAdminSessionValue(cookies().get(COOKIE_NAME)?.value);
}
