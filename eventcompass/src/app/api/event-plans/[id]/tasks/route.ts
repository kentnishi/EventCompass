/*
    app/api/event-plans/[id]/tasks/route.ts
    GET - Fetch all tasks for an event

    Ordered by status priority, then due date, then created_at
    Returns empty array if no tasks

    POST - Create one or multiple tasks

    Validates title is required and not empty
    Validates activity_id belongs to the event (if provided)
    Validates status enum ('todo', 'in_progress', 'blocked', 'done')
    Validates priority enum ('low', 'medium', 'high')
    Auto-sets completed_at if status is 'done'
    Supports bulk creation (array of tasks)
*/

import { NextRequest, NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";
import { Task } from "@/types/eventPlan";

// GET /api/event-plans/[id]/tasks - Fetch all tasks for an event
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServer();
    const params = await context.params;
    const event_id = params.id;

    // Fetch tasks for this event, ordered by status priority and due date
    const { data: tasks, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("event_id", event_id)
      .order("status", { ascending: true }) // blocked -> in_progress -> todo -> done
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasks:", error);
      return NextResponse.json(
        { error: "Failed to fetch tasks" },
        { status: 500 }
      );
    }

    return NextResponse.json(tasks || []);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/event-plans/[id]/tasks - Create one or multiple tasks
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
    const tasks = Array.isArray(body) ? body : [body];

    // Validate required fields for each task
    for (const task of tasks) {
      if (!task.title || task.title.trim() === "") {
        return NextResponse.json(
          { error: "title is required for all tasks" },
          { status: 400 }
        );
      }

      console.log("Event_ID in task creation:", event_id);

      // If activity_id is provided, validate it belongs to this event
      if (task.activity_id) {
        const { data: activity, error: activityError } = await supabase
          .from("activities")
          .select("id")
          .eq("id", task.activity_id)
          .eq("event_id", event_id)
          .single();

        if (activityError || !activity) {
          console.log("Error with invalid activity_id: ", activityError);
          return NextResponse.json(
            {
              error: `Invalid activity_id: Activity ${task.activity_id} does not belong to this event`,
            },
            { status: 400 }
          );
        }
      }

      // Validate status if provided
      if (task.status && !["todo", "in_progress", "blocked", "done"].includes(task.status)) {
        return NextResponse.json(
          { error: "status must be one of: todo, in_progress, blocked, done" },
          { status: 400 }
        );
      }

      // Validate priority if provided
      if (task.priority && !["low", "medium", "high"].includes(task.priority)) {
        return NextResponse.json(
          { error: "priority must be one of: low, medium, high" },
          { status: 400 }
        );
      }
    }

    // Prepare the data for insertion
    const taskData = tasks.map((task) => ({
      event_id,
      activity_id: task.activity_id || null,
      title: task.title.trim(),
      description: task.description || "",
      status: task.status || "todo",
      assignee_name: task.assignee_name || "",
      assignee_email: task.assignee_email || "",
      due_date: task.due_date || null,
      priority: task.priority || "medium",
      notes: task.notes || "",
      completed_at: task.status === "done" && !task.completed_at ? new Date().toISOString() : task.completed_at || null,
    }));

    // Insert the tasks into the database
    const { data: newTasks, error } = await supabase
      .from("tasks")
      .insert(taskData)
      .select();

    if (error) {
      console.error("Error creating tasks:", error);
      return NextResponse.json(
        { error: "Failed to create tasks" },
        { status: 500 }
      );
    }

    return NextResponse.json(newTasks, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}