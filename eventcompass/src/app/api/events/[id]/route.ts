import { createServer } from "@/lib/supabase/server";

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const eventId = params.id;
    const supabase = createServer();

    const { data: event, error: eventError } = await supabase
        .from("past_events")
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


// Update an event
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    
    console.log("API route hit");
    try {
        const supabase = createServer();
        const eventId = params.id;
        const body = await request.json();
        
        console.log("Event ID from ROUTE:", eventId);
        console.log("Request body:", body);
        

        // Build update object - only include fields that were provided
        const updateData: any = {};
        
        if (body.name !== undefined) updateData.name = body.name;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.attendees !== undefined) updateData.attendees = body.attendees; // Allow null
        if (body.start_date !== undefined) updateData.start_date = body.start_date;
        if (body.end_date !== undefined) updateData.end_date = body.end_date;
        if (body.start_time !== undefined) updateData.start_time = body.start_time;
        if (body.end_time !== undefined) updateData.end_time = body.end_time;
        if (body.budget !== undefined) updateData.budget = body.budget; // Allow null
        if (body.spending !== undefined) updateData.spending = body.spending; // Allow null
        if (body.location !== undefined) updateData.location = body.location;
        if (body.committee !== undefined) updateData.committee = body.committee;
        if (body.status !== undefined) updateData.status = body.status;

        console.log('Updating event:', eventId, 'with data:', updateData);

        // First check if event exists
        const { data: existingEvent, error: checkError } = await supabase
            .from("past_events")
            .select("*")
            .eq("id", eventId)
            .select();

        


        console.log('Existing event check:', existingEvent, checkError);

        if (checkError) {
            console.error('Check error:', checkError);
            return new Response(
                JSON.stringify({ error: checkError.message }), 
                { status: 500 }
            );
        }

        if (!existingEvent) {
            return new Response(
                JSON.stringify({ error: "Event not found" }), 
                { status: 404 }
            );
        }

        // Update event in database
        const { data: updatedEvent, error: updateError } = await supabase
            .from("past_events")
            .update(updateData)
            .eq("eid", eventId)
            .select()
            .maybeSingle(); // Use maybeSingle() to avoid the "cannot coerce" error

        console.log('Update response:', updatedEvent, updateError);

        if (updateError) {
            console.error('Supabase update error:', updateError);
            return new Response(
                JSON.stringify({ error: updateError.message }), 
                { status: 500 }
            );
        }

        // if (!updatedEvent) {
        //     return new Response(
        //         JSON.stringify({ error: "Update failed - no event returned" }), 
        //         { status: 500 }
        //     );
        // }

        // Return the updated event
        return new Response(
            JSON.stringify({ event: updatedEvent, message: "Event updated successfully" }), 
            { status: 200 }
        );
        
    } catch (error: any) {
        console.error('PUT error:', error);
        return new Response(
            JSON.stringify({ error: error.message || "Invalid request body" }), 
            { status: 400 }
        );
    }
}
