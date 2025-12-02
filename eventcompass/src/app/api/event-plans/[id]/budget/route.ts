import { createServer } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/*
/api/event-plans/[id]/budget/route.ts - Operations on event budget items:
GET - Get all budget items for an event
POST - Create a new budget item (or multiple) for an event
*/

// GET /api/event-plans/[id]/budget - Get all budget items for an event
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabase = await createServer();
    const eventId = params.id;

    console.log("Fetching budget items for event ID (GET):", eventId);
    
    // Validate eventId
    if (!eventId || typeof eventId !== "string") {
      return NextResponse.json(
        { error: "Invalid event ID" },
        { status: 400 }
      );
    }

    const { data: budgetItems, error } = await supabase
      .from("budget_items")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching budget items:", error);
      return NextResponse.json(
        { error: "Failed to fetch budget items" },
        { status: 500 }
      );
    }

    return NextResponse.json(budgetItems || []);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/event-plans/[id]/budget - Create one or multiple budget items
// Accepts either a single budget item object OR an array of budget item objects
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabase = await createServer();
    const eventId = params.id;
    
    // Validate eventId
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

    // Determine if we're creating single or multiple budget items
    const isArray = Array.isArray(body);
    const budgetItemsToCreate = isArray ? body : [body];

    // Validate all budget items
    for (let i = 0; i < budgetItemsToCreate.length; i++) {
      const item = budgetItemsToCreate[i];
      
      // Validate required fields
      if (!item.category || typeof item.category !== "string") {
        return NextResponse.json(
          { error: `Budget item at index ${i}: category is required` },
          { status: 400 }
        );
      }

      if (!item.description || typeof item.description !== "string") {
        return NextResponse.json(
          { error: `Budget item at index ${i}: description is required` },
          { status: 400 }
        );
      }

      if (typeof item.allocated !== "number" || item.allocated < 0) {
        return NextResponse.json(
          { error: `Budget item at index ${i}: allocated must be a non-negative number` },
          { status: 400 }
        );
      }

      if (typeof item.spent !== "number" || item.spent < 0) {
        return NextResponse.json(
          { error: `Budget item at index ${i}: spent must be a non-negative number` },
          { status: 400 }
        );
      }
    }
    
    // Prepare insert data
    const insertData = budgetItemsToCreate.map(item => ({
      event_id: eventId,
      category: item.category,
      description: item.description,
      allocated: item.allocated,
      spent: item.spent,
    }));

    // Insert budget items
    const { data: createdBudgetItems, error } = await supabase
      .from("budget_items")
      .insert(insertData)
      .select();

    if (error) {
      console.error("Error creating budget items:", error);
      return NextResponse.json(
        { error: "Failed to create budget items" },
        { status: 500 }
      );
    }

    // Return single object or array based on input
    const result = isArray ? createdBudgetItems : createdBudgetItems[0];
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}