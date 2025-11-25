import { createServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = createServer();
    const body = await request.json();

    // Validate the incoming request body
    if (!body.name || !body.start_date || !body.end_date || !body.location) {
      return NextResponse.json(
        { error: "Missing required fields: name, start_date, end_date, or location" },
        { status: 400 }
      );
    }

    // Insert the new event into the database
    const { data, error } = await supabase
      .from("events")
      .insert([
        {
          name: body.name,
          description: body.description || null,
          attendees: body.attendees || 0,
          start_date: body.start_date,
          end_date: body.end_date,
          start_time: body.start_time || null,
          end_time: body.end_time || null,
          budget: body.budget || 0,
          spending: body.spending || 0,
          location: body.location,
          committee: body.committee || null,
          status: body.status || "draft",
          food_provided: body.food_provided || false,
          giveaways: body.giveaways || false,
          registration_required: body.registration_required || false,
          event_type: body.event_type || null,
        },
      ])
      .select("*")
      .single();

    if (error) {
      console.error("Error inserting event:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return the created event
    return NextResponse.json({ event: data }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/events:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}