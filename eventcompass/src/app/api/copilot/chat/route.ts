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
            Current Date: ${new Date().toLocaleDateString()}
      
      Current Event Plan:
      ${JSON.stringify(eventContext, null, 2)}
      
      Instructions:
      1. Be concise and friendly.
      2. Use Markdown for formatting (bold keys, lists for items).
      3. If asked about budget, tasks, or shopping, refer to the specific arrays in the context.
      4. Do not be chatty. Get straight to the point.
      
      IMPORTANT: If you want to propose a concrete change to the plan (like adding a task, budget item, activity, shopping item, or schedule item), output a code block with the language 'suggestion'.
      The content MUST be a valid JSON object with this structure:
      \`\`\`suggestion
      {
        "title": "Short Title",
        "description": "Why this is needed",
        "type": "task" | "budget" | "activity" | "shopping" | "schedule" | "agent_action",
        "actionData": { ...specific fields... }
      }
      \`\`\`
      
      Specific fields for actionData:
      - task: { title, due_date, status, assignee_name }
      - budget: { category, allocated }
      - activity: { name, description, notes, staffing_needs }
      - shopping: { item, quantity, unit_cost, vendor, budget_id, status: "pending" | "ordered" | "received" | "cancelled" }
      - schedule: { start_time, end_time, notes }
      - agent_action: { goal: "Description of the complex goal to achieve" }

      IMPORTANT DATA INTEGRITY RULES:
      1. **Shopping Items**: You MUST include a 'budget_id' in actionData. Look at the 'budget_items' array in the context. Find the budget item that best matches the purchase (e.g., "Food", "Decor", "General") and use its 'id'. If no good match exists, use the first available budget item ID.
      2. **Schedule Items**: If you are scheduling an activity that already exists in 'activities', use its 'activity_id'. If it's a new activity, provide 'activity_name' so it can be auto-created.

      DECISION LOGIC:
      - If the request is for a **specific, concrete, single-item change**, use the specific type.
      - If the request is **high-level, multi-step, or vague**, use 'agent_action'.
      - **NOTE**: The Agent is capable of creating tasks. If a high-level goal involves manual work (e.g., "Call vendors"), it is OK to use 'agent_action' with a goal like "Manage vendor communications". The Agent will then create the necessary tasks for the user.

      Only use this format when you are confident the user wants to make a change or when you are proactively suggesting a specific addition. 
      Only inclulde this format at the end of the message. Do not include any other text after this format.
      `
        };

        const userMessageObj: ChatCompletionMessage = {
            role: "user",
            content: message
        };

        const CONVERSATION_WINDOW_SIZE = 20;
        const recentMessages = existingMessages.slice(-CONVERSATION_WINDOW_SIZE);

        const stream = await getChatCompletionStream([
            systemPrompt,
            ...recentMessages.map((m: any) => ({ role: m.role.toLowerCase(), content: m.text })),
            userMessageObj
        ]);

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

                console.log("----- CHAT RESPONSE -----");
                console.log("AI Response:", fullResponse);
                console.log("-------------------------");

                // Persist messages if we have a chatId
                // CRITICAL: Perform DB update BEFORE closing the controller.
                // In serverless environments, closing the stream might terminate the execution context immediately.
                if (chatId) {
                    try {
                        // Fetch latest messages to avoid race conditions/overwrites
                        const { data: currentChat } = await supabase
                            .from("chats")
                            .select("messages")
                            .eq("id", chatId)
                            .single();

                        const currentMessages = currentChat?.messages || [];

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

                        await supabase
                            .from("chats")
                            .update({ messages: [...currentMessages, newUserMsg, newAiMsg] })
                            .eq("id", chatId);

                    } catch (dbError) {
                        console.error("Failed to save chat messages:", dbError);
                    }
                }

                // Close the stream only AFTER the DB update is complete
                controller.close();
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
