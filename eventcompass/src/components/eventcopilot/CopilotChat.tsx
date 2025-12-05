"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bot, Send, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Components } from "react-markdown";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

interface CopilotChatProps {
    eventPlan: any;
    eventId?: string;
    updatePlan: (field: string, value: any) => void;
    chatId: string;
    onRefresh?: () => void;
    onNavigate?: (tab: string) => void;
}

const Badge = ({ type, children }: { type: string, children: React.ReactNode }) => {
    const styles: Record<string, string> = {
        task: "bg-orange-100 text-orange-700 border-orange-200",
        schedule: "bg-blue-100 text-blue-700 border-blue-200",
        activity: "bg-purple-100 text-purple-700 border-purple-200",
        budget: "bg-emerald-100 text-emerald-700 border-emerald-200",
        shopping: "bg-pink-100 text-pink-700 border-pink-200",
        agent_action: "bg-indigo-100 text-indigo-700 border-indigo-200",
        default: "bg-gray-100 text-gray-700 border-gray-200"
    };

    const className = styles[type.toLowerCase()] || styles.default;

    return (
        <span className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-1 rounded border ${className}`}>
            {children === "agent_action" ? "AGENT" : children}
        </span>
    );
};

export default function CopilotChat({ eventPlan, eventId, updatePlan, chatId, onRefresh, onNavigate }: CopilotChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [applyingSuggestion, setApplyingSuggestion] = useState<string | null>(null);
    const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch messages when chatId changes
    useEffect(() => {
        const fetchMessages = async () => {
            if (!chatId) return;
            setIsLoading(true);
            try {
                const res = await fetch(`/api/copilot/chat?chatId=${chatId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.messages && data.messages.length > 0) {
                        setMessages(data.messages);
                    } else {
                        // Default welcome message if empty
                        setMessages([
                            {
                                id: "welcome",
                                role: "assistant",
                                content: "Hi! I'm your event planning assistant. I can help you with ideas, budget, or tasks based on your current plan. What's on your mind?"
                            }
                        ]);
                    }
                }
            } catch (error) {
                console.error("Failed to load messages:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessages();
    }, [chatId]);

    const handleApplySuggestion = async (suggestion: any) => {
        if (applyingSuggestion || appliedSuggestions.has(suggestion.title)) return;
        setApplyingSuggestion(suggestion.title);

        try {
            let endpoint = "";
            let body: any = {};
            let method = "POST";
            let targetTab = "overview";

            if (suggestion.type === "agent_action") {
                endpoint = "/api/copilot/agent";
                body = {
                    goal: suggestion.actionData.goal,
                    eventId,
                    eventContext: eventPlan
                };
            } else {
                switch (suggestion.type) {
                    case "task":
                        endpoint = `/api/event-plans/${eventId}/tasks`;
                        targetTab = "tasks";
                        body = {
                            title: suggestion.actionData.title || suggestion.title || "Untitled Task",
                            due_date: suggestion.actionData.due_date || null,
                            status: suggestion.actionData.status || "todo",
                            assignee_name: suggestion.actionData.assignee_name || "",
                            priority: suggestion.actionData.priority || "medium",
                            description: suggestion.actionData.description || suggestion.description || ""
                        };
                        break;

                    case "budget":
                        endpoint = `/api/event-plans/${eventId}/budget`;
                        targetTab = "budget";
                        body = {
                            category: suggestion.actionData.category || "Miscellaneous",
                            allocated: suggestion.actionData.allocated || suggestion.actionData.amount || suggestion.actionData.cost || 0,
                            description: suggestion.actionData.description || suggestion.actionData.item || suggestion.title || "Budget item",
                            spent: suggestion.actionData.spent || 0,
                            notes: suggestion.actionData.notes || ""
                        };
                        break;

                    case "activity":
                        endpoint = `/api/event-plans/${eventId}/activities`;
                        targetTab = "activities";
                        body = {
                            name: suggestion.actionData.name || suggestion.actionData.title || suggestion.title || "Untitled Activity",
                            description: suggestion.actionData.description || suggestion.description || "",
                            location: suggestion.actionData.location || "",
                            start_time: suggestion.actionData.start_time || null,
                            end_time: suggestion.actionData.end_time || null,
                            cost: suggestion.actionData.cost || suggestion.actionData.price || 0,
                            notes: suggestion.actionData.notes || ""
                        };
                        break;

                    case "shopping":
                        endpoint = `/api/event-plans/${eventId}/shopping`;
                        targetTab = "shopping";

                        if (suggestion.actionData.items && Array.isArray(suggestion.actionData.items)) {
                            // Handle bulk items
                            body = suggestion.actionData.items.map((item: any) => {
                                // Resolve budget_id for each item
                                let budgetId = item.budget_id;
                                if (!budgetId && eventPlan.budget_items && eventPlan.budget_items.length > 0) {
                                    const category = item.category || "Miscellaneous";
                                    const match = eventPlan.budget_items.find((b: any) => b.category.toLowerCase() === category.toLowerCase());
                                    if (match) {
                                        budgetId = match.id;
                                    } else {
                                        budgetId = eventPlan.budget_items[0].id;
                                    }
                                }

                                return {
                                    item: item.item || item.name || "Shopping Item",
                                    quantity: parseInt(item.quantity) || 1,
                                    unit_cost: parseFloat(item.unit_cost) || parseFloat(item.cost) || parseFloat(item.price) || 0,
                                    vendor: item.vendor || "",
                                    status: item.status || "pending",
                                    notes: item.notes || "",
                                    category: item.category || "General",
                                    url: item.url || "",
                                    event_id: eventId,
                                    budget_id: budgetId
                                };
                            });
                        } else {
                            // Handle single item
                            let budgetId = suggestion.actionData.budget_id;
                            if (!budgetId && eventPlan.budget_items && eventPlan.budget_items.length > 0) {
                                const category = suggestion.actionData.category || "Miscellaneous";
                                const match = eventPlan.budget_items.find((b: any) => b.category.toLowerCase() === category.toLowerCase());
                                if (match) {
                                    budgetId = match.id;
                                } else {
                                    budgetId = eventPlan.budget_items[0].id;
                                }
                            }

                            body = {
                                item: suggestion.actionData.item || suggestion.actionData.name || suggestion.title || "Shopping Item",
                                quantity: parseInt(suggestion.actionData.quantity) || 1,
                                unit_cost: parseFloat(suggestion.actionData.unit_cost) || parseFloat(suggestion.actionData.cost) || parseFloat(suggestion.actionData.price) || 0,
                                vendor: suggestion.actionData.vendor || "",
                                status: suggestion.actionData.status || "pending",
                                notes: suggestion.actionData.notes || "",
                                category: suggestion.actionData.category || "General",
                                url: suggestion.actionData.url || "",
                                event_id: eventId,
                                budget_id: budgetId
                            };
                        }
                        break;

                    case "schedule":
                        endpoint = `/api/event-plans/${eventId}/schedule`;
                        targetTab = "schedule";
                        body = {
                            start_time: suggestion.actionData.start_time || "09:00",
                            end_time: suggestion.actionData.end_time || "10:00",
                            activity_name: suggestion.actionData.activity_name || suggestion.actionData.name || suggestion.title || "Scheduled Item",
                            location: suggestion.actionData.location || "",
                            description: suggestion.actionData.description || suggestion.description || "",
                            notes: suggestion.actionData.notes || "",
                            start_date: suggestion.actionData.start_date || eventPlan.event_basics?.start_date,
                            event_id: eventId
                        };
                        break;

                    default:
                        console.log("Unknown suggestion type", suggestion.type);
                        setApplyingSuggestion(null);
                        return;
                }
            }

            // Log payload for verification (specifically for schedule and budget as requested)
            if (suggestion.type === "schedule" || suggestion.type === "budget") {
                console.log(`[VERIFY] Applying ${suggestion.type} suggestion:`, body);
            }

            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                const data = await res.json();

                // Mark as applied in local state
                setAppliedSuggestions(prev => new Set(prev).add(suggestion.title));

                // If agent returned a summary, update the suggestion in the message history
                if (suggestion.type === "agent_action" && data.summary) {
                    console.log("Received agent summary:", data.summary);
                    setMessages(prev => {
                        const newMessages = [...prev];
                        // Find the message containing this suggestion
                        let found = false;
                        for (let i = newMessages.length - 1; i >= 0; i--) {
                            if (newMessages[i].role === "assistant" && newMessages[i].content.includes(suggestion.title)) {
                                console.log("Found matching message for summary injection at index:", i);
                                const msg = newMessages[i];
                                // Parse the JSON content from the message
                                const jsonMatch = msg.content.match(/```(?:json|suggestion)\n([\s\S]*?)\n```/);
                                if (jsonMatch) {
                                    try {
                                        const jsonContent = JSON.parse(jsonMatch[1]);
                                        // Inject the summary
                                        jsonContent.agentSummary = data.summary;
                                        // Reconstruct the message
                                        const newContent = msg.content.replace(
                                            jsonMatch[0],
                                            "```suggestion\n" + JSON.stringify(jsonContent, null, 2) + "\n```"
                                        );
                                        newMessages[i] = { ...msg, content: newContent };
                                        found = true;
                                        console.log("Successfully injected summary into message");
                                    } catch (e) {
                                        console.error("Failed to update suggestion with summary", e);
                                    }
                                } else {
                                    console.log("No JSON block found in message for summary injection");
                                }
                                break;
                            }
                        }
                        if (!found) console.log("Could not find message to inject summary. Suggestion title:", suggestion.title);
                        return newMessages;
                    });
                } else if (suggestion.type === "agent_action") {
                    console.log("No summary returned from agent API", data);
                }

                if (onRefresh) onRefresh();
                if (onNavigate && suggestion.type !== "agent_action") onNavigate(targetTab);
            } else {
                throw new Error("Failed to save to database");
            }

        } catch (e) {
            console.error("Failed to apply suggestion", e);
            alert("Could not apply suggestion automatically.");
        } finally {
            setApplyingSuggestion(null);
        }
    };

    const renderers: Components = {
        code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isSuggestion = match && match[1] === 'suggestion';

            if (isSuggestion) {
                try {
                    const content = String(children).replace(/\n$/, '');
                    const suggestion = JSON.parse(content);
                    const typeLabel = suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1);
                    const isApplying = applyingSuggestion === suggestion.title;
                    const isApplied = appliedSuggestions.has(suggestion.title);

                    return (
                        <div className="w-full max-w-xs mt-2 whitespace-normal font-sans">
                            <div className="bg-white border border-slate-200 rounded-md p-3 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-slate-500 uppercase">Suggestion</span>
                                    <Badge type={suggestion.type}>{suggestion.type}</Badge>
                                </div>
                                <h4 className="text-sm font-semibold text-slate-800 mb-1">{suggestion.title}</h4>
                                <p className="text-xs text-slate-600 mb-3">{suggestion.explanation || suggestion.description}</p>
                                <button
                                    onClick={() => handleApplySuggestion(suggestion)}
                                    disabled={!!applyingSuggestion || isApplied}
                                    className={`w-full text-white text-xs font-semibold py-2 rounded shadow-sm transition-colors flex items-center justify-center gap-2 ${isApplying
                                        ? "bg-indigo-400 cursor-wait"
                                        : isApplied
                                            ? "bg-green-600 cursor-default hover:bg-green-600"
                                            : !!applyingSuggestion
                                                ? "bg-indigo-300 cursor-not-allowed"
                                                : "bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
                                        }`}
                                >
                                    {isApplying ? "Applying..." : isApplied ? "DONE" : "APPLY"}
                                </button>
                                {suggestion.agentSummary && (
                                    <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 bg-slate-50 -mx-3 -mb-3 p-3 rounded-b-md">
                                        <strong className="block mb-1">Agent Summary:</strong>
                                        <ReactMarkdown components={renderers}>{suggestion.agentSummary}</ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                } catch (e) {
                    return <code className={className} {...props}>{children}</code>;
                }
            }

            return <code className={className} {...props}>{children}</code>;
        },
        ul: ({ children }) => <ul className="list-disc list-outside ml-4 mb-2 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-outside ml-4 mb-2 space-y-1">{children}</ol>,
        li: ({ children }) => <li className="mb-1 leading-relaxed">{children}</li>,
        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
        strong: ({ children }) => <span className="font-semibold text-slate-800">{children}</span>
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/copilot/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: input,
                    eventContext: eventPlan,
                    eventId,
                    chatId
                })
            });

            if (!response.ok) throw new Error("Failed to send message");

            const reader = response.body?.getReader();
            if (!reader) return;

            const assistantMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: ""
            };

            setMessages(prev => [...prev, assistantMsg]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = new TextDecoder().decode(value);
                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMsgIndex = newMessages.length - 1;
                    const lastMsg = { ...newMessages[lastMsgIndex] };
                    if (lastMsg.role === "assistant") {
                        lastMsg.content += text;
                    }
                    newMessages[lastMsgIndex] = lastMsg;
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: "assistant",
                content: "Sorry, I encountered an error. Please try again."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 font-sans">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${msg.role === "user"
                                ? "bg-indigo-600 text-white rounded-br-none"
                                : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
                                }`}
                        >
                            {msg.role === "assistant" ? (
                                <ReactMarkdown components={renderers}>{msg.content}</ReactMarkdown>
                            ) : (
                                msg.content
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-200">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask Copilot..."
                        className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <ArrowRight size={16} />
                        )}
                    </button>
                </div>
                <div className="text-[10px] text-center text-slate-400 mt-2">
                    AI can make mistakes. Review generated plans.
                </div>
            </form>
        </div>
    );
}
