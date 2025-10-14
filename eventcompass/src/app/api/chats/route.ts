import { NextResponse } from "next/server";
import { createServer } from "../../../../lib/supabase/server";

export async function GET() {
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
      .select("id, name, messages, created_at")
      .eq("user", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch chats from Supabase:", error);
      return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 });
    }

    const chats =
      data?.map((chat) => ({
        id: chat.id?.toString(),
        name: chat.name ?? "Untitled Chat",
        messages: Array.isArray(chat.messages) ? chat.messages : [],
        createdAt: chat.created_at,
      })) ?? [];

    return NextResponse.json(chats);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
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

    const body = await req.json();
    const { name } = body;

    const { data, error } = await supabase
      .from("chats")
      .insert({
        name: name || "New Chat",
        user: user.id,
        messages: [],
      })
      .select("id, name, messages, created_at")
      .single();

    if (error) {
      console.error("Failed to create chat in Supabase:", error);
      return NextResponse.json({ error: "Failed to create chat" }, { status: 500 });
    }

    const newChat = {
      id: data.id?.toString(),
      name: data.name ?? "New Chat",
      messages: Array.isArray(data.messages) ? data.messages : [],
      createdAt: data.created_at,
    };

    return NextResponse.json(newChat);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
