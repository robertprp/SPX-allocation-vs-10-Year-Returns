"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function RefreshData() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      className="mt-3 cursor-pointer rounded-md border border-black px-4 py-2 disabled:opacity-50"
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
    >
      {pending ? "Loading…" : "Try again"}
    </button>
  );
}
