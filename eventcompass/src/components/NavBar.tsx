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
          <img src="/upb.svg" alt="UPB Logo" className={styles.mark} />
          <div className={styles.product}>
            <span>Event</span>
            <span>Compass</span>
          </div>
        </div>

        <div className={styles.actions}>
          <div className={styles.menu}>
            <Link href="/home">Home</Link>
            <Link href="/tasks">Tasks</Link>
            <Link href="/event-manager">Event<br/>Manager</Link>
            <Link href="/chat">Chat</Link>
            <ProfileCard />
          </div>
        </div>
      </div>
    </nav>
  );
}
