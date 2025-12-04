import { NextResponse } from "next/server";
import { getChatCompletionStream, ChatCompletionMessage } from "@/lib/openai";
import { createServer } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
    try {
        const { message, eventContext, eventId, chatId: providedChatId } = await req.json();

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const supabase = createServer();
        let chatId: string | number | null = providedChatId || null;
        let existingMessages: any[] = [];

        // If chatId is provided, verify it and load messages
        if (chatId) {
            const { data: chat } = await supabase
                .from("chats")
                .select("messages, user")
                .eq("id", chatId)
                .single();

            if (chat) {
                // Verify ownership
                const { data: { user } } = await supabase.auth.getUser();
                if (!user || chat.user !== user.id) {
                    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
                }
                existingMessages = chat.messages || [];
            } else {
                // Invalid chatId provided
                chatId = null;
            }
        }

        // If no valid chatId but eventId is provided, try to find or create a chat for this event
        if (!chatId && eventId) {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Try to find existing chat for this user and event
                const { data: existingChat } = await supabase
                    .from("chats")
                    .select("id, messages")
                    .eq("event_id", eventId)
                    .eq("user", user.id)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .single();

                if (existingChat) {
                    chatId = existingChat.id;
                    existingMessages = existingChat.messages || [];
                } else {
                    // Create new chat if none exists
                    const { data: newChat } = await supabase
                        .from("chats")
                        .insert({
                            name: `Chat for ${eventContext.name || "Event"}`,
                            user: user.id,
                            event_id: eventId,
                            messages: []
                        })
                        .select()
                        .single();

                    if (newChat) {
                        chatId = newChat.id;
                    }
                }
            }
        }

        console.log("----- CHAT REQUEST -----");
        console.log("User Message:", message);
        console.log("Event Context Summary:", {
            name: eventContext.name,
            activitiesCount: eventContext.activities?.length || 0,
            tasksCount: eventContext.tasks?.length || 0,
            budgetTotal: (eventContext.budget_items || eventContext.budget)?.reduce((sum: number, item: any) => sum + (item.allocated || item.estimated || 0), 0) || 0,
            shoppingItemsCount: (eventContext.shopping_items || eventContext.shopping)?.length || 0,
            scheduleItemsCount: (eventContext.schedule_items || eventContext.schedule)?.length || 0
        });

        const systemPrompt: ChatCompletionMessage = {
            role: "system",
            content: `You are an expert event planning assistant.
      
      Current Event Plan:
      ${JSON.stringify(eventContext, null, 2)}
      
      Instructions:
      1. Be concise and friendly.
      2. Use Markdown for formatting (bold keys, lists for items).
      3. If asked about budget, tasks, or shopping, refer to the specific arrays in the context.
      4. Do not be chatty. Get straight to the point.
      5. You have access to an autonomous agent capable of performing complex, multi-step actions (like "research venues", "optimize schedule", "find conflicts"). Use the 'agent_action' suggestion type to trigger this.
      6. IMPORTANT: If the user asks for an action you cannot perform (e.g., "call vendors", "browse the live internet for new venues", "make payments"), do NOT use 'agent_action'. Instead, be helpful by creating a 'task' suggestion for the user to do it themselves (e.g., Title: "Research Venues", Description: "Look up venues in [Location]...").
      
      IMPORTANT: If you want to propose a concrete change to the plan (like adding a task, budget item, activity, shopping item, or schedule item), output a code block with the language 'suggestion'.
      The content MUST be a valid JSON object with this structure:
      \`\`\`suggestion
      {
        "title": "Short Title",
        "explanation": "User-facing explanation of why this is needed (shown in chat)",
        "description": "Technical description for the database item (not shown in chat card)",
        "type": "task" | "budget" | "activity" | "shopping" | "schedule" | "agent_action",
        "actionData": { ...specific fields... }
      }
      \`\`\`
      
      Specific fields for actionData:
      - task: { title, due_date, status, assignee_name, priority, description }
      - budget: { category, allocated, description, spent, notes }
      - activity: { name, description, location, start_time, end_time, cost, notes }
      - shopping: { item, quantity, unit_cost, vendor, status, notes, category, url }
      - schedule: { start_time, end_time, notes, activity_name, location, description, start_date }
      - agent_action: { goal: "Description of the complex goal to achieve" }
      
      Use "agent_action" when the user asks for complex modifications like "consolidate tasks", "remove duplicates", "optimize budget", or any multi-step operation that requires analyzing and modifying multiple items.
      
      Only use this format when you are confident the user wants to make a change or when you are proactively suggesting a specific addition.
      `
        };

        const userMessageObj: ChatCompletionMessage = {
            role: "user",
            content: message
        };

        const stream = await getChatCompletionStream([systemPrompt, ...existingMessages.map((m: any) => ({ role: m.role.toLowerCase(), content: m.text })), userMessageObj]);

        if (!stream) {
            return NextResponse.json({ error: "Failed to start stream" }, { status: 500 });
        }

        // Convert OpenAI stream to Web ReadableStream and persist to DB
        const readableStream = new ReadableStream({
            async start(controller) {
                let fullResponse = "";
                const encoder = new TextEncoder();

                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || "";
                    if (content) {
                        fullResponse += content;
                        controller.enqueue(encoder.encode(content));
                    }
                }
                controller.close();

                console.log("----- CHAT RESPONSE -----");
                console.log("AI Response:", fullResponse);
                console.log("-------------------------");

                // Persist messages if we have a chatId
                if (chatId) {
                    const newUserMsg = {
                        id: randomUUID(),
                        role: "USER",
                        text: message,
                        createdAt: new Date().toISOString()
                    };
                    const newAiMsg = {
                        id: randomUUID(),
                        role: "ASSISTANT",
                        text: fullResponse,
                        createdAt: new Date().toISOString()
                    };

                    const updatedMessages = [...existingMessages, newUserMsg, newAiMsg];

                    await supabase
                        .from("chats")
                        .update({ messages: updatedMessages })
                        .eq("id", chatId);
                }
            },
        });

        return new Response(readableStream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
            },
        });

    } catch (error) {
        console.error("Chat API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const chatId = searchParams.get("chatId");

        if (!chatId) {
            return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
        }

        const supabase = createServer();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: chat } = await supabase
            .from("chats")
            .select("messages")
            .eq("id", chatId)
            .eq("user", user.id) // Enforce ownership
            .single();

        if (chat) {
            const messages = (chat.messages || []).map((m: any) => ({
                id: m.id || randomUUID(),
                role: m.role.toLowerCase(),
                content: m.text
            }));
            return NextResponse.json({ messages });
        }

        return NextResponse.json({ messages: [] });

    } catch (error) {
        console.error("Chat API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
