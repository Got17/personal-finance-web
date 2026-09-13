"use server";

import { revalidatePath } from "next/cache";
import { withAuth } from "@/lib/session";
import { createFinancialRecord, getFinancialRecords } from "@/lib/financial-records-service";
import { CreateFinancialRecordInput, FinancialRecordFilters } from "@/lib/schemas/financial-records";

export async function createFinancialRecordAction(input: CreateFinancialRecordInput) {
  return withAuth(async (token) => {
    const result = await createFinancialRecord(token, input);
    if (result.success) revalidatePath("/transactions");
    return result;
  });
}

export async function getFinancialRecordsAction(filters: FinancialRecordFilters) {
  return withAuth((token) => getFinancialRecords(token, filters));
}
