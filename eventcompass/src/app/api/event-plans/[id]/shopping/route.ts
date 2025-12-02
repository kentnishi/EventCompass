import { createServer } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/*
/api/event-plans/[id]/shopping/route.ts - Operations on event shopping items:
GET - Get all shopping items for an event
POST - Create a new shopping item (or multiple) for an event
*/

// GET /api/event-plans/[id]/shopping - Get all shopping items for an event
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabase = await createServer();
    const eventId = params.id;

    console.log("Fetching shopping items for event ID (GET):", eventId);
    
    // Validate eventId
    if (!eventId || typeof eventId !== "string") {
      return NextResponse.json(
        { error: "Invalid event ID" },
        { status: 400 }
      );
    }

    const { data: shoppingItems, error } = await supabase
      .from("shopping_items")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching shopping items:", error);
      return NextResponse.json(
        { error: "Failed to fetch shopping items" },
        { status: 500 }
      );
    }

    return NextResponse.json(shoppingItems || []);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/event-plans/[id]/shopping - Create one or multiple shopping items
// Accepts either a single shopping item object OR an array of shopping item objects
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

    // Determine if we're creating single or multiple shopping items
    const isArray = Array.isArray(body);
    const shoppingItemsToCreate = isArray ? body : [body];

    // Validate all shopping items
    for (let i = 0; i < shoppingItemsToCreate.length; i++) {
      const item = shoppingItemsToCreate[i];
      
      // Validate required fields
      if (!item.item || typeof item.item !== "string") {
        return NextResponse.json(
          { error: `Shopping item at index ${i}: item name is required` },
          { status: 400 }
        );
      }

      if (!item.vendor || typeof item.vendor !== "string") {
        return NextResponse.json(
          { error: `Shopping item at index ${i}: vendor is required` },
          { status: 400 }
        );
      }

      if (typeof item.unit_cost !== "number" || item.unit_cost < 0) {
        return NextResponse.json(
          { error: `Shopping item at index ${i}: unit_cost must be a non-negative number` },
          { status: 400 }
        );
      }

      if (typeof item.quantity !== "number" || item.quantity < 1) {
        return NextResponse.json(
          { error: `Shopping item at index ${i}: quantity must be at least 1` },
          { status: 400 }
        );
      }

      if (typeof item.budget_id !== "number") {
        return NextResponse.json(
          { error: `Shopping item at index ${i}: budget_id is required` },
          { status: 400 }
        );
      }

      // Validate status enum
      const validStatuses = ['pending', 'ordered', 'received', 'cancelled'];
      if (!item.status || !validStatuses.includes(item.status)) {
        return NextResponse.json(
          { error: `Shopping item at index ${i}: status must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }

      // Validate activity_id if provided
      if (item.activity_id !== null && item.activity_id !== undefined) {
        if (typeof item.activity_id !== "number") {
          return NextResponse.json(
            { error: `Shopping item at index ${i}: activity_id must be a number or null` },
            { status: 400 }
          );
        }
      }
    }

    // Verify all budget_ids exist
    const budgetIds = [...new Set(shoppingItemsToCreate.map((item: any) => item.budget_id))];
    const { data: budgets, error: budgetError } = await supabase
      .from("budget_items")
      .select("id")
      .eq("event_id", eventId)
      .in("id", budgetIds);

    if (budgetError || !budgets || budgets.length !== budgetIds.length) {
      return NextResponse.json(
        { error: "One or more budget_id values are invalid for this event" },
        { status: 400 }
      );
    }

    // Verify activity_ids exist if provided
    const activityIds = shoppingItemsToCreate
      .filter((item: any) => item.activity_id !== null && item.activity_id !== undefined)
      .map((item: any) => item.activity_id);
    
    if (activityIds.length > 0) {
      const uniqueActivityIds = [...new Set(activityIds)];
      const { data: activities, error: activityError } = await supabase
        .from("activities")
        .select("id")
        .eq("event_id", eventId)
        .in("id", uniqueActivityIds);

      if (activityError || !activities || activities.length !== uniqueActivityIds.length) {
        return NextResponse.json(
          { error: "One or more activity_id values are invalid for this event" },
          { status: 400 }
        );
      }
    }
    
    // Prepare insert data
    const insertData = shoppingItemsToCreate.map((item: any) => ({
      event_id: eventId,
      item: item.item,
      vendor: item.vendor,
      unit_cost: item.unit_cost,
      quantity: item.quantity,
      notes: item.notes || "",
      activity_id: item.activity_id || null,
      link: item.link || "",
      budget_id: item.budget_id,
      status: item.status,
    }));

    // Insert shopping items
    const { data: createdShoppingItems, error } = await supabase
      .from("shopping_items")
      .insert(insertData)
      .select();

    if (error) {
      console.error("Error creating shopping items:", error);
      return NextResponse.json(
        { error: "Failed to create shopping items" },
        { status: 500 }
      );
    }

    // Return single object or array based on input
    const result = isArray ? createdShoppingItems : createdShoppingItems[0];
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}