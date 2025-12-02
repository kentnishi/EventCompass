// src/app/api/event-plans/[id]/route.ts
import { createServer } from "@/lib/supabase/server";
import { NextResponse, NextRequest } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const body = await request.json();
      const { id } = params;
      
      console.log('Updating event:', id, body);
      
      const { data, error } = await supabase
        .from('events')
        .update(body)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ 
        success: true, 
        event: data 
      });
      
    } catch (error: any) {
      console.error('Update error:', error);
      return NextResponse.json(
        { error: 'Failed to update event', details: error.message },
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