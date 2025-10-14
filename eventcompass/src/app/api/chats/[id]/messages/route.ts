import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createServer } from "../../../../../../lib/supabase/server";

// Integrate the centralized OpenAI functions
import { getChatCompletion, ChatCompletionMessage } from "../../../../../../lib/openai";

const CONVERSATION_WINDOW_SIZE = 10; // Keep the last 10 messages for context

type Context = {
  params: Promise<{
    id: string;
  }>;
};

type StoredMessage = {
  id?: string;
  role?: string;
  text?: string;
  createdAt?: string;
  created_at?: string;
};

function normalizeStoredMessage(message: StoredMessage, index: number) {
  const id = message.id ?? `${index}`;
  const role = message.role === "ASSISTANT" ? "ASSISTANT" : "USER";
  const text = message.text ?? "";
  const createdAt = message.createdAt ?? message.created_at ?? new Date().toISOString();
  return { id, role, text, createdAt };
}

export async function GET(_: Request, context: Context) {
  const { id } = await context.params;
  const chatId = Number(id);

  if (Number.isNaN(chatId)) {
    return NextResponse.json({ error: "Invalid chat id" }, { status: 400 });
  }

  try {
    const supabase = createServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Failed to resolve authenticated user:", userError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("chats")
      .select("messages")
      .eq("id", chatId)
      .eq("user", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116" || error.code === "PGRST301") {
        return NextResponse.json({ error: "not found" }, { status: 404 });
      }
      console.error("Failed to load chat messages:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    const messages = Array.isArray(data?.messages)
      ? data.messages.map((message: StoredMessage, index: number) => {
          const { id: normalizedId, role, text } = normalizeStoredMessage(message, index);
          return { id: normalizedId, role, text };
        })
      : [];

    return NextResponse.json({ messages });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request, context: Context) {
  const { id } = await context.params;
  const chatId = Number(id);

  if (Number.isNaN(chatId)) {
    return NextResponse.json({ error: "Invalid chat id" }, { status: 400 });
  }

  try {
    const supabase = createServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Failed to resolve authenticated user:", userError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .select("messages")
      .eq("id", chatId)
      .eq("user", user.id)
      .single();

    if (chatError) {
      if (chatError.code === "PGRST116" || chatError.code === "PGRST301") {
        return NextResponse.json({ error: "not found" }, { status: 404 });
      }
      console.error("Failed to load chat for message creation:", chatError);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    if (!chat) return NextResponse.json({ error: "not found" }, { status: 404 });

    const body: { message?: { text: string } } = await req.json();
    const userMessageText = body?.message?.text;

    if (!userMessageText) {
      return NextResponse.json({ error: "Message text is required" }, { status: 400 });
    }

    const storedMessages = Array.isArray(chat.messages) ? chat.messages : [];
    const normalizedHistory = storedMessages.map((message: StoredMessage, index: number) =>
      normalizeStoredMessage(message, index)
    );

    const recentHistory = normalizedHistory.slice(-CONVERSATION_WINDOW_SIZE);

    const chatMessages: ChatCompletionMessage[] = recentHistory.map((m) => ({
      role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
      content: m.text,
    }));

    chatMessages.push({ role: "user", content: userMessageText });

    const systemPrompt: ChatCompletionMessage = {
      role: "system",
      content: `You are a helpful assistant. The current date is ${new Date().toLocaleDateString()}.
      You help users by answering questions and providing information about events, venues, and related topics.
      `,
    };

    // Call the centralized function to get the AI response
    const responseMessage = await getChatCompletion([systemPrompt, ...chatMessages]);
    const aiMessageText = responseMessage?.content;

    if (!aiMessageText) {
      return NextResponse.json({ error: "AI failed to respond." }, { status: 500 });
    }

    const timestamp = new Date().toISOString();
    const userMessage = {
      id: randomUUID(),
      role: "USER" as const,
      text: userMessageText,
      createdAt: timestamp,
    };
    const aiMessage = {
      id: randomUUID(),
      role: "ASSISTANT" as const,
      text: aiMessageText,
      createdAt: new Date().toISOString(),
    };

    const updatedMessages = [...normalizedHistory, userMessage, aiMessage];

    const { error: updateError } = await supabase
      .from("chats")
      .update({ messages: updatedMessages })
      .eq("id", chatId)
      .eq("user", user.id);

    if (updateError) {
      console.error("Failed to persist messages to Supabase:", updateError);
      return NextResponse.json({ error: "Failed to save messages" }, { status: 500 });
    }

    return NextResponse.json({
      id: aiMessage.id,
      role: aiMessage.role,
      text: aiMessage.text,
    });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
