"use client";

import { useEffect, useState } from "react";

import { CSRF_COOKIE_NAME } from "@/lib/constants";

function readCookie(name: string) {
  if (typeof document === "undefined") {
    return "";
  }

  const cookies = document.cookie.split(";").map((item) => item.trim());
  const match = cookies.find((item) => item.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : "";
}

export function useCsrfToken(initialValue = "") {
  const [token, setToken] = useState(initialValue);

  useEffect(() => {
    setToken(readCookie(CSRF_COOKIE_NAME));
  }, []);

  return token;
}

export function CsrfTokenField({ value }: { value?: string }) {
  const token = useCsrfToken(value);
  return <input name="csrfToken" type="hidden" value={token} readOnly />;
}
