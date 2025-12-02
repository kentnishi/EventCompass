// app/api/event-plans/tasks/[id]/route.ts

/*
PUT/PATCH - Update a task

    Verifies task exists
    Validates activity_id belongs to event
    Validates status and priority enums
    Auto-sets completed_at when status changes to 'done'
    Clears completed_at when status changes away from 'done'
    Updates only provided fields

DELETE - Delete a task

    Verifies task exists
    Returns success message
*/

import { NextRequest, NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";
import { Task } from "@/types/eventPlan";

// PUT /api/event-plans/tasks/[id] - Update a task
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: number }> }
) {
  try {
    const supabase = await createServer();
    const params = await context.params;
    const task_id = params.id;

    const body: Partial<Task> = await request.json();

    // Verify the task exists
    const { data: existingTask, error: fetchError } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", task_id)
      .single();

    if (fetchError || !existingTask) {
      console.log("Task not found for update:", fetchError);
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // If activity_id is being updated, validate it belongs to this event
    if (body.activity_id !== undefined && body.activity_id !== null) {
      const { data: activity, error: activityError } = await supabase
        .from("activities")
        .select("id")
        .eq("id", body.activity_id)
        .eq("event_id", existingTask.event_id)
        .single();

      if (activityError || !activity) {
        return NextResponse.json(
          {
            error: "Invalid activity_id: Activity does not belong to this event",
          },
          { status: 400 }
        );
      }
    }

    // Validate status if provided
    if (body.status && !["todo", "in_progress", "blocked", "done"].includes(body.status)) {
      return NextResponse.json(
        { error: "status must be one of: todo, in_progress, blocked, done" },
        { status: 400 }
      );
    }

    // Validate priority if provided
    if (body.priority && !["low", "medium", "high"].includes(body.priority)) {
      return NextResponse.json(
        { error: "priority must be one of: low, medium, high" },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: Partial<Task> = {};
    if (body.activity_id !== undefined) updateData.activity_id = body.activity_id;
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) {
      updateData.status = body.status;
      // Auto-set completed_at when status changes to done
      if (body.status === "done" && !existingTask.completed_at) {
        updateData.completed_at = new Date().toISOString();
      } else if (body.status !== "done") {
        updateData.completed_at = null;
      }
    }
    if (body.assignee_name !== undefined) updateData.assignee_name = body.assignee_name;
    if (body.assignee_email !== undefined) updateData.assignee_email = body.assignee_email;
    if (body.due_date !== undefined) updateData.due_date = body.due_date;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.notes !== undefined) updateData.notes = body.notes;

    // Update the task
    const { data: updatedTask, error } = await supabase
      .from("tasks")
      .update(updateData)
      .eq("id", task_id)
      .select()
      .single();

    if (error) {
      console.error("Error updating task:", error);
      return NextResponse.json(
        { error: "Failed to update task" },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/event-plans/tasks/[id] - Delete a task
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: number }> }
) {
  try {
    const supabase = await createServer();
    const params = await context.params;
    const task_id = params.id;

    console.log("Task ID for task deletion:", task_id);

    // Verify the task exists
    const { data: existingTask, error: fetchError } = await supabase
      .from("tasks")
      .select("id")
      .eq("id", task_id)
      .single();

    if (fetchError || !existingTask) {
      console.log("Task not found for deletion:", fetchError);
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Delete the task
    const { error } = await supabase.from("tasks").delete().eq("id", task_id);

    if (error) {
      console.error("Error deleting task:", error);
      return NextResponse.json(
        { error: "Failed to delete task" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Task deleted successfully" },
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

// PATCH /api/event-plans/tasks/[id] - Partial update
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: number }> }
) {
  // Same implementation as PUT
  return PUT(request, context);
}