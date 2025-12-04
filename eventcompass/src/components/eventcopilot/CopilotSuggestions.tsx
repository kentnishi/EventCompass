"use client";

import React, { useState, useRef } from "react";
import { RefreshCw, Plus, Sparkles, Loader2, AlertCircle } from "lucide-react";

interface Suggestion {
    id: string;
    title: string;
    description: string;
    explanation?: string;
    type: "task" | "budget" | "activity" | "shopping" | "schedule" | "general" | "agent_action";
    actionData?: any;
}

interface CopilotSuggestionsProps {
    eventPlan: any;
    updatePlan: (field: string, value: any) => void;
    onSuggestionsFound: () => void;
    eventId?: string;
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

export default function CopilotSuggestions({ eventPlan, updatePlan, onSuggestionsFound, eventId, onRefresh, onNavigate }: CopilotSuggestionsProps) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [applyingSuggestionId, setApplyingSuggestionId] = useState<string | null>(null);

    // Fetch saved suggestions on mount
    React.useEffect(() => {
        if (eventId) {
            const loadSavedSuggestions = async () => {
                try {
                    const response = await fetch(`/api/copilot/suggestions?eventId=${eventId}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.suggestions && data.suggestions.length > 0) {
                            setSuggestions(data.suggestions);
                        }
                    }
                } catch (err) {
                    console.error("Failed to load saved suggestions:", err);
                }
            };
            loadSavedSuggestions();
        }
    }, [eventId]);

    const fetchSuggestions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch("/api/copilot/suggestions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ eventContext: eventPlan, eventId })
            });

            if (!response.ok) throw new Error("Failed to fetch suggestions");

            const data = await response.json();
            setSuggestions(data.suggestions);
            if (data.suggestions.length > 0) {
                onSuggestionsFound();
            }
        } catch (err) {
            console.error("Suggestions error:", err);
            setError("Failed to generate suggestions. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const syncSuggestions = async (newSuggestions: Suggestion[]) => {
        if (!eventId) return;
        try {
            await fetch("/api/copilot/suggestions", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ suggestions: newSuggestions, eventId })
            });
        } catch (err) {
            console.error("Failed to sync suggestions:", err);
        }
    };

    const handleDismissSuggestion = (suggestionId: string) => {
        const newSuggestions = suggestions.filter(s => s.id !== suggestionId);
        setSuggestions(newSuggestions);
        syncSuggestions(newSuggestions);
    };

    const handleApplySuggestion = async (suggestion: Suggestion) => {
        if (applyingSuggestionId) return;
        setApplyingSuggestionId(suggestion.id);

        if (!suggestion.actionData) {
            const newSuggestions = suggestions.filter(s => s.id !== suggestion.id);
            setSuggestions(newSuggestions);
            syncSuggestions(newSuggestions);
            setApplyingSuggestionId(null);
            return;
        }

        try {
            let endpoint = "";
            let body: any = {};
            let method = "POST";
            let targetTab = "";

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
                        body = {
                            title: suggestion.actionData.title || suggestion.title || "Untitled Task",
                            due_date: suggestion.actionData.due_date || null,
                            status: suggestion.actionData.status || "todo",
                            assignee_name: suggestion.actionData.assignee_name || "",
                            priority: suggestion.actionData.priority || "medium",
                            description: suggestion.actionData.description || suggestion.description || ""
                        };
                        targetTab = "tasks";
                        break;

                    case "budget":
                        endpoint = `/api/event-plans/${eventId}/budget`;
                        body = {
                            category: suggestion.actionData.category || "Miscellaneous",
                            allocated: suggestion.actionData.allocated || suggestion.actionData.amount || suggestion.actionData.cost || 0,
                            description: suggestion.actionData.description || suggestion.actionData.item || suggestion.title || "Budget item",
                            spent: suggestion.actionData.spent || 0,
                            notes: suggestion.actionData.notes || ""
                        };
                        targetTab = "budget";
                        break;

                    case "activity":
                        endpoint = `/api/event-plans/${eventId}/activities`;
                        body = {
                            name: suggestion.actionData.name || suggestion.actionData.title || suggestion.title || "Untitled Activity",
                            description: suggestion.actionData.description || suggestion.description || "",
                            location: suggestion.actionData.location || "",
                            start_time: suggestion.actionData.start_time || null,
                            end_time: suggestion.actionData.end_time || null,
                            cost: suggestion.actionData.cost || suggestion.actionData.price || 0,
                            notes: suggestion.actionData.notes || "",
                            event_id: eventId
                        };
                        targetTab = "activities";
                        break;

                    case "shopping":
                        endpoint = `/api/event-plans/${eventId}/shopping`;
                        body = {
                            item: suggestion.actionData.item || suggestion.actionData.name || suggestion.title || "Shopping Item",
                            quantity: parseInt(suggestion.actionData.quantity) || 1,
                            unit_cost: parseFloat(suggestion.actionData.unit_cost) || parseFloat(suggestion.actionData.cost) || parseFloat(suggestion.actionData.price) || 0,
                            vendor: suggestion.actionData.vendor || "",
                            status: suggestion.actionData.status || "pending",
                            notes: suggestion.actionData.notes || "",
                            category: suggestion.actionData.category || "General",
                            url: suggestion.actionData.url || "",
                            event_id: eventId
                        };
                        targetTab = "shopping";
                        break;

                    case "schedule":
                        endpoint = `/api/event-plans/${eventId}/schedule`;
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
                        targetTab = "schedule";
                        break;

                    default:
                        console.log("Unknown suggestion type", suggestion.type);
                        setApplyingSuggestionId(null);
                        return;
                }
            }

            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                // Remove applied suggestion and sync
                const newSuggestions = suggestions.filter(s => s.id !== suggestion.id);
                setSuggestions(newSuggestions);
                syncSuggestions(newSuggestions);

                if (onRefresh) onRefresh();
                if (onNavigate && targetTab && suggestion.type !== "agent_action") onNavigate(targetTab);
            } else {
                throw new Error("Failed to save to database");
            }

        } catch (e) {
            console.error("Failed to apply suggestion", e);
            setError("Could not apply suggestion automatically.");
        } finally {
            setApplyingSuggestionId(null);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-y-auto p-4 font-sans">
            <div className="flex justify-between items-center mb-4 pt-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Pending Suggestions
                </span>
                <button
                    onClick={fetchSuggestions}
                    disabled={isLoading}
                    className="cursor-pointer flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 text-[11px] font-bold uppercase tracking-wide bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded border border-indigo-200 transition-colors"
                >
                    <RefreshCw size={10} className={isLoading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2 text-red-700 text-xs">
                    <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-40 gap-3 text-gray-400">
                    <Loader2 size={24} className="animate-spin text-indigo-500" />
                    <p className="text-xs font-medium text-gray-500">Analyzing your event plan...</p>
                </div>
            ) : suggestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-60 text-center p-4 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                    <Sparkles className="mb-2 text-gray-300" size={32} />
                    <p className="font-medium text-gray-600 text-sm mb-1">
                        No suggestions yet
                    </p>
                    <p className="text-xs text-gray-400 mb-4">
                        Click refresh to get AI-powered ideas for your event.
                    </p>
                    <button
                        onClick={fetchSuggestions}
                        className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-4 rounded shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                        <Sparkles size={14} />
                        Generate Ideas
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {suggestions.map((suggestion) => {
                        const isApplying = applyingSuggestionId === suggestion.id;
                        return (
                            <div key={suggestion.id} className="bg-white border border-slate-200 rounded-md p-4 mb-3 shadow-sm hover:border-indigo-300 transition-colors">
                                <div className="flex justify-between items-start mb-2 gap-2">
                                    <h4 className="font-semibold text-slate-800 text-sm leading-snug flex-1 min-w-0 break-words">
                                        {suggestion.title}
                                    </h4>
                                    <div className="flex-shrink-0">
                                        <Badge type={suggestion.type}>{suggestion.type}</Badge>
                                    </div>
                                </div>
                                <p className="text-slate-600 text-xs leading-relaxed mb-4 break-words line-clamp-4">
                                    {suggestion.explanation || suggestion.description}
                                </p>
                                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                                    <button
                                        onClick={() => handleApplySuggestion(suggestion)}
                                        disabled={!!applyingSuggestionId}
                                        className={`flex-1 text-white text-xs font-semibold py-2 rounded shadow-sm transition-colors flex items-center justify-center gap-1.5 ${isApplying
                                            ? "bg-indigo-400 cursor-wait"
                                            : !!applyingSuggestionId
                                                ? "bg-indigo-300 cursor-not-allowed"
                                                : "bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
                                            }`}
                                    >
                                        <Plus size={14} strokeWidth={2.5} />
                                        {isApplying ? "APPLYING..." : "APPLY"}
                                    </button>
                                    <button
                                        onClick={() => handleDismissSuggestion(suggestion.id)}
                                        disabled={!!applyingSuggestionId}
                                        className="cursor-pointer px-2 text-slate-400 hover:text-slate-600 text-xs font-semibold transition-colors uppercase disabled:opacity-50"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
