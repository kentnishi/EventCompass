import { createServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createServer();
    const body = await request.json();

    // Validate the incoming request body
    if (!body.name) {
      return NextResponse.json(
        { error: "Missing required field: name" },
        { status: 400 }
      );
    }

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Insert the new event into the database
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .insert([
        {
          name: body.name,
          description: body.description || null,
          attendees: body.attendees || 0,
          start_date: body.start_date || null,
          end_date: body.end_date || null,
          start_time: body.start_time || null,
          end_time: body.end_time || null,
          budget: body.budget || 0, 
          spending: 0, // Will be calculated from budget_items
          location: body.location || null,
          committee: body.committee || null,
          status: body.status || "planning",
          food_provided: body.food_provided || false,
          giveaways: body.giveaways || false,
          registration_required: body.registration_required || false,
          event_type: body.event_type || null,
          keywords: body.keywords || [],
        },
      ])
      .select("*")
      .single();

    if (eventError) {
      console.error("Error inserting event:", eventError);
      return NextResponse.json({ error: eventError.message }, { status: 500 });
    }

    const eventId = eventData.id;

    // Insert activities
    if (body.activities && body.activities.length > 0) {
      const activitiesData = body.activities.map((activity: any, index: number) => ({
        event_id: eventId,
        name: activity.name,
        description: activity.description || "",
      }));

      const { error: activitiesError } = await supabase
        .from("activities")
        .insert(activitiesData);

      if (activitiesError) {
        console.error("Error inserting activities:", activitiesError);
        // Don't fail the entire request, just log the error
      }
    }

    // Insert schedule items
    if (body.schedule && body.schedule.length > 0) {
      const scheduleData = body.schedule.map((item: any, index: number) => ({
        event_id: eventId,
        activity_id: item.activityId || null,
        schedule_order: index,
        time: item.time || "",
        duration: item.duration || "",
        notes: item.notes || "",
      }));

      const { error: scheduleError } = await supabase
        .from("schedule_items")
        .insert(scheduleData);

      if (scheduleError) {
        console.error("Error inserting schedule items:", scheduleError);
      }
    }

    // Insert shopping items
    // if (body.shopping && body.shopping.length > 0) {
    //   const shoppingData = body.shopping.map((item: any) => ({
    //     event_id: eventId,
    //     item: item.item,
    //     quantity: item.quantity || "",
    //     group: item.group || "Other",
    //     url: null,
    //   }));

    //   const { error: shoppingError } = await supabase
    //     .from("shopping_items")
    //     .insert(shoppingData);

    //   if (shoppingError) {
    //     console.error("Error inserting shopping items:", shoppingError);
    //   }
    // }

    // Insert tasks
    if (body.tasks && body.tasks.length > 0) {
      const tasksData = body.tasks.map((task: any) => ({
        event_id: eventId,
        task: task.task,
        assigned_to: task.assignedTo || "",
        deadline: task.deadline || "",
        status: task.status || "pending",
        linked_to: task.linkedTo || null,
      }));

      const { error: tasksError } = await supabase
        .from("tasks")
        .insert(tasksData);

      if (tasksError) {
        console.error("Error inserting tasks:", tasksError);
      }
    }

    // Insert budget items
    if (body.budget && body.budget.length > 0) {
      const budgetData = body.budget.map((item: any, index: number) => ({
        event_id: eventId,
        category: item.category,
        estimated: item.estimated || 0,
        actual: item.actual || 0,
        
      }));

      const { error: budgetError } = await supabase
        .from("budget_items")
        .insert(budgetData);

      if (budgetError) {
        console.error("Error inserting budget items:", budgetError);
      }
    }

    // Return the created event
    return NextResponse.json({ event: eventData }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/event-plans:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}