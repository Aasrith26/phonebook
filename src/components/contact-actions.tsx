"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { deleteContact, type DeleteContactState } from "@/app/actions";

const initialDeleteState: DeleteContactState = {
  status: "idle",
  message: "",
};

function DeleteIconButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-label="Delete contact"
      title="Delete contact"
      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-rose-200 bg-white text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <span className="text-[9px] font-semibold">...</span>
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path
            d="M9 3H15M4 7H20M7 7L8 20H16L17 7M10 11V17M14 11V17"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}

type ContactCallButtonProps = {
  contactId: string;
  contactName: string;
  organization?: string | null;
  phoneNumber: string;
  className?: string;
};

export function ContactCallButton({
  contactId,
  contactName,
  organization,
  phoneNumber,
  className = "",
}: ContactCallButtonProps) {
  const normalizedPhoneNumber = phoneNumber.replace(/\D+/g, "");

  async function logCallAndDial() {
    localStorage.setItem(
      "pending_call_history",
      JSON.stringify({
        contactId,
        contactName,
        organization: organization ?? "",
        phoneNumber: normalizedPhoneNumber,
        createdAt: Date.now(),
      })
    );

    window.location.href = `tel:${normalizedPhoneNumber}`;
  }

  return (
    <button
      type="button"
      onClick={logCallAndDial}
      className={`inline-flex items-center justify-center rounded-lg border border-[var(--brand-soft)] bg-[var(--brand-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--brand-strong)] transition hover:bg-[#d9e8fb] ${className}`.trim()}
    >
      Call
    </button>
  );
}

type ContactDeleteButtonProps = {
  contactId: string;
  align?: "left" | "center" | "right";
};

export function ContactDeleteButton({
  contactId,
  align = "center",
}: ContactDeleteButtonProps) {
  const [state, formAction] = useActionState(deleteContact, initialDeleteState);

  const alignClass =
    align === "left"
      ? "justify-start"
      : align === "right"
      ? "justify-end"
      : "justify-center";

  return (
    <div className="space-y-1">
      <form
        action={formAction}
        className={`flex ${alignClass}`}
        onSubmit={(event) => {
          const confirmed = window.confirm(
            "Delete this contact? This action cannot be undone."
          );

          if (!confirmed) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="contactId" value={contactId} />
        <DeleteIconButton />
      </form>
      {state.status === "error" ? (
        <p className="text-xs text-rose-700">{state.message}</p>
      ) : null}
    </div>
  );
}
