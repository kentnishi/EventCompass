import { supabase } from "../../../../lib/supabase";

export async function GET() {
    const { data: events, error } = await supabase.from("events").select("*");
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify({ events }), { status: 200 });
}
