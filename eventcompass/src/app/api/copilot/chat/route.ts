import { NextResponse } from "next/server";
import { getChatCompletionStream, ChatCompletionMessage } from "@/lib/openai";
import { createServer } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
    try {
        const { message, eventContext, eventId } = await req.json();

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const supabase = createServer();
        let chatId: string | number | null = null;
        let existingMessages: any[] = [];

        // If eventId is provided, try to find or create a chat for this event
        if (eventId) {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Try to find existing chat for this event
                const { data: chats } = await supabase
                    .from("chats")
                    .select("id, messages")
                    .eq("event_id", eventId)
                    .eq("user", user.id)
                    .limit(1);

                if (chats && chats.length > 0) {
                    chatId = chats[0].id;
                    existingMessages = chats[0].messages || [];
                } else {
                    // Create new chat linked to event
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
            budgetTotal: eventContext.budget?.reduce((sum: number, item: any) => sum + item.estimated, 0) || 0,
            shoppingItemsCount: eventContext.shopping?.length || 0,
            scheduleItemsCount: eventContext.schedule?.length || 0
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
      
      IMPORTANT: If you want to propose a concrete change to the plan (like adding a task, budget item, activity, shopping item, or schedule item), output a code block with the language 'suggestion'.
      The content MUST be a valid JSON object with this structure:
      \`\`\`suggestion
      {
        "title": "Short Title",
        "description": "Why this is needed",
        "type": "task" | "budget" | "activity" | "shopping" | "schedule",
        "actionData": { ...specific fields... }
      }
      \`\`\`
      
      Specific fields for actionData:
      - task: { task, deadline, status, assignedTo }
      - budget: { category, estimated }
      - activity: { name, description }
      - shopping: { item, quantity, category, estimatedCost }
      - schedule: { time, duration, notes }
      
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
        const eventId = searchParams.get("eventId");

        if (!eventId) {
            return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
        }

        const supabase = createServer();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: chats } = await supabase
            .from("chats")
            .select("messages")
            .eq("event_id", eventId)
            .eq("user", user.id)
            .limit(1);

        if (chats && chats.length > 0) {
            // Transform messages to match frontend interface if needed
            // Assuming stored messages are { role: "USER"|"ASSISTANT", text: "..." }
            const messages = (chats[0].messages || []).map((m: any) => ({
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
