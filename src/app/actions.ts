"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  CONTACT_CATEGORIES,
  type ContactCategory,
} from "@/lib/contact-categories";

export type SaveContactState = {
  status: "idle" | "success" | "error";
  message: string;
};

export type DeleteContactState = {
  status: "idle" | "success" | "error";
  message: string;
};

const MAX_FIELD_LENGTH = 250;
const MAX_COMMENT_LENGTH = 1000;

function getTrimmedValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function normalizePhoneNumber(phoneNumber: string) {
  return phoneNumber.replace(/\D+/g, "");
}

function isValidPhoneNumber(phoneNumber: string) {
  return /^\d{10}$/.test(phoneNumber);
}

function isValidAlphabeticName(value: string) {
  return /^[A-Za-z][A-Za-z\s.'-]*$/.test(value);
}

export async function saveContact(
  _previousState: SaveContactState,
  formData: FormData
): Promise<SaveContactState> {
  const name = getTrimmedValue(formData, "name");
  const organization = getTrimmedValue(formData, "organization");
  const categoryInput = getTrimmedValue(formData, "category");
  const otherCategoryInput = getTrimmedValue(formData, "otherCategory");
  const rawPhoneNumber = getTrimmedValue(formData, "phoneNumber");
  const designation = getTrimmedValue(formData, "designation");
  const address = getTrimmedValue(formData, "address");
  const comments = getTrimmedValue(formData, "comments");
  const phoneNumber = normalizePhoneNumber(rawPhoneNumber);
  const category = CONTACT_CATEGORIES.includes(categoryInput as ContactCategory)
    ? (categoryInput as ContactCategory)
    : "Others";
  const otherCategory =
    category === "Others" && otherCategoryInput ? otherCategoryInput : "";

  if (!name || !phoneNumber) {
    return {
      status: "error",
      message: "Name and phone number are required.",
    };
  }

  if (!isValidAlphabeticName(name)) {
    return {
      status: "error",
      message: "Name must contain alphabets only.",
    };
  }

  if (!isValidPhoneNumber(rawPhoneNumber)) {
    return {
      status: "error",
      message: "Phone number must be exactly 10 digits.",
    };
  }

  if (category === "Others" && !otherCategory) {
    return {
      status: "error",
      message: "Please specify the category type for Others.",
    };
  }

  if (
    name.length > MAX_FIELD_LENGTH ||
    organization.length > MAX_FIELD_LENGTH ||
    otherCategory.length > MAX_FIELD_LENGTH ||
    phoneNumber.length > MAX_FIELD_LENGTH ||
    designation.length > MAX_FIELD_LENGTH ||
    address.length > MAX_FIELD_LENGTH
  ) {
    return {
      status: "error",
      message: "One or more fields are too long.",
    };
  }

  if (comments.length > MAX_COMMENT_LENGTH) {
    return {
      status: "error",
      message: "Comments can be up to 1000 characters.",
    };
  }

  try {
    await prisma.contact.create({
      data: {
        name,
        organization: organization || null,
        category,
        otherCategory: otherCategory || null,
        phoneNumber,
        designation: designation || null,
        address: address || null,
        comments: comments || null,
      },
    });
  } catch {
    return {
      status: "error",
      message: "Unable to save contact right now. Please try again.",
    };
  }

  revalidatePath("/phonebook");
  revalidateTag("contact-filters", "max");

  return {
    status: "success",
    message: "Contact saved successfully.",
  };
}

export async function deleteContact(
  _previousState: DeleteContactState,
  formData: FormData
): Promise<DeleteContactState> {
  const contactId = getTrimmedValue(formData, "contactId");

  if (!contactId) {
    return {
      status: "error",
      message: "Contact identifier is missing.",
    };
  }

  try {
    await prisma.contact.delete({
      where: { id: contactId },
    });
  } catch {
    return {
      status: "error",
      message: "Unable to delete contact right now. Please try again.",
    };
  }

  revalidatePath("/phonebook");
  revalidatePath("/call-history");
  revalidateTag("contact-filters", "max");
  revalidateTag("call-history-filters", "max");

  return {
    status: "success",
    message: "Contact deleted.",
  };
}
