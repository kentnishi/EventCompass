import { NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";

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

        const { data: chats, error } = await supabase
            .from("chats")
            .select("id, name, created_at")
            .eq("event_id", eventId)
            .eq("user", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Failed to fetch chats:", error);
            return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 });
        }

        return NextResponse.json({ chats: chats || [] });
    } catch (error) {
        console.error("Chats API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { eventId, name } = await req.json();

        if (!eventId) {
            return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
        }

        const supabase = createServer();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: newChat, error } = await supabase
            .from("chats")
            .insert({
                name: name || "New Chat",
                user: user.id,
                event_id: eventId,
                messages: []
            })
            .select()
            .single();

        if (error) {
            console.error("Failed to create chat:", error);
            return NextResponse.json({ error: "Failed to create chat" }, { status: 500 });
        }

        return NextResponse.json({ chat: newChat });
    } catch (error) {
        console.error("Create chat API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
