"use client";

import React from "react";
import TopBar from "./Topbar";
import LeftRail from "./LeftRail";
import ChatColumn from "./ChatColumn";
import styles from "../css/CompassChat.module.css";

type Message = { id: string; role: "USER" | "ASSISTANT"; text: string, streaming?: boolean };
// The main Chat type no longer needs to hold all messages
type Chat = { id: string; name: string };

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

export default function CompassChat() {
  const [savedChats, setSavedChats] = React.useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = React.useState<string>("");
  const [activeChatMessages, setActiveChatMessages] = React.useState<Message[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null); // For UI error reporting
  const [isRailVisible, setIsRailVisible] = React.useState(true);

  const handleCreateNew = React.useCallback(() => {
    (async () => {
      try {
        setError(null);
        const res = await fetch(`/api/chats`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "New Chat", messages: [] }),
        });
        if (!res.ok) {
          setError("Failed to create a new chat.");
          return;
        }
        const created = await res.json();
        setSavedChats((prev) => [created, ...prev]);
        setActiveChatId(created.id);
      } catch (e) {
        const newChat: Chat = { id: makeId(), name: "New Chat" };
        setSavedChats((prev) => [newChat, ...prev]);
        setActiveChatId(newChat.id);
      }
    })();
  }, []);

  // Load chats from the API on mount
  React.useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/chats");
        if (!res.ok) {
          if (mounted) setError("Failed to load chats.");
          return;
        }
        const data = await res.json();
        if (mounted) {
          if (Array.isArray(data) && data.length > 0) {
            setSavedChats(data);
            setActiveChatId(data[0].id);
          } else {
            handleCreateNew();
          }
        }
      } catch (e) {
        if (mounted) setError("Failed to connect to the server.");
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [handleCreateNew]);

  // Fetch messages for the active chat whenever the activeChatId changes
  React.useEffect(() => {
    if (!activeChatId) {
      setActiveChatMessages([]);
      return;
    }
    let mounted = true;
    async function loadMessages() {
      try {
        setError(null);
        const res = await fetch(`/api/chats/${activeChatId}/messages`);
        if (!res.ok) {
          if (mounted) setError("Failed to load messages for this chat.");
          return;
        }
        const data = await res.json();
        if (mounted && data && Array.isArray(data.messages)) {
          setActiveChatMessages(data.messages);
        }
      } catch (e) {
        if (mounted) setError("Failed to connect to the server.");
      }
    }
    loadMessages();
    return () => {
      mounted = false;
    };
  }, [activeChatId]);

  function handleSelectChat(id: string) {
    setActiveChatId(id);
  }

  async function handleRenameChat(chatId: string, newName: string) {
    const oldName = savedChats.find(c => c.id === chatId)?.name || "Chat";
    // Optimistically update the UI
    setSavedChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, name: newName } : c)));

    try {
      const res = await fetch(`/api/chats/${chatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      if (!res.ok) {
        setError("Failed to rename chat.");
        // Revert optimistic update
        setSavedChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, name: oldName } : c)));
      }
    } catch (e) {
      setError("Failed to connect to server to rename chat.");
      // Revert optimistic update
      setSavedChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, name: oldName } : c)));
    }
  }

  async function handleDeleteChat(chatId: string) {
    const originalChats = savedChats;
    
    // Optimistically remove the chat
    setSavedChats((prev) => prev.filter((c) => c.id !== chatId));

    // If the active chat is being deleted, select a new one
    if (activeChatId === chatId) {
      const remainingChats = originalChats.filter((c) => c.id !== chatId);
      if (remainingChats.length > 0) {
        setActiveChatId(remainingChats[0].id);
      } else {
        handleCreateNew();
      }
    }

    try {
      const res = await fetch(`/api/chats/${chatId}`, { method: "DELETE" });
      if (!res.ok) {
        setError("Failed to delete chat.");
        // Revert optimistic update
        setSavedChats(originalChats);
      }
    } catch (e) {
      setError("Failed to connect to server to delete chat.");
      // Revert optimistic update
      setSavedChats(originalChats);
    }
  }

  async function handleSendMessage(text: string) {
    if (!text.trim() || !activeChatId || isLoading) return;

    const userMsg: Message = { id: makeId(), role: "USER", text };
    const placeholderAiMsg: Message = { id: makeId(), role: "ASSISTANT", text: "..." };

    setError(null);
    setActiveChatMessages((prev) => [...prev, userMsg, placeholderAiMsg]);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/chats/${activeChatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: { text: userMsg.text } }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "An unknown error occurred" }));
        throw new Error(errorData.error);
      }

      const finalAiMessage: Message = await res.json();

      setActiveChatMessages((prev) =>
        prev.map((m) => (m.id === placeholderAiMsg.id ? finalAiMessage : m))
      );

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to connect to the server.";
      setError(errorMessage);
      setActiveChatMessages((prev) => prev.filter(m => m.id !== userMsg.id && m.id !== placeholderAiMsg.id));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main>
      <TopBar onCreate={handleCreateNew} />
      <div className={styles.shell}>
        <div className={styles.panel} style={{ gridTemplateColumns: isRailVisible ? '280px 1fr' : 'auto 1fr' }}>
          <LeftRail 
            savedChats={savedChats} 
            activeId={activeChatId} 
            onSelect={handleSelectChat} 
            onRename={handleRenameChat} 
            onDelete={handleDeleteChat} 
            isRailVisible={isRailVisible}
            onToggleVisibility={() => setIsRailVisible(!isRailVisible)}
          />
          <ChatColumn messages={activeChatMessages} onSend={handleSendMessage} isLoading={isLoading} />
        </div>
        {error && <div className={styles.errorBanner}>{error} <button onClick={() => setError(null)}>X</button></div>}
      </div>
    </main>
  );
}