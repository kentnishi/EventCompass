import Link from "next/link";
import styles from "../css/NavBar.module.css";

export default function NavBar() {
  return (
    <nav className={styles.nav} aria-label="Main navigation">
      <div className={styles.wrap}>
        <div className={styles.brand}>
          <img src="/upb.svg" alt="UPB Logo" className={styles.mark} />
          <div className={styles.product}>
            <span>Event</span>
            <span>Compass</span>
          </div>
        </div>

        <div className={styles.actions}>
          <div className={styles.menu}>
            <Link href="/">Home</Link>
            <Link href="/tasks">Tasks</Link>
            <Link href="/event-manager">Event<br/>Manager</Link>
            <Link href="/chat">Chat</Link>
            <Link href="/events">Events</Link>
          </div>

          <div className={styles.avatar} title="Profile">
            <Link href="/auth"></Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
