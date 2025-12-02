import { createServer } from "@/lib/supabase/server";

export async function GET(request: Request, context: { params: { id: string } }) {
    const { params } = context; // Destructure context
    const eventId = params.id; // Access params.id synchronously
    const supabase = createServer();

    const { data: event, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

    const { data: items, error: itemsError } = await supabase
        .from("event_items")
        .select("*")
        .eq("event_id", eventId);

    if (eventError || itemsError) {
        return new Response(JSON.stringify({ error: eventError?.message || itemsError?.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ event, items }), { status: 200 });
}

export async function PUT(request: Request, context: { params: { id: string } }) {
    try {
      const { params } = context;
      const eventId = params.id;
      const supabase = createServer();
      const body = await request.json();
  
      const updateData: Record<string, any> = {};
      for (const k of [
        'name','description','attendees','start_date','end_date','start_time',
        'end_time','budget','spending','location','committee','status'
      ]) {
        if (body[k] !== undefined) updateData[k] = body[k];
      }
  
      // early guard: nothing to update
      if (Object.keys(updateData).length === 0) {
        return new Response(JSON.stringify({ error: "No fields to update" }), { status: 400 });
      }
  
      // ensure event exists (404 if not)
      const { data: existingEvent, error: checkError } = await supabase
        .from("events")
        .select("id")
        .eq("id", eventId)
        .single();
  
      if (checkError) {
        return new Response(JSON.stringify({ error: checkError.message }), { status: 500 });
      }
      if (!existingEvent) {
        return new Response(JSON.stringify({ error: "Event not found" }), { status: 404 });
      }
  
      // update and RETURN the updated row
      const { data: updated, error: updateError } = await supabase
        .from("events")
        .update(updateData)
        .eq("id", eventId)
        .select("*")
        .single();
  
      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), { status: 500 });
      }
  
      return new Response(JSON.stringify({ event: updated }), { status: 200 });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
  