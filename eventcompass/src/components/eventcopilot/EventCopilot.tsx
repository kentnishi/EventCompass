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

    useEffect(() => {
        setMounted(true);
    }, []);

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

                {/* Content Area */}
                <div className="flex-1 overflow-hidden relative bg-white">
                    <div
                        className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 'chat' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                        style={{ visibility: activeTab === 'chat' ? 'visible' : 'hidden' }}
                    >
                        <CopilotChat eventPlan={eventPlan} eventId={eventId} updatePlan={updatePlan} />
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
