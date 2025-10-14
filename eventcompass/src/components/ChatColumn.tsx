"use client";

import React from "react";
<<<<<<< HEAD
import styles from "./CompassChat.module.css";
=======
import styles from "../css/CompassChat.module.css";
>>>>>>> 62ca3781628dc17fcb6ef5593ce6091f851ea686
import ReactMarkdown from "react-markdown";

import { IconButton, CircularProgress } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

function Bubble({ children, kind = "assistant" }: { children: React.ReactNode; kind?: "assistant" | "user" }) {
  const cls = kind === "user" ? `${styles.bubble} ${styles.user}` : `${styles.bubble} ${styles.assistant}`;
  
  let content = children as string;

  try {
    // Defensively parse the content. If it's a JSON string of the message object, extract the text.
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === 'object' && parsed.text) {
      content = parsed.text;
    }
  } catch (e) {
    // This is expected for normal text. Do nothing.
  }

<<<<<<< HEAD
=======
  // NOTE: The crucial CSS fix is applied to the .bubble class definition in CompassChat.module.css
>>>>>>> 62ca3781628dc17fcb6ef5593ce6091f851ea686
  if (kind === 'assistant') {
    return <div className={cls}><ReactMarkdown>{content}</ReactMarkdown></div>;
  }
  return <div className={cls}>{content}</div>;
}

export default function ChatColumn({
  messages = [],
  onSend,
  isLoading = false,
}: {
  messages?: { id: string; role: "USER" | "ASSISTANT"; text: string, streaming?: boolean }[];
  onSend?: (text: string) => void;
  isLoading?: boolean;
}) {
  const [text, setText] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    // Auto-scroll to bottom when messages change
    const el = scrollRef.current;
    if (el) {
      // Ensure smooth scroll is used for better UX
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  function handleSend() {
    if (!text.trim() || isLoading) return;
    onSend && onSend(text.trim());
    setText("");
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission if input is wrapped in a form
      handleSend();
    }
  }

  return (
    <section className={styles.chatCol} style={{minWidth: '520px'}}>
      <div className={styles.chatHeader}>COMPASS CHAT</div>
      {/* chatScroll takes up remaining vertical space */}
      <div className={styles.chatScroll} ref={scrollRef}>
        {messages.map((m) => (
          <div key={m.id} className={m.role === "USER" ? styles.rowRight : styles.row}>
            <Bubble kind={m.role === "USER" ? "user" : "assistant"}>{m.text}</Bubble>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <div className={styles.inputWrap}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKey}
            className={styles.input}
            placeholder="Typing prompt...."
            disabled={isLoading}
          />
          <IconButton title="Options" disabled={isLoading} style={{ color: '#666' }}>
            <MoreVertIcon />
          </IconButton>
        </div>
        <button className={`${styles.btn} ${styles.save}`} onClick={handleSend} disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} color="inherit" /> : "Send"}
        </button>
      </div>
    </section>
  );
}
