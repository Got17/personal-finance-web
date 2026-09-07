import styles from "./page.module.css";

const accounts = [["C", "Everyday cash", "Checking · •• 4260", "$4,284.70"], ["S", "Future fund", "Savings · •• 8104", "$8,600.00"], ["I", "Long view", "Investment · •• 1198", "$15,565.50"]];

export default async function HomePage() {
  return <div className={styles.container}>
    <header className={styles.pageHeader}><div><p className={styles.eyebrow}>Saturday, September 6</p><h1>Your money, in focus.</h1></div><button className={styles.addButton} type="button">+ Add transaction</button></header>
    <section className={styles.heroGrid} id="overview" aria-label="Financial overview">
      <article className={styles.netWorthCard}><div className={styles.cardHeader}><span>Net worth</span><span className={styles.period}>All accounts</span></div><p className={styles.netWorth}>$28,450.20</p><p className={styles.positive}>↑ $1,284.35 <span>this month</span></p><div className={styles.chart} aria-label="Net worth increased over the last six months"><span /><span /><span /><span /><span /><span /></div></article>
      <article className={styles.summaryCard}><p>Available to spend</p><strong>$1,840.00</strong><small>After planned bills and goals</small><div className={styles.divider} /><p>Upcoming bills</p><strong className={styles.smallValue}>$642.30</strong><small>Due in the next 14 days</small></article>
      <article className={styles.goalCard} id="goals"><p className={styles.overline}>Goal in progress</p><h2>Home deposit</h2><div className={styles.goalVisual}><span>68%</span></div><p><strong>$13,600</strong> of $20,000</p><small>On track for May 2027</small></article>
    </section>
    <section className={styles.detailGrid}>
      <article className={styles.panel} id="accounts"><div className={styles.panelHeading}><div><p className={styles.overline}>Accounts</p><h2>Where your money lives</h2></div><a href="/accounts">View all</a></div><div className={styles.accountList}>{accounts.map(([mark, name, detail, balance]) => <div key={name}><span className={styles.accountIcon}>{mark}</span><p>{name}<small>{detail}</small></p><strong>{balance}</strong></div>)}</div></article>
      <article className={styles.panel} id="budget"><div className={styles.panelHeading}><div><p className={styles.overline}>September plan</p><h2>Spend with intention</h2></div><a href="#budget">Details</a></div><BudgetItem label="Home & utilities" value="$1,120 / $1,400" percent="80%" /><BudgetItem label="Food & dining" value="$482 / $600" percent="62%" /><BudgetItem label="Personal" value="$165 / $300" percent="40%" /><p className={styles.insight}><span>↗</span> Dining is 18% above your usual pace. You still have room to adjust this month.</p></article>
    </section>
    <section className={styles.activityPanel} id="transactions"><div className={styles.panelHeading}><div><p className={styles.overline}>Recent activity</p><h2>Small decisions, clear picture</h2></div><a href="#transactions">All transactions</a></div><Activity mark="M" name="Morning Market" detail="Today · Groceries" amount="−$42.68" /><Activity mark="N" name="Northside Coffee" detail="Yesterday · Dining" amount="−$4.80" /><Activity mark="P" name="Payroll deposit" detail="Sep 1 · Income" amount="+$3,850.00" positive /></section>
  </div>;
}

function BudgetItem({ label, value, percent }: { label: string; value: string; percent: string }) { return <div className={styles.budgetItem}><p>{label}<span>{value}</span></p><i><b style={{ width: percent }} /></i></div>; }
function Activity({ mark, name, detail, amount, positive }: { mark: string; name: string; detail: string; amount: string; positive?: boolean }) { return <div className={styles.activityRow}><span className={styles.storeMark}>{mark}</span><p>{name}<small>{detail}</small></p><strong className={positive ? styles.income : undefined}>{amount}</strong></div>; }
