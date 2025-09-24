import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

const HARDCODED_USER_ID = process.env.HARDCODED_USER_ID!;

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(req: Request, context: Context) {
  try {
    const { id } = await context.params;
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // First, verify the chat belongs to the user before updating
    const chat = await prisma.chat.findUnique({
      where: { id, userId: HARDCODED_USER_ID },
    });

    if (!chat) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Now, update the chat
    const updatedChat = await prisma.chat.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(updatedChat);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: Context) {
  try {
    const { id } = await context.params;

    // Verify the chat belongs to the user before deleting
    const chat = await prisma.chat.findUnique({
      where: { id, userId: HARDCODED_USER_ID },
    });

    if (!chat) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Use a transaction to ensure both messages and the chat are deleted
    await prisma.$transaction([
      prisma.message.deleteMany({ where: { chatId: id } }),
      prisma.chat.delete({ where: { id } }),
    ]);

    return new Response(null, { status: 204 }); // Success, no content

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
