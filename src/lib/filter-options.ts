import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

type FilterOptions = {
  companyOptions: string[];
  cityOptions: string[];
  designationOptions: string[];
};

function normalizeValue(value: string | null | undefined) {
  return (value ?? "").trim();
}

function uniqueSorted(values: Array<string | null | undefined>) {
  const normalizedMap = new Map<string, string>();

  for (const value of values) {
    const normalizedValue = normalizeValue(value);
    if (!normalizedValue) {
      continue;
    }

    const key = normalizedValue.toLowerCase();
    if (!normalizedMap.has(key)) {
      normalizedMap.set(key, normalizedValue);
    }
  }

  return Array.from(normalizedMap.values()).sort((a, b) =>
    a.localeCompare(b, "en", { sensitivity: "base" })
  );
}

export function getCityFromAddress(address: string | null | undefined) {
  const normalizedAddress = normalizeValue(address);
  if (!normalizedAddress) {
    return "";
  }

  const parts = normalizedAddress
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return "";
  }

  return parts[parts.length - 1];
}

const getContactFilterOptionsCached = unstable_cache(
  async (): Promise<FilterOptions> => {
    const [organizations, designations, addresses] = await Promise.all([
      prisma.contact.findMany({
        where: { organization: { not: null } },
        select: { organization: true },
        distinct: ["organization"],
        orderBy: { organization: "asc" },
      }),
      prisma.contact.findMany({
        where: { designation: { not: null } },
        select: { designation: true },
        distinct: ["designation"],
        orderBy: { designation: "asc" },
      }),
      prisma.contact.findMany({
        where: { address: { not: null } },
        select: { address: true },
        distinct: ["address"],
        orderBy: { address: "asc" },
      }),
    ]);

    return {
      companyOptions: uniqueSorted(organizations.map((item) => item.organization)),
      cityOptions: uniqueSorted(addresses.map((item) => getCityFromAddress(item.address))),
      designationOptions: uniqueSorted(designations.map((item) => item.designation)),
    };
  },
  ["contact-filter-options"],
  {
    tags: ["contact-filters"],
    revalidate: 300,
  }
);

const getCallHistoryFilterOptionsCached = unstable_cache(
  async (): Promise<FilterOptions> => {
    const [organizations, contactedDesignations, contactedAddresses] = await Promise.all([
      prisma.callHistory.findMany({
        where: { organization: { not: null } },
        select: { organization: true },
        distinct: ["organization"],
        orderBy: { organization: "asc" },
      }),
      prisma.contact.findMany({
        where: {
          callHistory: { some: {} },
          designation: { not: null },
        },
        select: { designation: true },
        distinct: ["designation"],
        orderBy: { designation: "asc" },
      }),
      prisma.contact.findMany({
        where: {
          callHistory: { some: {} },
          address: { not: null },
        },
        select: { address: true },
        distinct: ["address"],
        orderBy: { address: "asc" },
      }),
    ]);

    return {
      companyOptions: uniqueSorted(organizations.map((item) => item.organization)),
      cityOptions: uniqueSorted(
        contactedAddresses.map((item) => getCityFromAddress(item.address))
      ),
      designationOptions: uniqueSorted(
        contactedDesignations.map((item) => item.designation)
      ),
    };
  },
  ["call-history-filter-options"],
  {
    tags: ["call-history-filters"],
    revalidate: 300,
  }
);

export async function getContactFilterOptions() {
  return getContactFilterOptionsCached();
}

export async function getCallHistoryFilterOptions() {
  return getCallHistoryFilterOptionsCached();
}
