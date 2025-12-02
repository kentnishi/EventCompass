import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Fab } from "@mui/material";
import { Bot, X, MessageSquare, Lightbulb } from "lucide-react";
import CopilotChat from "./CopilotChat";
import CopilotSuggestions from "./CopilotSuggestions";

interface EventCopilotProps {
    eventPlan: any;
    updatePlan: (field: string, value: any) => void;
    eventId?: string;
}

export default function EventCopilot({ eventPlan, updatePlan, eventId }: EventCopilotProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'chat' | 'suggestions'>('chat');
    const [hasUnreadSuggestions, setHasUnreadSuggestions] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Chat Session State
    const [chatSessions, setChatSessions] = useState<{ id: string, name: string }[]>([]);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [isLoadingChats, setIsLoadingChats] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch chat sessions on mount or when eventId changes
    useEffect(() => {
        if (eventId && isOpen) {
            fetchChatSessions();
        }
    }, [eventId, isOpen]);

    const fetchChatSessions = async () => {
        if (!eventId) return;
        setIsLoadingChats(true);
        try {
            const res = await fetch(`/api/copilot/chats?eventId=${eventId}`);
            if (res.ok) {
                const data = await res.json();
                setChatSessions(data.chats || []);
                // If no active chat, select the most recent one
                if (!activeChatId && data.chats && data.chats.length > 0) {
                    setActiveChatId(data.chats[0].id);
                }
            }
        } catch (error) {
            console.error("Failed to fetch chats:", error);
        } finally {
            setIsLoadingChats(false);
        }
    };

    const handleCreateNewChat = async () => {
        if (!eventId) return;
        try {
            const res = await fetch("/api/copilot/chats", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ eventId, name: `Chat ${chatSessions.length + 1}` })
            });
            if (res.ok) {
                const data = await res.json();
                setChatSessions(prev => [data.chat, ...prev]);
                setActiveChatId(data.chat.id);
            }
        } catch (error) {
            console.error("Failed to create new chat:", error);
        }
    };

    const handleTabChange = (tab: 'chat' | 'suggestions') => {
        setActiveTab(tab);
        if (tab === 'suggestions') {
            setHasUnreadSuggestions(false);
        }
    };

    if (!mounted) return null;

    const portalRoot = document.getElementById('copilot-portal-root') || document.body;

    return createPortal(
        <>
            {/* Side Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl z-[9999] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    } flex flex-col border-l border-slate-300 font-sans`}
            >
                {/* Header */}
                <header className="px-4 py-3 border-b border-indigo-200 bg-[#C8D6F3] flex items-center justify-between z-10">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-white/50 text-indigo-700 flex items-center justify-center">
                            <Bot size={18} />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 text-sm">Event Copilot</h2>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-slate-500 hover:text-slate-700 transition-colors p-1 rounded hover:bg-white/20"
                    >
                        <X size={18} />
                    </button>
                </header>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 bg-slate-50">
                    <button
                        onClick={() => handleTabChange('chat')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wide transition-colors ${activeTab === 'chat' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                    >
                        <MessageSquare size={14} />
                        Chat
                    </button>
                    <button
                        onClick={() => handleTabChange('suggestions')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wide transition-colors ${activeTab === 'suggestions' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                    >
                        <Lightbulb size={14} />
                        Suggestions
                        {hasUnreadSuggestions && (
                            <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded-full ml-1 animate-pulse">New</span>
                        )}
                    </button>
                </div>

                {/* Chat History Header (Only visible in Chat tab) */}
                {activeTab === 'chat' && (
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
                        <select
                            value={activeChatId || ""}
                            onChange={(e) => setActiveChatId(e.target.value)}
                            className="text-xs border border-slate-300 rounded px-2 py-1 max-w-[200px] bg-white"
                        >
                            <option value="" disabled>Select a chat...</option>
                            {chatSessions.map(chat => (
                                <option key={chat.id} value={chat.id}>{chat.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleCreateNewChat}
                            className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700"
                        >
                            New Chat
                        </button>
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-hidden relative bg-white">
                    <div
                        className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 'chat' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                        style={{ visibility: activeTab === 'chat' ? 'visible' : 'hidden' }}
                    >
                        {activeChatId ? (
                            <CopilotChat
                                key={activeChatId} // Force re-mount on chat switch
                                eventPlan={eventPlan}
                                eventId={eventId}
                                updatePlan={updatePlan}
                                chatId={activeChatId}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
                                <MessageSquare size={48} className="mb-4 opacity-20" />
                                <p className="text-sm">Select a chat session or start a new one.</p>
                                <button
                                    onClick={handleCreateNewChat}
                                    className="mt-4 text-sm bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                                >
                                    Start New Chat
                                </button>
                            </div>
                        )}
                    </div>
                    <div
                        className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 'suggestions' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                        style={{ visibility: activeTab === 'suggestions' ? 'visible' : 'hidden' }}
                    >
                        <CopilotSuggestions
                            eventPlan={eventPlan}
                            updatePlan={updatePlan}
                            onSuggestionsFound={() => setHasUnreadSuggestions(true)}
                            eventId={eventId}
                        />
                    </div>
                </div>
            </div>

            {/* Floating Trigger Button (only visible when closed) */}
            <div className={`fixed bottom-8 right-8 z-[9999] transition-transform duration-300 ${isOpen ? 'translate-x-[200%] opacity-0' : 'translate-x-0 opacity-100'}`}>
                <Fab
                    color="primary"
                    aria-label="open copilot"
                    onClick={() => setIsOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                    sx={{
                        width: 64,
                        height: 64,
                        '&:hover': { transform: 'scale(1.05)' },
                        transition: 'transform 0.2s'
                    }}
                >
                    <Bot size={32} />
                </Fab>
            </div>
        </>,
        portalRoot
    );
}
