import React from "react";
import styles from "../css/CompassChat.module.css";

export default function TopBar({ onCreate }: { onCreate?: () => void }) {
  return (
    <div className={styles.topbar}>
      <div className={styles.left}>
        <div className={styles.title}>Begin Planning</div>
      </div>

      <div className={styles.right}>
        <div className={styles.selectWrap}>
          <select className={styles.select}>
            <option>General</option>
            <option>Concerts</option>
            <option>On-Campus</option>
          </select>
        </div>
        <button className={styles.btn} onClick={() => onCreate && onCreate()}>
          Create New Chat
        </button>
      </div>
    </div>

  );
}
