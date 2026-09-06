import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <p className={styles.eyebrow}>Personal finance, made clear</p>
      <h1>Personal Finance Hub</h1>
      <p className={styles.description}>
        Your private place to understand the whole financial picture. The
        foundation is ready for your accounts, categories, and everyday money
        decisions.
      </p>
      <p className={styles.status}>Getting things ready.</p>
    </main>
  );
}
