// app/api/event-plans/schedule/[schedule_id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";
import { ScheduleItem } from "@/types/eventPlan";

// PUT api/event-plans/schedule/[schedule_id]/route.ts - Update a schedule item
export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: number }> }
  ) {
    try {
      const supabase = await createServer();
      const params = await context.params;
      const schedule_id = params.id;
      
      const body: Partial<ScheduleItem> = await request.json();
  
      // Verify the schedule item exists and belongs to this event
      const { data: existingItem, error: fetchError } = await supabase
        .from("schedule_items")
        .select("*")
        .eq("id", schedule_id)
        .single();
  
      if (fetchError || !existingItem) {
        console.log("Schedule item not found for update:", fetchError);
        return NextResponse.json(
          { error: "Schedule item not found" },
          { status: 404 }
        );
      }
  
      // If activity_id is being updated, validate it belongs to this event
      if (body.activity_id !== undefined && body.activity_id !== null) {
        const { data: activity, error: activityError } = await supabase
          .from("activities")
          .select("id")
          .eq("id", body.activity_id)
          .single();
  
        if (activityError || !activity) {
          return NextResponse.json(
            { error: "Invalid activity_id: Activity does not belong to this event" },
            { status: 400 }
          );
        }
      }
  
      // Build update object
      const updateData: Partial<ScheduleItem> = {};
      if (body.activity_id !== undefined) updateData.activity_id = body.activity_id;
      if (body.start_date) updateData.start_date = body.start_date;
      if (body.end_date !== undefined) updateData.end_date = body.end_date;
      if (body.start_time) updateData.start_time = body.start_time;
      if (body.end_time) updateData.end_time = body.end_time;
      if (body.location !== undefined) updateData.location = body.location;
      if (body.notes !== undefined) updateData.notes = body.notes;
  
      // Update the schedule item
      const { data: updatedItem, error } = await supabase
        .from("schedule_items")
        .update(updateData)
        .eq("id", schedule_id)
        .select()
        .single();
  
      if (error) {
        console.error("Error updating schedule item:", error);
        return NextResponse.json(
          { error: "Failed to update schedule item" },
          { status: 500 }
        );
      }
  
      return NextResponse.json(updatedItem);
    } catch (error) {
      console.error("Unexpected error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
  
  // DELETE api/event-plans/schedule/[schedule_id]/route.ts - Delete a schedule item
  export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: number }> }
  ) {
    try {
      const supabase = await createServer();
      const params = await context.params;
      // const event_id = params.id;
      const schedule_id = params.id;

      console.log("Event ID for schedule item deletion:", schedule_id);
  
      // Verify the schedule item exists
      const { data: existingItem, error: fetchError } = await supabase
        .from("schedule_items")
        .select("id")
        .eq("id", schedule_id)
        .single();
  
      if (fetchError || !existingItem) {
        console.log("Schedule item not found for update:", fetchError);
        return NextResponse.json(
          { error: "Schedule item not found" },
          { status: 404 }
        );
      }
  
      // Delete the schedule item
      const { error } = await supabase
        .from("schedule_items")
        .delete()
        .eq("id", schedule_id)
  
      if (error) {
        console.error("Error deleting schedule item:", error);
        return NextResponse.json(
          { error: "Failed to delete schedule item" },
          { status: 500 }
        );
      }
  
      return NextResponse.json(
        { message: "Schedule item deleted successfully" },
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
  
  // PATCH api/event-plans/schedule/[schedule_id]/route.ts - Partial update
  export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: number }> }
  ) {
    // Same implementation as PUT
    return PUT(request, context);
  }