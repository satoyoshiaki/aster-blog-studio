"use client";

import { useTransition } from "react";

interface DeleteButtonProps {
  id: string;
  action: (id: string) => Promise<void>;
  label: string;
}

export function DeleteButton({ id, action, label }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(`Delete this ${label}? This cannot be undone.`)) return;
    startTransition(() => action(id));
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
    >
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
