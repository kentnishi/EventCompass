import { createServer } from "@/lib/supabase/server";

export async function GET() {
    const supabase = createServer();
    const { data: events, error } = await supabase.from("past_events").select("*");
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify({ events }), { status: 200 });
}
