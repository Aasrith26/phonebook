"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const PENDING_CALL_KEY = "pending_call_history";
const MIN_WAIT_BEFORE_PROMPT_MS = 5_000;

type PendingCall = {
  contactId: string;
  contactName: string;
  organization?: string;
  phoneNumber: string;
  createdAt: number;
};

function readPendingCall(): PendingCall | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(PENDING_CALL_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as PendingCall;
    if (
      typeof parsed.contactId === "string" &&
      typeof parsed.contactName === "string" &&
      typeof parsed.phoneNumber === "string" &&
      typeof parsed.createdAt === "number"
    ) {
      return parsed;
    }
  } catch {
    // Ignore malformed local storage.
  }

  localStorage.removeItem(PENDING_CALL_KEY);
  return null;
}

async function createCallHistoryFromConfirmation(pendingCall: PendingCall) {
  await fetch("/api/call-history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contactId: pendingCall.contactId,
      contactName: pendingCall.contactName,
      organization: pendingCall.organization ?? "",
      phoneNumber: pendingCall.phoneNumber,
    }),
  });
}

export function CallConfirmationListener() {
  const router = useRouter();
  const [pendingCall, setPendingCall] = useState<PendingCall | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const checkForPendingCall = useCallback(() => {
    const pending = readPendingCall();
    if (!pending) {
      setPendingCall(null);
      return;
    }

    if (Date.now() - pending.createdAt >= MIN_WAIT_BEFORE_PROMPT_MS) {
      setPendingCall(pending);
    }
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkForPendingCall();
      }
    };

    const onFocus = () => {
      checkForPendingCall();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onFocus);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onFocus);
    };
  }, [checkForPendingCall]);

  async function finalizeCall(wasCompleted: boolean) {
    if (!pendingCall) {
      return;
    }

    setIsSaving(true);
    try {
      if (wasCompleted) {
        await createCallHistoryFromConfirmation(pendingCall);
      }
    } catch {
      // Even if call history create fails, clear prompt to avoid locking UX.
    } finally {
      localStorage.removeItem(PENDING_CALL_KEY);
      setPendingCall(null);
      setIsSaving(false);
      router.refresh();
    }
  }

  if (!pendingCall) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/35 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-white p-5 shadow-xl">
        <h3 className="text-lg font-semibold text-[var(--ink)]">Confirm Call</h3>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Did you complete the call to <strong>{pendingCall.contactName}</strong> (
          {pendingCall.phoneNumber})?
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => finalizeCall(true)}
            className="flex-1 rounded-lg bg-[var(--brand-strong)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand)] disabled:opacity-60"
          >
            Yes, completed
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => finalizeCall(false)}
            className="flex-1 rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-muted)] disabled:opacity-60"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
