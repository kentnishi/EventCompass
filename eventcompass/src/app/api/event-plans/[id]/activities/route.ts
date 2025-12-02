import { createServer } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/*
/api/event-plans/[eventId]/activities/route.ts - Operations on event activities:
GET - Get all activities for an event
POST - Create a new activity for an event
*/
// GET /api/event-plans/[eventId]/activities - Get all activities for an event


export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
  ) {
    try {
        const params = await context.params;
        const supabase = await createServer();
        const eventId = params.id;
  
        console.log("Fetching activities for event ID (GET):", eventId);
        
        // Validate eventId (ensure it's not empty or invalid)
        if (!eventId || typeof eventId !== "string") {
            return NextResponse.json(
                { error: "Invalid event ID" },
                { status: 400 }
            );
        }

        
  
      const { data: activities, error } = await supabase
        .from("activities")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: true });
  
      if (error) {
        console.error("Error fetching activities:", error);
        return NextResponse.json(
          { error: "Failed to fetch activities" },
          { status: 500 }
        );
      }
  
      return NextResponse.json(activities || []);
    } catch (error) {
      console.error("Unexpected error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
  
  // POST /api/event-plans/[eventId]/activities - Create one or multiple activities
  // Accepts either a single activity object OR an array of activity objects
  export async function POST(
    request: Request,
    context: { params: Promise<{ id: string }> }
  ) {
    try {
        const params = await context.params;
        const supabase = await createServer();
        const eventId = params.id;
        
      
        // Validate eventId (ensure it's not empty or invalid)
        if (!eventId || typeof eventId !== "string") {
            return NextResponse.json(
                { error: "Invalid event ID" },
                { status: 400 }
            );
        }

        
  
      const body = await request.json();
      
      // Check if event exists first
      const { data: event, error: eventError } = await supabase
        .from("events")
        .select("id")
        .eq("id", eventId)
        .single();
  
      if (eventError || !event) {
        return NextResponse.json(
          { error: "Event not found" },
          { status: 404 }
        );
      }
  
      // Determine if we're creating single or multiple activities
      const isArray = Array.isArray(body);
      const activitiesToCreate = isArray ? body : [body];
  
      // Validate all activities
      for (let i = 0; i < activitiesToCreate.length; i++) {
        const activity = activitiesToCreate[i];
        
        // Validate required fields
        if (!activity.name || typeof activity.name !== "string") {
          return NextResponse.json(
            { error: `Activity at index ${i}: name is required` },
            { status: 400 }
          );
        }
  
        // Validate staffing_needs if provided
        if (activity.staffing_needs !== undefined) {
          if (!Array.isArray(activity.staffing_needs)) {
            return NextResponse.json(
              { error: `Activity at index ${i}: staffing_needs must be an array` },
              { status: 400 }
            );
          }
  
          for (const need of activity.staffing_needs) {
            if (
              typeof need.id !== "number" ||
              (need.count !== null && typeof need.count !== "number") ||
              typeof need.responsibility !== "string"
            ) {
              return NextResponse.json(
                { error: `Activity at index ${i}: invalid staffing_needs structure` },
                { status: 400 }
              );
            }
          }
        }
      }
      
      
      // Prepare insert data
      const insertData = activitiesToCreate.map(activity => ({
        event_id: eventId,
        name: activity.name,
        description: activity.description || null,
        notes: activity.notes || null,
        staffing_needs: activity.staffing_needs || [],
      }));

  
      // Insert activities
      const { data: createdActivities, error } = await supabase
        .from("activities")
        .insert(insertData)
        .select();
  
      if (error) {
        console.error("Error creating activities:", error);
        return NextResponse.json(
          { error: "Failed to create activities" },
          { status: 500 }
        );
      }
  
      // Return single object or array based on input
      const result = isArray ? createdActivities : createdActivities[0];
      
      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      console.error("Unexpected error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
}