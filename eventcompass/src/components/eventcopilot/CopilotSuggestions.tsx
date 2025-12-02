"use client";

import React, { useState } from "react";
import { RefreshCw, Plus, Sparkles, Loader2, AlertCircle } from "lucide-react";

interface Suggestion {
    id: string;
    title: string;
    description: string;
    type: "task" | "budget" | "activity" | "shopping" | "schedule" | "general";
    actionData?: any;
}

interface CopilotSuggestionsProps {
    eventPlan: any;
    updatePlan: (field: string, value: any) => void;
    onSuggestionsFound: () => void;
}

const Badge = ({ type, children }: { type: string, children: React.ReactNode }) => {
    const styles: Record<string, string> = {
        task: "bg-orange-100 text-orange-700 border-orange-200",
        schedule: "bg-blue-100 text-blue-700 border-blue-200",
        activity: "bg-purple-100 text-purple-700 border-purple-200",
        budget: "bg-emerald-100 text-emerald-700 border-emerald-200",
        shopping: "bg-pink-100 text-pink-700 border-pink-200",
        default: "bg-gray-100 text-gray-700 border-gray-200"
    };

    const className = styles[type.toLowerCase()] || styles.default;

    return (
        <span className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-1 rounded border ${className}`}>
            {children}
        </span>
    );
};

export default function CopilotSuggestions({ eventPlan, updatePlan, onSuggestionsFound, eventId }: CopilotSuggestionsProps & { eventId?: string }) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    const handleApplySuggestion = (suggestion: Suggestion) => {
        if (!suggestion.actionData) {
            alert(`Suggestion applied: ${suggestion.title}`);
            const newSuggestions = suggestions.filter(s => s.id !== suggestion.id);
            setSuggestions(newSuggestions);
            syncSuggestions(newSuggestions);
            return;
        }

        try {
            switch (suggestion.type) {
                case "task":
                    const newTasks = [...(eventPlan.tasks || [])];
                    const newTask = {
                        id: Math.max(0, ...newTasks.map((t: any) => t.id)) + 1,
                        task: suggestion.actionData.task || suggestion.title,
                        deadline: suggestion.actionData.deadline || "TBD",
                        status: suggestion.actionData.status || "pending",
                        assignedTo: suggestion.actionData.assignedTo || "",
                        linkedTo: suggestion.actionData.linkedTo || null
                    };
                    newTasks.push(newTask);
                    updatePlan("tasks", newTasks);
                    break;

                case "budget":
                    const newBudget = [...(eventPlan.budget || [])];
                    const categoryIndex = newBudget.findIndex((b: any) => b.category === suggestion.actionData.category);
                    if (categoryIndex >= 0) {
                        newBudget[categoryIndex].estimated += suggestion.actionData.estimated || 0;
                    } else {
                        // If category doesn't exist, add it
                        newBudget.push({
                            category: suggestion.actionData.category,
                            estimated: suggestion.actionData.estimated || 0,
                            actual: 0
                        });
                    }
                    updatePlan("budget", newBudget);
                    break;

                case "activity":
                    const newActivities = [...(eventPlan.activities || [])];
                    const newActivity = {
                        id: Math.max(0, ...newActivities.map((a: any) => a.id)) + 1,
                        name: suggestion.actionData.name || suggestion.title,
                        description: suggestion.actionData.description || suggestion.description
                    };
                    newActivities.push(newActivity);
                    updatePlan("activities", newActivities);
                    break;

                case "shopping":
                    const newShopping = [...(eventPlan.shopping || [])];
                    const newShoppingItem = {
                        id: Math.max(0, ...newShopping.map((s: any) => s.id)) + 1,
                        item: suggestion.actionData.item || suggestion.title,
                        quantity: suggestion.actionData.quantity || "1",
                        category: suggestion.actionData.category || "Miscellaneous",
                        estimatedCost: suggestion.actionData.estimatedCost || 0,
                        purchased: false,
                        linkedTo: null
                    };
                    newShopping.push(newShoppingItem);
                    updatePlan("shopping", newShopping);
                    break;

                case "schedule":
                    const newSchedule = [...(eventPlan.schedule || [])];
                    const newScheduleItem = {
                        time: suggestion.actionData.time || "TBD",
                        duration: suggestion.actionData.duration || 15,
                        notes: suggestion.actionData.notes || suggestion.title,
                        activityId: null
                    };
                    newSchedule.push(newScheduleItem);
                    updatePlan("schedule", newSchedule);
                    break;

                default:
                    console.log("Unknown suggestion type", suggestion.type);
            }

            // Remove applied suggestion and sync
            const newSuggestions = suggestions.filter(s => s.id !== suggestion.id);
            setSuggestions(newSuggestions);
            syncSuggestions(newSuggestions);

        } catch (e) {
            console.error("Failed to apply suggestion", e);
            setError("Could not apply suggestion automatically.");
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
                    className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 text-[11px] font-bold uppercase tracking-wide bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded border border-indigo-200 transition-colors"
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
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-4 rounded shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                        <Sparkles size={14} />
                        Generate Ideas
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {suggestions.map((suggestion) => (
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
                                {suggestion.description}
                            </p>
                            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                                <button
                                    onClick={() => handleApplySuggestion(suggestion)}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 rounded shadow-sm transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <Plus size={14} strokeWidth={2.5} />
                                    APPLY
                                </button>
                                <button
                                    onClick={() => handleDismissSuggestion(suggestion.id)}
                                    className="px-2 text-slate-400 hover:text-slate-600 text-xs font-semibold transition-colors uppercase"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
