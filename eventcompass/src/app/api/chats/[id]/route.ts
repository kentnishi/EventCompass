import { NextResponse } from "next/server";
import { createServer } from "../../../../../lib/supabase/server";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(req: Request, context: Context) {
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

    const { id } = await context.params;
    const chatId = Number(id);

    if (Number.isNaN(chatId)) {
      return NextResponse.json({ error: "Invalid chat id" }, { status: 400 });
    }

    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const { data: existingChat, error: fetchError } = await supabase
      .from("chats")
      .select("id")
      .eq("id", chatId)
      .eq("user", user.id)
      .single();

    if (fetchError) {
      console.error("Failed to fetch chat for rename:", fetchError);
      if (fetchError.code === "PGRST116" || fetchError.code === "PGRST301") {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    if (!existingChat) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: updatedChat, error: updateError } = await supabase
      .from("chats")
      .update({ name })
      .eq("id", chatId)
      .eq("user", user.id)
      .select("id, name, messages, created_at")
      .single();

    if (updateError) {
      console.error("Failed to update chat name:", updateError);
      return NextResponse.json({ error: "Failed to rename chat" }, { status: 500 });
    }

    return NextResponse.json({
      id: updatedChat.id?.toString(),
      name: updatedChat.name ?? name,
      messages: Array.isArray(updatedChat.messages) ? updatedChat.messages : [],
      createdAt: updatedChat.created_at,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: Context) {
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

    const { id } = await context.params;
    const chatId = Number(id);

    if (Number.isNaN(chatId)) {
      return NextResponse.json({ error: "Invalid chat id" }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from("chats")
      .delete()
      .eq("id", chatId)
      .eq("user", user.id);

    if (deleteError) {
      if (deleteError.code === "PGRST116" || deleteError.code === "PGRST301") {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      console.error("Failed to delete chat:", deleteError);
      return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 });
    }

    return new Response(null, { status: 204 }); // Success, no content

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
