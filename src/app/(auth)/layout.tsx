import type { ReactNode } from "react";
import styles from "./layout.module.css";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className={styles.authContainer}><aside className={styles.storyPanel}><div className={styles.brand}><span>PF</span> Personal Finance Hub</div><div className={styles.story}><p>PRIVATE BY DEFAULT</p><h1>A clearer relationship with your money.</h1><p>Your financial picture belongs to you. Start with an organised, private place to make every decision feel more deliberate.</p></div><div className={styles.orbit} aria-hidden="true"><i /><b>68%<small>home deposit</small></b></div></aside><main className={styles.authMain}>{children}</main></div>;
}
