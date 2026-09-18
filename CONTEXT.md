# Web Cash Flow & Financial Records

The web user interface for managing cash flow, reviewing historical financial activity, and categorizing income and expenses.

## Language

**Financial Record**:
A user-owned entry recording an income or expense cash flow tied to an Account and a Category.
_Avoid_: Transaction, ledger item, entry

**Cash-Flow Summary Metric**:
An aggregated high-level financial statistic (such as Total Inflow, Total Outflow, or Net Cash Flow) displayed to provide orientation before reviewing individual records.
_Avoid_: KPI widget, stats box, balance banner

**Category Icon Avatar**:
A visually distinct, tinted icon container paired with a Financial Record to provide quick visual categorization and scanning rhythm.
_Avoid_: Merchant logo, generic icon, category sticker

**Account Transfer Shortcut**:
An account-anchored action button located within a specific account's table row that initiates a transfer modal with the source account already pre-populated.
_Avoid_: Global transfer trigger, header transfer button, floating transfer action

**Unified Record Creation Action**:
A single top-level `New` action button with an action menu on the Transactions view that allows the user to choose between creating an Income/Expense record or initiating a Transfer, replacing separate unanchored header buttons.
_Avoid_: Dual header buttons, "Add Transaction" + "Add Transfer" split, verbose action label

**Bi-Directional Transfer Input**:
A pair of synchronized input fields for cross-currency transfers where typing into either Source Amount or Destination Amount dynamically calculates the counterpart value using the effective exchange rate, anchored to whichever field was last actively edited, and automatically reconciling minor-unit rounding on blur.
_Avoid_: One-way conversion input, fixed source input, manual calculator entry

