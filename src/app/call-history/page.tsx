import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Call History | Contact Dashboard",
};

function normalizeStringParam(value: string | string[] | undefined) {
  const normalized = Array.isArray(value) ? value[0] : value;
  return typeof normalized === "string" ? normalized.trim() : "";
}

function getCityFromAddress(address: string | null | undefined) {
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

type CallWithContact = Prisma.CallHistoryGetPayload<{
  include: { contact: true };
}>;

function buildCallGroups(calls: CallWithContact[]) {
  const grouped = new Map<
    string,
    { key: string; organization: string; calls: CallWithContact[] }
  >();

  for (const call of calls) {
    const organizationLabel = call.organization?.trim() || "No organization";
    const key = organizationLabel.toLowerCase();
    const existing = grouped.get(key);

    if (existing) {
      existing.calls.push(call);
    } else {
      grouped.set(key, {
        key,
        organization: organizationLabel,
        calls: [call],
      });
    }
  }

  return Array.from(grouped.values()).sort((a, b) =>
    a.organization.localeCompare(b.organization, "en", { sensitivity: "base" })
  );
}

export default async function CallHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    company?: string | string[];
    city?: string | string[];
    designation?: string | string[];
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  const selectedCompany = normalizeStringParam(resolvedSearchParams.company);
  const selectedCity = normalizeStringParam(resolvedSearchParams.city);
  const selectedDesignation = normalizeStringParam(resolvedSearchParams.designation);

  const where: Prisma.CallHistoryWhereInput = {
    organization: selectedCompany
      ? {
          contains: selectedCompany,
          mode: "insensitive",
        }
      : undefined,
    contact: {
      designation: selectedDesignation
        ? {
            contains: selectedDesignation,
            mode: "insensitive",
          }
        : undefined,
      address: selectedCity
        ? {
            contains: selectedCity,
            mode: "insensitive",
          }
        : undefined,
    },
  };

  const calls = await prisma.callHistory.findMany({
    where,
    include: { contact: true },
    orderBy: { calledAt: "desc" },
    take: 500,
  });

  const allCallMeta = await prisma.callHistory.findMany({
    include: { contact: true },
    orderBy: { calledAt: "desc" },
    take: 1000,
  });

  const companyOptions = Array.from(
    new Set(allCallMeta.map((call) => call.organization?.trim() || "").filter(Boolean))
  );
  const cityOptions = Array.from(
    new Set(
      allCallMeta
        .map((call) => getCityFromAddress(call.contact?.address))
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));
  const designationOptions = Array.from(
    new Set(
      allCallMeta
        .map((call) => call.contact?.designation?.trim() || "")
        .filter(Boolean)
    )
  );

  const groupedCalls = buildCallGroups(calls);

  return (
    <section className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--muted)]">
            Communication Repository
          </p>
          <h2 className="font-heading text-2xl font-semibold text-[var(--ink)] sm:text-3xl">
            Call History
          </h2>
          <p className="text-sm text-[var(--muted)] sm:text-base">
            Filter and review confirmed calls by company, city, and designation.
          </p>
        </div>
        <form
          method="get"
          className="grid gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-3 md:grid-cols-4"
        >
          <input
            name="company"
            list="history-company-options"
            defaultValue={selectedCompany}
            placeholder="Filter company"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
          />
          <datalist id="history-company-options">
            {companyOptions.map((company) => (
              <option key={company} value={company} />
            ))}
          </datalist>
          <input
            name="city"
            list="history-city-options"
            defaultValue={selectedCity}
            placeholder="Filter city"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
          />
          <datalist id="history-city-options">
            {cityOptions.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
          <input
            name="designation"
            list="history-designation-options"
            defaultValue={selectedDesignation}
            placeholder="Filter designation"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
          />
          <datalist id="history-designation-options">
            {designationOptions.map((designation) => (
              <option key={designation} value={designation} />
            ))}
          </datalist>
          <button
            type="submit"
            className="rounded-lg bg-[var(--brand-strong)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand)]"
          >
            Apply Filters
          </button>
        </form>
      </div>

      {groupedCalls.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface-muted)] p-8 text-center text-[var(--muted)]">
          No calls found for current filters.
        </div>
      ) : (
        <div className="space-y-4">
          {groupedCalls.map((group) => (
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
                    {group.calls.length} call{group.calls.length > 1 ? "s" : ""}
                  </span>
                </div>
              </header>

              <div className="overflow-x-auto">
                <table className="w-full table-auto border-collapse text-left">
                  <thead className="bg-white">
                    <tr className="border-b border-[var(--line)]">
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                        Contact Name
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                        Designation
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                        City
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                        Phone Number
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                        Called At
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.calls.map((call) => (
                      <tr
                        key={call.id}
                        className="border-b border-[var(--line)] last:border-b-0 hover:bg-white/70"
                      >
                        <td className="px-4 py-3 text-sm font-semibold text-[var(--ink)]">
                          {call.contactName}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--ink)]">
                          {call.contact?.designation || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--ink)]">
                          {getCityFromAddress(call.contact?.address) || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--ink)]">
                          {call.phoneNumber}
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold text-[var(--muted)]">
                          {formatDate(call.calledAt)}
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
