import React from "react";
import styles from "./CompassChat.module.css";

export default function TopBar({ onCreate }: { onCreate?: () => void }) {
  return (
    <div className={styles.topbar}>
      <div className={styles.title}>Begin Planning</div>
      <div className={styles.selectWrap}>
        <select className={styles.select}>
          <option>General</option>
          <option>Concerts</option>
          <option>On‑Campus</option>
        </select>
      </div>
      <button className={styles.btn} onClick={() => onCreate && onCreate()}>
        Create New Chat
      </button>
    </div>
  );
}
