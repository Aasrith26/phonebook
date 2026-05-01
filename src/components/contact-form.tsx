"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveContact, type SaveContactState } from "@/app/actions";
import {
  CONTACT_CATEGORIES,
  type ContactCategory,
} from "@/lib/contact-categories";

const initialState: SaveContactState = {
  status: "idle",
  message: "",
};

const MAX_FIELD_LENGTH = 250;
const MAX_COMMENT_LENGTH = 1000;

type ContactValues = {
  name: string;
  organization: string;
  category: ContactCategory;
  otherCategory: string;
  phoneNumber: string;
  designation: string;
  address: string;
  comments: string;
};

const initialValues: ContactValues = {
  name: "",
  organization: "",
  category: "Others",
  otherCategory: "",
  phoneNumber: "",
  designation: "",
  address: "",
  comments: "",
};

function isValidPhoneNumber(phoneNumber: string) {
  return /^\d{10}$/.test(phoneNumber.trim());
}

function isValidAlphabeticName(value: string) {
  return /^[A-Za-z][A-Za-z\s.'-]*$/.test(value.trim());
}

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-[var(--brand-strong)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Saving..." : "Save Contact"}
    </button>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState(saveContact, initialState);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepError, setStepError] = useState("");
  const [values, setValues] = useState<ContactValues>(initialValues);

  const steps = useMemo(
    () => [
      {
        title: "Contact name",
        description: "Enter the contact's full name.",
        render: (
          <input
            value={values.name}
            onChange={(event) => {
              const alphabetsOnly = event.target.value.replace(/[^A-Za-z\s.'-]/g, "");
              setValues((prev) => ({ ...prev, name: alphabetsOnly }));
              setStepError("");
            }}
            autoComplete="name"
            placeholder="e.g. Priya Sharma"
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
          />
        ),
      },
      {
        title: "Organization",
        description: "Add the company or brand name.",
        render: (
          <input
            value={values.organization}
            onChange={(event) => {
              setValues((prev) => ({ ...prev, organization: event.target.value }));
              setStepError("");
            }}
            placeholder="e.g. Brightline Media"
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
          />
        ),
      },
      {
        title: "Category",
        description: "Select the contact category.",
        render: (
          <div className="space-y-3">
            <select
              value={values.category}
              onChange={(event) => {
                const nextCategory = event.target.value as ContactCategory;
                setValues((prev) => ({
                  ...prev,
                  category: nextCategory,
                  otherCategory: nextCategory === "Others" ? prev.otherCategory : "",
                }));
                setStepError("");
              }}
              className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
            >
              {CONTACT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {values.category === "Others" ? (
              <input
                value={values.otherCategory}
                onChange={(event) => {
                  setValues((prev) => ({ ...prev, otherCategory: event.target.value }));
                  setStepError("");
                }}
                placeholder="Specify category type"
                maxLength={MAX_FIELD_LENGTH}
                className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
              />
            ) : null}
          </div>
        ),
      },
      {
        title: "Phone number",
        description: "Add the best number to call.",
        render: (
          <input
            value={values.phoneNumber}
            onChange={(event) => {
              const digitsOnly = event.target.value.replace(/\D+/g, "").slice(0, 10);
              setValues((prev) => ({ ...prev, phoneNumber: digitsOnly }));
              setStepError("");
            }}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]{10}"
            maxLength={10}
            autoComplete="tel"
            placeholder="10-digit phone number"
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
          />
        ),
      },
      {
        title: "Designation",
        description: "What is their role?",
        render: (
          <input
            value={values.designation}
            onChange={(event) => {
              setValues((prev) => ({ ...prev, designation: event.target.value }));
              setStepError("");
            }}
            placeholder="e.g. Marketing Manager"
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
          />
        ),
      },
      {
        title: "Address / Location",
        description: "Add city or area for follow-up planning.",
        render: (
          <input
            value={values.address}
            onChange={(event) => {
              setValues((prev) => ({ ...prev, address: event.target.value }));
              setStepError("");
            }}
            placeholder="e.g. Jubilee Hills, Hyderabad"
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
          />
        ),
      },
      {
        title: "Comments",
        description: "Capture discussion context or next steps.",
        render: (
          <textarea
            value={values.comments}
            onChange={(event) => {
              setValues((prev) => ({ ...prev, comments: event.target.value }));
              setStepError("");
            }}
            rows={4}
            placeholder="Any lead context, follow-up notes, meeting details..."
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
          />
        ),
      },
    ],
    [values]
  );

  const totalSteps = steps.length;

  function validateStep(stepIndex: number) {
    if (stepIndex === 0) {
      if (!values.name.trim()) {
        return "Name is required.";
      }
      if (!isValidAlphabeticName(values.name)) {
        return "Name must contain alphabets only.";
      }
      if (values.name.trim().length > MAX_FIELD_LENGTH) {
        return "Name is too long.";
      }
    }

    if (stepIndex === 1 && values.organization.trim().length > MAX_FIELD_LENGTH) {
      return "Organization is too long.";
    }

    if (stepIndex === 2 && values.category === "Others") {
      if (!values.otherCategory.trim()) {
        return "Please specify the category type.";
      }
      if (values.otherCategory.trim().length > MAX_FIELD_LENGTH) {
        return "Other category is too long.";
      }
    }

    if (stepIndex === 3) {
      if (!values.phoneNumber.trim()) {
        return "Phone number is required.";
      }
      if (!isValidPhoneNumber(values.phoneNumber)) {
        return "Phone number must be exactly 10 digits.";
      }
    }

    if (stepIndex === 4 && values.designation.trim().length > MAX_FIELD_LENGTH) {
      return "Designation is too long.";
    }

    if (stepIndex === 5 && values.address.trim().length > MAX_FIELD_LENGTH) {
      return "Address/Location is too long.";
    }

    if (stepIndex === 6 && values.comments.trim().length > MAX_COMMENT_LENGTH) {
      return "Comments can be up to 1000 characters.";
    }

    return "";
  }

  function handleNext() {
    const validationError = validateStep(currentStep);
    if (validationError) {
      setStepError(validationError);
      return;
    }

    setStepError("");
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }

  function handleBack() {
    setStepError("");
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }

  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-lg shadow-[var(--shadow)] sm:p-7"
    >
      <input type="hidden" name="name" value={values.name} />
      <input type="hidden" name="organization" value={values.organization} />
      <input type="hidden" name="category" value={values.category} />
      <input type="hidden" name="otherCategory" value={values.otherCategory} />
      <input type="hidden" name="phoneNumber" value={values.phoneNumber} />
      <input type="hidden" name="designation" value={values.designation} />
      <input type="hidden" name="address" value={values.address} />
      <input type="hidden" name="comments" value={values.comments} />

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
          <span>
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]">
          <div
            className="h-full rounded-full bg-[var(--brand)] transition-all duration-200"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-[var(--ink)]">
            {steps[currentStep].title}
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {steps[currentStep].description}
          </p>
        </div>
        {steps[currentStep].render}
      </div>

      {stepError ? <p className="text-sm text-rose-700">{stepError}</p> : null}

      <div className="flex flex-wrap items-center gap-3">
        {currentStep > 0 ? (
          <button
            type="button"
            onClick={handleBack}
            className="rounded-xl border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--accent)]"
          >
            Back
          </button>
        ) : null}

        {currentStep < totalSteps - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="rounded-xl bg-[var(--brand-strong)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand)]"
          >
            Next
          </button>
        ) : (
          <SaveButton />
        )}

        {state.status !== "idle" ? (
          <p
            className={`text-sm ${
              state.status === "success" ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
