// src/components/NavBar.tsx
"use client";

import Link from "next/link";
import styles from "../css/NavBar.module.css";
import ProfileCard from "./ProfileCard";

export default function NavBar() {
  return (
    <nav className={styles.nav} aria-label="Main navigation">
      <div className={styles.wrap}>
        <div className={styles.brand}>
          <img src="/compass.svg" alt="Event Compass Logo" className={styles.mark} />
          <div className={styles.product}>
            <span>Event</span>
            <span>Compass</span>
          </div>
        </div>

        <div className={styles.actions}>
          <div className={styles.menu}>
            <Link href="/home">Home</Link>
            <Link href="/event-plans">Event Plans</Link>
            <Link href="/events">Events</Link>
            <ProfileCard />
          </div>
        </div>
      </div>
    </nav>
  );
}
