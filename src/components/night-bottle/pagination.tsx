import Link from "next/link";

import { Button } from "@/components/ui/button";

export function Pagination({
  page,
  totalPages,
  pathname,
}: {
  page: number;
  totalPages: number;
  pathname: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-zinc-300">
        Page {page} / {Math.max(totalPages, 1)}
      </p>
      <div className="flex gap-3">
        <Button asChild disabled={page <= 1} variant="outline">
          <Link aria-disabled={page <= 1} href={`${pathname}?page=${Math.max(page - 1, 1)}`}>
            前へ
          </Link>
        </Button>
        <Button asChild disabled={page >= totalPages} variant="outline">
          <Link
            aria-disabled={page >= totalPages}
            href={`${pathname}?page=${Math.min(page + 1, totalPages)}`}
          >
            次へ
          </Link>
        </Button>
      </div>
    </div>
  );
}
