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
