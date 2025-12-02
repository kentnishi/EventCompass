import { create } from 'domain';
import { NextRequest, NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";

/*
/api/event-plans/activities/[id]/route.ts - Operations on a specific activity:
GET - Fetch a single activity by ID
PATCH - Update activity fields (name, description, notes, staffing_needs)
DELETE - Delete an activity
 */


// GET /api/event-plans/activities/[id] - Get a single activity
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServer();
    const activityId = parseInt(params.id);

    if (isNaN(activityId)) {
      return NextResponse.json(
        { error: "Invalid activity ID" },
        { status: 400 }
      );
    }

    const { data: activity, error } = await supabase
      .from("activities")
      .select("*")
      .eq("id", activityId)
      .single();

    if (error) {
      console.error("Error fetching activity:", error);
      return NextResponse.json(
        { error: "Failed to fetch activity" },
        { status: 500 }
      );
    }

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(activity);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/event-plans/activities/[id] - Update an activity
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServer();
    const activityId = parseInt(params.id);

    if (isNaN(activityId)) {
      return NextResponse.json(
        { error: "Invalid activity ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, notes, staffing_needs } = body;

    // Build update object with only provided fields
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (notes !== undefined) updateData.notes = notes;
    if (staffing_needs !== undefined) updateData.staffing_needs = staffing_needs;

    // Validate staffing_needs structure if provided
    if (staffing_needs !== undefined) {
      if (!Array.isArray(staffing_needs)) {
        return NextResponse.json(
          { error: "staffing_needs must be an array" },
          { status: 400 }
        );
      }

      for (const need of staffing_needs) {
        if (
          typeof need.id !== "number" ||
          (need.count !== null && typeof need.count !== "number") ||
          typeof need.responsibility !== "string"
        ) {
          return NextResponse.json(
            { error: "Invalid staffing_needs structure" },
            { status: 400 }
          );
        }
      }
    }

    const { data: activity, error } = await supabase
      .from("activities")
      .update(updateData)
      .eq("id", activityId)
      .select()
      .single();

    if (error) {
      console.error("Error updating activity:", error);
      return NextResponse.json(
        { error: "Failed to update activity" },
        { status: 500 }
      );
    }

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(activity);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/event-plans/activities/[id] - Delete an activity
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const supabase = await createServer();
    const params = await context.params;
    const activityId = parseInt(params.id);

    if (isNaN(activityId)) {
      return NextResponse.json(
        { error: "Invalid activity ID" },
        { status: 400 }
      );
    }

    // First check if activity exists
    const { data: existingActivity, error: fetchError } = await supabase
      .from("activities")
      .select("id")
      .eq("id", activityId)
      .single();

    if (fetchError || !existingActivity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    // Delete the activity
    const { error: deleteError } = await supabase
      .from("activities")
      .delete()
      .eq("id", activityId);

    if (deleteError) {
      console.error("Error deleting activity:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete activity" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Activity deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}