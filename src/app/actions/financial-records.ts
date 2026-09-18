"use server";

import { revalidatePath } from "next/cache";
import { withAuth } from "@/lib/session";
import {
  archiveFinancialRecord,
  createFinancialRecord,
  getFinancialRecords,
  updateFinancialRecord,
} from "@/lib/financial-records-service";
import {
  CreateFinancialRecordInput,
  FinancialRecordFilters,
  UpdateFinancialRecordInput,
} from "@/lib/schemas/financial-records";

export async function createFinancialRecordAction(input: CreateFinancialRecordInput) {
  return withAuth(async (token) => {
    const result = await createFinancialRecord(token, input);
    if (result.success) {
      revalidatePath("/transactions");
    }
    return result;
  });
}

export async function getFinancialRecordsAction(filters: FinancialRecordFilters) {
  return withAuth((token) => getFinancialRecords(token, filters));
}

export async function updateFinancialRecordAction(
  id: string,
  input: UpdateFinancialRecordInput,
) {
  return withAuth(async (token) => {
    const result = await updateFinancialRecord(token, id, input);
    if (result.success) {
      revalidatePath("/transactions");
    }
    return result;
  });
}

export async function archiveFinancialRecordAction(id: string) {
  return withAuth(async (token) => {
    const result = await archiveFinancialRecord(token, id);
    if (result.success) {
      revalidatePath("/transactions");
    }
    return result;
  });
}

export async function createTransferAction(input: import("@/lib/schemas/transfers").CreateTransferInput) {
  return withAuth(async (token) => {
    const { createTransfer } = await import("@/lib/transfers-service");
    const result = await createTransfer(token, input);
    if (result.success) {
      revalidatePath("/transactions");
      revalidatePath("/accounts");
    }
    return result;
  });
}

export async function getFXQuoteAction(from: string, to: string, date?: string) {
  return withAuth(async (token) => {
    const { getFXQuote } = await import("@/lib/transfers-service");
    return getFXQuote(token, from, to, date);
  });
}

export async function listTransfersAction(filter?: import("@/lib/transfers-service").ListTransferFilter) {
  return withAuth(async (token) => {
    const { listTransfers } = await import("@/lib/transfers-service");
    return listTransfers(token, filter);
  });
}

export async function getTransferAction(id: string) {
  return withAuth(async (token) => {
    const { getTransfer } = await import("@/lib/transfers-service");
    return getTransfer(token, id);
  });
}


