
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
}

const Badge = ({ type, children }: { type: string, children: React.ReactNode }) => {
    const styles: Record<string, string> = {
        Task: "bg-orange-100 text-orange-700 border-orange-200",
        Schedule: "bg-blue-100 text-blue-700 border-blue-200",
        Activity: "bg-purple-100 text-purple-700 border-purple-200",
        Budget: "bg-emerald-100 text-emerald-700 border-emerald-200",
        Shopping: "bg-pink-100 text-pink-700 border-pink-200",
        default: "bg-gray-100 text-gray-700 border-gray-200"
    };

    const className = styles[type] || styles.default;

    return (
        <span className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-1 rounded border ${className}`}>
            {children}
        </span>
    );
};

export default function CopilotChat({ eventPlan, eventId, updatePlan }: CopilotChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content: "Hi! I'm your event planning assistant. I can help you with ideas, budget, or tasks based on your current plan. What's on your mind?"
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleApplySuggestion = (suggestion: any) => {
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
            alert(`Applied: ${suggestion.title} `);
        } catch (e) {
            console.error("Failed to apply suggestion", e);
            alert("Could not apply suggestion automatically.");
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

                    return (
                        <div className="w-full max-w-xs mt-2">
                            <div className="bg-white border border-slate-200 rounded-md p-3 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-slate-500 uppercase">Suggestion</span>
                                    <Badge type={typeLabel}>{typeLabel}</Badge>
                                </div>
                                <h4 className="text-sm font-semibold text-slate-800 mb-1">{suggestion.title}</h4>
                                <p className="text-xs text-slate-600 mb-3">{suggestion.description}</p>
                                <button
                                    onClick={() => handleApplySuggestion(suggestion)}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 rounded shadow-sm transition-colors flex items-center justify-center gap-2"
                                >
                                                                         <span>APPLY TO PLAN</span> <ArrowRight size={12} />                                </button>
                            </div>
                        </div>
                    );
                } catch (e) {
                    return <code className={className} {...props}>{children}</code>;
                }
            }

            return <code className={className} {...props}>{children}</code>;
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/copilot/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage.content,
                    eventContext: eventPlan,
                    eventId
                })
            });

            if (!response.ok) throw new Error("Failed to send message");

            const reader = response.body?.getReader();
            if (!reader) throw new Error("No reader available");

            const assistantMessageId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, { id: assistantMessageId, role: "assistant", content: "" }]);

            const decoder = new TextDecoder();
            let done = false;
            let accumulatedContent = "";

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                const chunkValue = decoder.decode(value, { stream: true });
                accumulatedContent += chunkValue;

                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === assistantMessageId
                            ? { ...msg, content: accumulatedContent }
                            : msg
                    )
                );
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
        <div className="flex flex-col h-full bg-white font-sans">
            <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-5 custom-scrollbar">
                {messages.map((msg) => {
                    const isBot = msg.role === "assistant";
                    return (
                        <div key={msg.id} className={`flex gap-3 ${isBot ? '' : 'flex-row-reverse'}`}>
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border ${isBot ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                                {isBot ? <Bot size={18} /> : <div className="text-xs font-bold">YO</div>}
                            </div>

                            {/* Bubble */}
                            <div className={`flex flex-col max-w-[85%] ${isBot ? 'items-start' : 'items-end'}`}>
                                <div className={`py-2 px-3 text-sm leading-relaxed border ${isBot
                                    ? 'bg-white border-slate-200 text-slate-700 rounded-lg rounded-tl-none shadow-sm'
                                    : 'bg-indigo-600 border-indigo-600 text-white rounded-lg rounded-tr-none shadow-sm'
                                    }`}>
                                    <div className={`prose prose-sm max-w-none ${isBot ? 'prose-slate' : 'prose-invert'} prose-p:leading-relaxed prose-pre:bg-gray-800 prose-pre:p-2 prose-pre:rounded-md`}>
                                        <ReactMarkdown components={renderers}>{msg.content}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border bg-indigo-50 border-indigo-100 text-indigo-600">
                            <Bot size={18} />
                        </div>
                        <div className="bg-white border border-slate-200 p-3 rounded-lg rounded-tl-none shadow-sm">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-white border-t border-slate-200">
                <div className="relative flex gap-2">
                    <input
                        type="text"
                        placeholder="Ask about your event..."
                        className="flex-1 pl-3 pr-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSend()}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className={`px-3 py-2 rounded-md transition-all flex items-center justify-center ${input.trim() ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm' : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'}`}
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

