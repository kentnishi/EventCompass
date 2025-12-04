// app/api/events/[event_id]/schedule/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";
import { ScheduleItem } from "@/types/eventPlan";


// GET /api/events/[event_id]/schedule - Fetch all schedule items for an event
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServer();
    const params = await context.params;
    const event_id = params.id;

    // Fetch schedule items for this event
    const { data: scheduleItems, error } = await supabase
      .from("schedule_items")
      .select("*")
      .eq("event_id", event_id)
      .order("start_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Error fetching schedule items:", error);
      return NextResponse.json(
        { error: "Failed to fetch schedule items" },
        { status: 500 }
      );
    }

    return NextResponse.json(scheduleItems || []);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/events/[event_id]/schedule - Create one or multiple schedule items
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServer();
    const params = await context.params;
    const event_id = params.id;
    const body = await request.json();

    // Check if the body is an array or a single object
    const scheduleItems = Array.isArray(body) ? body : [body];

    // Validate required fields for each schedule item
    for (const item of scheduleItems) {
      if (!item.start_date || !item.start_time || !item.end_time) {
        return NextResponse.json(
          { error: "start_date, start_time, and end_time are required for all schedule items" },
          { status: 400 }
        );
      }
      console.log("Event_ID in schedule item creation:", event_id);
      // If activity_id is provided, validate it belongs to this event
      if (item.activity_id) {
        const { data: activity, error: activityError } = await supabase
          .from("activities")
          .select("id")
          .eq("id", item.activity_id)
          .eq("event_id", event_id)
          .single();

        if (activityError || !activity) {
          console.log("Error with invalid activity_id: ", activityError);
          return NextResponse.json(
            { error: `Invalid activity_id: Activity ${item.activity_id} does not belong to this event` },
            { status: 400 }
          );
        }
      }
    }

    // Prepare the data for insertion
    const scheduleData = scheduleItems.map((item) => ({
      event_id,
      activity_id: item.activity_id || null,
      start_date: item.start_date,
      end_date: item.end_date || null,
      start_time: item.start_time,
      end_time: item.end_time,
      location: item.location || "",
      notes: item.notes || "",
    }));

    // Insert the schedule items into the database
    const { data: newScheduleItems, error } = await supabase
      .from("schedule_items")
      .insert(scheduleData)
      .select();

    if (error) {
      console.error("Error creating schedule items:", error);
      return NextResponse.json(
        { error: "Failed to create schedule items" },
        { status: 500 }
      );
    }

    return NextResponse.json(newScheduleItems, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}