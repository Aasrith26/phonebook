import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";

type CallPayload = {
  contactId?: string;
  contactName?: string;
  organization?: string;
  phoneNumber?: string;
};

function normalizePhoneNumber(value: string) {
  return value.replace(/\D+/g, "");
}

export async function POST(request: Request) {
  let payload: CallPayload;

  try {
    payload = (await request.json()) as CallPayload;
  } catch {
    return Response.json({ ok: false, message: "Invalid payload." }, { status: 400 });
  }

  const contactId = typeof payload.contactId === "string" ? payload.contactId.trim() : "";
  const contactName =
    typeof payload.contactName === "string" ? payload.contactName.trim() : "";
  const organization =
    typeof payload.organization === "string" ? payload.organization.trim() : "";
  const phoneNumber =
    typeof payload.phoneNumber === "string"
      ? normalizePhoneNumber(payload.phoneNumber)
      : "";

  if (!contactName || !phoneNumber) {
    return Response.json(
      { ok: false, message: "contactName and phoneNumber are required." },
      { status: 400 }
    );
  }

  try {
    const entry = await prisma.callHistory.create({
      data: {
        contactId: contactId || null,
        contactName,
        organization: organization || null,
        phoneNumber,
      },
    });
    revalidatePath("/call-history");
    revalidateTag("call-history-filters", "max");

    return Response.json({ ok: true, id: entry.id });
  } catch {
    return Response.json(
      { ok: false, message: "Unable to record call history." },
      { status: 500 }
    );
  }
}
