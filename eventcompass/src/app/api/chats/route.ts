import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

const HARDCODED_USER_ID = process.env.HARDCODED_USER_ID!;

export async function GET() {
  try {
    const chats = await prisma.chat.findMany({ where: { userId: HARDCODED_USER_ID }, include: { messages: true } });
    if (!chats) {
      return NextResponse.json([]);
    }
    return NextResponse.json(chats);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name } = body;

    const newChat = await prisma.chat.create({
      data: {
        name: name || "New Chat",
        userId: HARDCODED_USER_ID,
      },
    });

    return NextResponse.json(newChat);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
