"use client";

import React from "react";
// Assuming these components exist and function correctly
import TopBar from "./Topbar";
import LeftRail from "./LeftRail";
import ChatColumn from "./ChatColumn";
import EventColumn from "./EventColumn";
import styles from "../css/CompassChat.module.css";
import EditIcon from "@mui/icons-material/Edit"; // Importing an icon for the "New Event" title
import useMediaQuery from "@mui/material/useMediaQuery";

type Message = { id: string; role: "USER" | "ASSISTANT"; text: string, streaming?: boolean };
type Chat = { id: string; name: string };

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

export default function CompassChat() {
  const [savedChats, setSavedChats] = React.useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = React.useState<string>("");
  const [activeChatMessages, setActiveChatMessages] = React.useState<Message[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const isSmall = useMediaQuery("(max-width: 900px)"); 
  const [isRailVisible, setIsRailVisible] = React.useState(true);
  const railExpanded = isRailVisible;
  const [selectedEventType, setSelectedEventType] = React.useState<string>("New Event"); // State for the dropdown
  const [hasInteracted, setHasInteracted] = React.useState(false);


  // --- Utility Functions (handleCreateNew, useEffects, etc. - unchanged logic) ---

  const handleCreateNew = React.useCallback(() => {
    (async () => {
      try {
        setError(null);
        // Using dynamic route segment in fetch calls (replace /api/chats with actual path)
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

  React.useEffect(() => {
    if (isSmall) {
      setIsRailVisible(false); // always collapse when small
    }
  }, [isSmall]);

  React.useEffect(() => {
    if (!hasInteracted) {
      setIsRailVisible(!isSmall);   // small => false, large => true
    }
  }, [isSmall, hasInteracted]);

  const toggleRail = React.useCallback(() => {
    setIsRailVisible(v => !v);
    setHasInteracted(true);
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
        // Using dynamic route segment in fetch calls
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
      // Using dynamic route segment in fetch calls
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
      // Using dynamic route segment in fetch calls
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
      // Using dynamic route segment in fetch calls
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
      <div className={styles.shell} style={{ minWidth: '1035px', marginBottom: '80px' }}>

        {/* Header Row for Controls (Begin Planning / New Event) */}
        <div className={styles.headerRow} style={{
          display: 'grid',
          gridTemplateColumns: '60% 40%', // Split columns to match the visual ratio
          padding: '0 20px',
          marginBottom: '10px'
        }}>
          {/* Left Side: Planning Controls */}
          <div className={styles.planningControls} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TopBar onCreate={handleCreateNew} />
          </div>

          {/* Right Side: Event Column Header */}
          <div className={styles.eventColumnHeader} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingLeft: '30px'
          }}>
            <h2 className={styles.title}>
              New Event
              {/* Pencil icon for editing title, using EditIcon from MUI */}
              <EditIcon style={{ fontSize: '1.2rem', marginLeft: '8px', color: '#666' }} />
            </h2>
          </div>
        </div>

        {/* Main Two-Column Split Content */}
        <div className={styles.twoColumnContainer} style={{
          display: 'grid',
          gridTemplateColumns: '60% 40%',
          gap: '20px',
          padding: '0 20px',
          height: 'calc(100vh - 120px)', // Account for topbar and headerRow height
          marginBottom: '80px'
        }}>

          <div className={styles.chatSection} style={{
            display: 'grid',
            gridTemplateColumns: railExpanded ? '280px 1fr' : '56px 1fr',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            borderRadius: '8px',
            overflow: 'hidden' // Ensures the rail and chat fit within the rounded container
          }}>
            <LeftRail
              savedChats={savedChats}
              activeId={activeChatId}
              onSelect={handleSelectChat}
              onRename={handleRenameChat}
              onDelete={handleDeleteChat}
              isRailVisible={railExpanded}
              onToggleVisibility={toggleRail} 
            />
            <ChatColumn messages={activeChatMessages} onSend={handleSendMessage} isLoading={isLoading} />
          </div>

          {/* Right Side: Event Column (The form) */}
          <div className={styles.eventSection}>
            <EventColumn />
          </div>
        </div>

        {error && <div className={styles.errorBanner}>{error} <button onClick={() => setError(null)}>X</button></div>}
      </div>
    </main>
  );
}
