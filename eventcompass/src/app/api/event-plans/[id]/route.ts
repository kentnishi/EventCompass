// src/app/api/event-plans/[id]/route.ts
import { createServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const eventId = params.id;
    const supabase = await createServer();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (eventError) {
      console.error("Error fetching event:", eventError);
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Fetch related data in parallel
    // const [
    //   { data: activities },
    //   { data: schedule },
    //   { data: shopping },
    //   { data: tasks },
    //   { data: budget },
    // ] = await Promise.all([
    //   supabase
    //     .from("activities")
    //     .select("*")
    //     .eq("event_id", eventId)
    //     .order("id", { ascending: true }),
      
    //   supabase
    //     .from("schedule_items")
    //     .select("*")
    //     .eq("event_id", eventId)
    //     .order("schedule_order", { ascending: true }),
      
    //   supabase
    //     .from("shopping_items")
    //     .select("*")
    //     .eq("event_id", eventId)
    //     .order("created_at", { ascending: true }),
      
    //   supabase
    //     .from("tasks")
    //     .select("*")
    //     .eq("event_id", eventId)
    //     .order("created_at", { ascending: true }),
      
    //   supabase
    //     .from("budget_items")
    //     .select("*")
    //     .eq("event_id", eventId)
    //     .order("created_at", { ascending: true }),
    // ]);

    // // Combine all data into a single response
    // const eventPlan = {
    //   ...event,
    //   activities: activities || [],
    //   schedule: schedule || [],
    //   shopping: shopping || [],
    //   tasks: tasks || [],
    //   budget: budget || [],
    // };

    return NextResponse.json({ event: event }, { status: 200 });
  } catch (error: any) {
    console.error("Error in GET /api/event-plans/[id]:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const eventId = params.id;
    const supabase = await createServer();
    const body = await request.json();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the event exists and user has access
    const { data: existingEvent, error: fetchError } = await supabase
      .from("events")
      .select("id, status")
      .eq("id", eventId)
      .single();

    if (fetchError || !existingEvent) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Check if event is editable (only if status is not read-only)
    // Adjust this based on your status logic
    // if (existingEvent.status !== 'planning' && existingEvent.status !== 'draft') {
    //   return NextResponse.json(
    //     { error: "Cannot edit event in current status" },
    //     { status: 403 }
    //   );
    // }

    // Update the event
    const { data: updatedEvent, error: updateError } = await supabase
      .from("events")
      .update({
        name: body.name,
        description: body.description,
        attendees: body.attendees,
        start_date: body.start_date,
        end_date: body.end_date,
        start_time: body.start_time,
        end_time: body.end_time,
        location: body.location,
        registration_required: body.registration_required,
        food_provided: body.food_provided,
        giveaways: body.giveaways,
        committee: body.committee,
        event_type: body.event_type,
        status: body.status,
        keywords: body.keywords,
        // Note: budget and spending are auto-calculated from budget_items
      })
      .eq("id", eventId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating event:", updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ event: updatedEvent }, { status: 200 });
  } catch (error: any) {
    console.error("Error in PATCH /api/event-plans/[id]:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const eventId = params.id;
    const supabase = await createServer();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete the event (cascading deletes will handle related records)
    const { error: deleteError } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId);

    if (deleteError) {
      console.error("Error deleting event:", deleteError);
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Event deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in DELETE /api/event-plans/[id]:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}