"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { createFinancialRecordAction } from "@/app/actions/financial-records";
import { Account } from "@/lib/schemas/accounts";
import { Category } from "@/lib/schemas/categories";
import { FinancialRecord, FinancialRecordKind } from "@/lib/schemas/financial-records";
import styles from "./FinancialRecordsView.module.css";

interface Props { initialRecords: FinancialRecord[]; accounts: Account[]; categories: Category[]; }
function money(amount: number, currency: string) { return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount / 100); }

export function FinancialRecordsView({ initialRecords, accounts, categories }: Props) {
  const [records, setRecords] = useState(initialRecords);
  const [kind, setKind] = useState<FinancialRecordKind>("expense");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState(""); const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null); const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState({ kind: "", accountId: "", categoryId: "", start: "", end: "" });
  const activeAccounts = accounts.filter((account) => account.is_active);
  const matchingCategories = categories.filter((category) => category.is_active && category.type === kind);
  const account = accounts.find((item) => item.id === accountId);
  const visibleRecords = useMemo(() => records.filter((record) => (!filters.kind || record.kind === filters.kind) && (!filters.accountId || record.account_id === filters.accountId) && (!filters.categoryId || record.category_id === filters.categoryId) && (!filters.start || record.date.slice(0, 10) >= filters.start) && (!filters.end || record.date.slice(0, 10) <= filters.end)), [records, filters]);
  const nameFor = (id: string, items: { id: string; name: string }[]) => items.find((item) => item.id === id)?.name || "Unknown";
  const submit = (event: FormEvent) => { event.preventDefault(); setError(null); const amountMinor = Math.round(Number(amount) * 100); if (!accountId || !categoryId || !account || !Number.isFinite(amountMinor) || amountMinor < 1) { setError("Choose an account and matching category, then enter an amount greater than zero."); return; }
    startTransition(async () => { const result = await createFinancialRecordAction({ kind, account_id: accountId, category_id: categoryId, amount_minor: amountMinor, currency: account.currency, date: new Date(`${date}T12:00:00`).toISOString(), note }); if (!result.success) { setError(result.error); return; } setRecords((current) => [result.record, ...current]); setAmount(""); setNote(""); }); };
  return <div className={styles.view}>
    <section className={styles.entry} aria-labelledby="entry-title"><div><p className={styles.eyebrow}>New record</p><h2 id="entry-title">Make this money move count.</h2></div><form onSubmit={submit} noValidate><div className={styles.grid}>
      <label>Type<select value={kind} onChange={(event) => { setKind(event.target.value as FinancialRecordKind); setCategoryId(""); }}><option value="expense">Expense</option><option value="income">Income</option></select></label>
      <label>Account<select value={accountId} onChange={(event) => setAccountId(event.target.value)} required><option value="">Select account</option>{activeAccounts.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.currency})</option>)}</select></label>
      <label>Category<select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} required><option value="">Select {kind} category</option>{matchingCategories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>Amount<input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" required /></label>
      <label>Date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
      <label>Note <span>(optional)</span><input value={note} onChange={(event) => setNote(event.target.value)} maxLength={1000} placeholder="What was this for?" /></label>
    </div>{error && <p role="alert" className={styles.error}>{error}</p>}<button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Save transaction"}</button></form></section>
    <section className={styles.history} aria-labelledby="history-title"><div className={styles.heading}><div><p className={styles.eyebrow}>History</p><h2 id="history-title">Your cash flow, in context.</h2></div><span>{visibleRecords.length} records</span></div><div className={styles.filters} aria-label="Filter transactions"><select aria-label="Filter by type" value={filters.kind} onChange={(event) => setFilters({ ...filters, kind: event.target.value })}><option value="">All types</option><option value="income">Income</option><option value="expense">Expenses</option></select><select aria-label="Filter by account" value={filters.accountId} onChange={(event) => setFilters({ ...filters, accountId: event.target.value })}><option value="">All accounts</option>{accounts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><select aria-label="Filter by category" value={filters.categoryId} onChange={(event) => setFilters({ ...filters, categoryId: event.target.value })}><option value="">All categories</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><input aria-label="Start date" type="date" value={filters.start} onChange={(event) => setFilters({ ...filters, start: event.target.value })}/><input aria-label="End date" type="date" value={filters.end} onChange={(event) => setFilters({ ...filters, end: event.target.value })}/></div>
    <div className={styles.list}>{visibleRecords.map((record) => <article key={record.id}><div><strong>{nameFor(record.category_id, categories)}</strong><p>{nameFor(record.account_id, accounts)} · {new Date(record.date).toLocaleDateString()}</p>{record.note && <small>{record.note}</small>}</div><b className={record.kind === "income" ? styles.income : undefined}>{record.kind === "income" ? "+" : "−"}{money(record.amount_minor, record.currency)}</b></article>)}{visibleRecords.length === 0 && <p className={styles.empty}>No transactions match these filters.</p>}</div></section>
  </div>;
}
