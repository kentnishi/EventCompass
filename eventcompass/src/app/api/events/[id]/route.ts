import { supabase } from "../../../../../lib/supabase";

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const eventId = params.id;

    const { data: event, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

    const { data: items, error: itemsError } = await supabase
        .from("event_items")
        .select("*")
        .eq("event_id", eventId);

    if (eventError || itemsError)
        return new Response(JSON.stringify({ error: eventError?.message || itemsError?.message }), { status: 500 });

    return new Response(JSON.stringify({ event, items }), { status: 200 });
}
