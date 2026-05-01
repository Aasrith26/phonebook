import type { Contact, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  ContactCallButton,
  ContactDeleteButton,
} from "@/components/contact-actions";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Phone Book | Contact Dashboard",
};

type SortOption = "latest" | "name-asc" | "name-desc";

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "latest", label: "Latest Added" },
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
];

function normalizeSortOption(value: string | undefined): SortOption {
  if (value === "latest" || value === "name-asc" || value === "name-desc") {
    return value;
  }

  return "latest";
}

function normalizeStringParam(value: string | string[] | undefined) {
  const normalized = Array.isArray(value) ? value[0] : value;
  return typeof normalized === "string" ? normalized.trim() : "";
}

function getCityFromAddress(address: string | null) {
  if (!address) {
    return "";
  }

  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return "";
  }

  return parts[parts.length - 1];
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getContactOrderBy(sort: SortOption): Prisma.ContactOrderByWithRelationInput[] {
  switch (sort) {
    case "name-asc":
      return [{ name: "asc" }];
    case "name-desc":
      return [{ name: "desc" }];
    case "latest":
    default:
      return [{ createdAt: "desc" }];
  }
}

type ContactGroup = {
  key: string;
  organization: string;
  contacts: Contact[];
};

function buildContactGroups(contacts: Contact[]) {
  const grouped = new Map<string, ContactGroup>();

  for (const contact of contacts) {
    const organizationLabel = contact.organization?.trim() || "No organization";
    const normalizedKey = organizationLabel.toLowerCase();
    const existing = grouped.get(normalizedKey);

    if (existing) {
      existing.contacts.push(contact);
    } else {
      grouped.set(normalizedKey, {
        key: normalizedKey,
        organization: organizationLabel,
        contacts: [contact],
      });
    }
  }

  return Array.from(grouped.values()).sort((a, b) =>
    a.organization.localeCompare(b.organization, "en", { sensitivity: "base" })
  );
}

export default async function PhonebookPage({
  searchParams,
}: {
  searchParams: Promise<{
    sort?: string | string[];
    company?: string | string[];
    city?: string | string[];
    designation?: string | string[];
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  const sort = normalizeSortOption(normalizeStringParam(resolvedSearchParams.sort));
  const selectedCompany = normalizeStringParam(resolvedSearchParams.company);
  const selectedCity = normalizeStringParam(resolvedSearchParams.city);
  const selectedDesignation = normalizeStringParam(resolvedSearchParams.designation);

  let contacts: Contact[] = [];
  let hasLoadError = false;

  try {
    contacts = await prisma.contact.findMany({
      where: {
        organization: selectedCompany
          ? {
              contains: selectedCompany,
              mode: "insensitive",
            }
          : undefined,
        address: selectedCity
          ? {
              contains: selectedCity,
              mode: "insensitive",
            }
          : undefined,
        designation: selectedDesignation
          ? {
              contains: selectedDesignation,
              mode: "insensitive",
            }
          : undefined,
      },
      orderBy: getContactOrderBy(sort),
    });
  } catch {
    hasLoadError = true;
  }

  const allContactMeta = await prisma.contact.findMany({
    select: {
      organization: true,
      address: true,
      designation: true,
    },
    orderBy: [{ organization: "asc" }, { designation: "asc" }],
  });

  const companyOptions = Array.from(
    new Set(
      allContactMeta
        .map((item) => item.organization?.trim() || "")
        .filter(Boolean)
    )
  );

  const cityOptions = Array.from(
    new Set(allContactMeta.map((item) => getCityFromAddress(item.address)).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));

  const designationOptions = Array.from(
    new Set(
      allContactMeta
        .map((item) => item.designation?.trim() || "")
        .filter(Boolean)
    )
  );

  const contactGroups = buildContactGroups(contacts);

  return (
    <section className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--muted)]">
            Contact Repository
          </p>
          <h2 className="font-heading text-2xl font-semibold text-[var(--ink)] sm:text-3xl">
            Phone Book
          </h2>
          <p className="text-sm text-[var(--muted)] sm:text-base">
            Browse contacts grouped by company and filter by company, city, and
            designation.
          </p>
        </div>
        <form
          method="get"
          className="grid gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-3 md:grid-cols-4"
        >
          <input
            name="company"
            list="company-options"
            defaultValue={selectedCompany}
            placeholder="Filter company"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
          />
          <datalist id="company-options">
            {companyOptions.map((company) => (
              <option key={company} value={company} />
            ))}
          </datalist>
          <input
            name="city"
            list="city-options"
            defaultValue={selectedCity}
            placeholder="Filter city"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
          />
          <datalist id="city-options">
            {cityOptions.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
          <input
            name="designation"
            list="designation-options"
            defaultValue={selectedDesignation}
            placeholder="Filter designation"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
          />
          <datalist id="designation-options">
            {designationOptions.map((designation) => (
              <option key={designation} value={designation} />
            ))}
          </datalist>
          <div className="flex gap-2">
            <select
              name="sort"
              defaultValue={sort}
              className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg bg-[var(--brand-strong)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand)]"
            >
              Apply
            </button>
          </div>
        </form>
      </div>

      {hasLoadError ? (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] p-8 text-center text-[var(--muted)]">
          Unable to load contacts right now. Please check `DATABASE_URL` and
          database connectivity.
        </div>
      ) : contactGroups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface-muted)] p-8 text-center text-[var(--muted)]">
          No contacts found for the current filter.
        </div>
      ) : (
        <div className="space-y-4">
          {contactGroups.map((group) => (
            <article
              key={group.key}
              className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] shadow-sm shadow-[var(--shadow)]"
            >
              <header className="border-b border-[var(--line)] bg-white px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-semibold text-[var(--ink)]">
                    {group.organization}
                  </h3>
                  <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--brand-strong)]">
                    {group.contacts.length} contact
                    {group.contacts.length > 1 ? "s" : ""}
                  </span>
                </div>
              </header>

              <div className="md:hidden space-y-3 p-3">
                {group.contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="rounded-xl border border-[var(--line)] bg-white p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--ink)]">
                          {contact.name}
                        </p>
                        <p className="text-xs text-[var(--muted)]">
                          {contact.designation || "-"}
                        </p>
                      </div>
                      <ContactDeleteButton contactId={contact.id} align="right" />
                    </div>
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      City: {getCityFromAddress(contact.address) || "-"}
                    </p>
                    <div className="mt-2">
                      <ContactCallButton
                        contactId={contact.id}
                        contactName={contact.name}
                        organization={contact.organization}
                        phoneNumber={contact.phoneNumber}
                      />
                    </div>
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      Added: {formatDate(contact.createdAt)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="hidden md:block">
                <table className="w-full table-auto border-collapse text-left">
                  <thead className="bg-white">
                    <tr className="border-b border-[var(--line)]">
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                        Name
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                        Designation
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                        City
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                        Category
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                        Added
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                        Call
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                        Delete
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.contacts.map((contact) => (
                      <tr
                        key={contact.id}
                        className="border-b border-[var(--line)] last:border-b-0 hover:bg-white/70"
                      >
                        <td className="px-4 py-3 text-sm font-semibold text-[var(--ink)]">
                          {contact.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--ink)]">
                          {contact.designation || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--ink)]">
                          {getCityFromAddress(contact.address) || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--ink)]">
                          <span className="inline-flex whitespace-nowrap rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--brand-strong)]">
                            {contact.category}
                          </span>
                          {contact.category === "Others" && contact.otherCategory ? (
                            <p className="mt-1 text-xs text-[var(--muted)]">
                              {contact.otherCategory}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--ink)]">
                          {contact.phoneNumber}
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold text-[var(--muted)]">
                          {formatDate(contact.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <ContactCallButton
                            contactId={contact.id}
                            contactName={contact.name}
                            organization={contact.organization}
                            phoneNumber={contact.phoneNumber}
                            className="w-full max-w-[84px]"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <ContactDeleteButton contactId={contact.id} align="center" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
