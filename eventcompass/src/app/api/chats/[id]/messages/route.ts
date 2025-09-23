import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";

// Integrate the centralized OpenAI functions
import { getChatCompletion, ChatCompletionMessage } from "../../../../../../lib/openai";

const HARDCODED_USER_ID = process.env.HARDCODED_USER_ID!;

const CONVERSATION_WINDOW_SIZE = 10; // Keep the last 10 messages for context

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, context: Context) {
  const { id } = await context.params;
  try {
    const chat = await prisma.chat.findUnique({ where: { id, userId: HARDCODED_USER_ID }, include: { messages: true } });
    if (!chat) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(chat);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request, context: Context) {
  const { id } = await context.params;
  try {
    const chat = await prisma.chat.findUnique({ where: { id, userId: HARDCODED_USER_ID } });
    if (!chat) return NextResponse.json({ error: "not found" }, { status: 404 });

    const body: { message?: { text: string } } = await req.json();
    const userMessageText = body?.message?.text;

    if (!userMessageText) {
      return NextResponse.json({ error: "Message text is required" }, { status: 400 });
    }

    const conversation = await prisma.chat.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    const history = conversation?.messages || [];
    const recentHistory = history.slice(-CONVERSATION_WINDOW_SIZE);

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

    // Save both messages in a transaction, then return the AI message.
    const [, aiMessage] = await prisma.$transaction([
      prisma.message.create({
        data: {
          chatId: id,
          role: "USER",
          text: userMessageText,
        },
      }),
      prisma.message.create({
        data: {
          chatId: id,
          role: "ASSISTANT",
          text: aiMessageText,
        },
      }),
    ]);

    return NextResponse.json(aiMessage);

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
