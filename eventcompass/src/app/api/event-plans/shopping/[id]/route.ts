import { NextRequest, NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";
import { BudgetItem } from "@/types/eventPlan";

/*
/api/event-plans/shopping/[id]/route.ts - Operations on a specific shopping item:
GET - Fetch a single shopping item by ID
PATCH - Update shopping item fields
PUT - Full update of shopping item
DELETE - Delete a shopping item
*/

// GET /api/event-plans/shopping/[id] - Get a single shopping item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServer();
    const shoppingItemId = (params.id);

    const { data: shoppingItem, error } = await supabase
      .from("shopping_items")
      .select("*")
      .eq("id", shoppingItemId)
      .single();

    if (error) {
      console.error("Error fetching shopping item:", error);
      return NextResponse.json(
        { error: "Failed to fetch shopping item" },
        { status: 500 }
      );
    }

    if (!shoppingItem) {
      return NextResponse.json(
        { error: "Shopping item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(shoppingItem);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/event-plans/shopping/[id] - Partially update a shopping item
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServer();
    const shoppingItemId = (params.id);


    const body = await request.json();
    const { item, vendor, unit_cost, quantity, notes, activity_id, link, budget_id, status } = body;

    // Build update object with only provided fields
    const updateData: any = {};
    if (item !== undefined) updateData.item = item;
    if (vendor !== undefined) updateData.vendor = vendor;
    if (unit_cost !== undefined) updateData.unit_cost = unit_cost;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (notes !== undefined) updateData.notes = notes;
    if (activity_id !== undefined) updateData.activity_id = activity_id;
    if (link !== undefined) updateData.link = link;
    if (budget_id !== undefined) updateData.budget_id = budget_id;
    if (status !== undefined) updateData.status = status;

    // Validate fields if provided
    if (item !== undefined && typeof item !== "string") {
      return NextResponse.json(
        { error: "item must be a string" },
        { status: 400 }
      );
    }

    if (vendor !== undefined && typeof vendor !== "string") {
      return NextResponse.json(
        { error: "vendor must be a string" },
        { status: 400 }
      );
    }

    if (unit_cost !== undefined && (typeof unit_cost !== "number" || unit_cost < 0)) {
      return NextResponse.json(
        { error: "unit_cost must be a non-negative number" },
        { status: 400 }
      );
    }

    if (quantity !== undefined && (typeof quantity !== "number" || quantity < 1)) {
      return NextResponse.json(
        { error: "quantity must be at least 1" },
        { status: 400 }
      );
    }

    if (notes !== undefined && typeof notes !== "string") {
      return NextResponse.json(
        { error: "notes must be a string" },
        { status: 400 }
      );
    }

    if (activity_id !== undefined && activity_id !== null && typeof activity_id !== "number") {
      return NextResponse.json(
        { error: "activity_id must be a number or null" },
        { status: 400 }
      );
    }

    if (link !== undefined && typeof link !== "string") {
      return NextResponse.json(
        { error: "link must be a string" },
        { status: 400 }
      );
    }

    if (budget_id !== undefined && typeof budget_id !== "number") {
      return NextResponse.json(
        { error: "budget_id must be a number" },
        { status: 400 }
      );
    }

    if (status !== undefined) {
      const validStatuses = ['pending', 'ordered', 'received', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `status must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // If budget_id is being updated, verify it exists and belongs to the same event
    if (budget_id !== undefined) {
      const { data: existingItem } = await supabase
        .from("shopping_items")
        .select("event_id")
        .eq("id", shoppingItemId)
        .single();

      if (existingItem) {
        const { data: budget, error: budgetError } = await supabase
          .from("budget_items")
          .select("id")
          .eq("id", budget_id)
          .eq("event_id", existingItem.event_id)
          .single();

        if (budgetError || !budget) {
          return NextResponse.json(
            { error: "Invalid budget_id for this event" },
            { status: 400 }
          );
        }
      }
    }

    // If activity_id is being updated, verify it exists and belongs to the same event
    if (activity_id !== undefined && activity_id !== null) {
      const { data: existingItem } = await supabase
        .from("shopping_items")
        .select("event_id")
        .eq("id", shoppingItemId)
        .single();

      if (existingItem) {
        const { data: activity, error: activityError } = await supabase
          .from("activities")
          .select("id")
          .eq("id", activity_id)
          .eq("event_id", existingItem.event_id)
          .single();

        if (activityError || !activity) {
          return NextResponse.json(
            { error: "Invalid activity_id for this event" },
            { status: 400 }
          );
        }
      }
    }

    const { data: shoppingItem, error } = await supabase
      .from("shopping_items")
      .update(updateData)
      .eq("id", shoppingItemId)
      .select()
      .single();

    if (error) {
      console.error("Error updating shopping item:", error);
      return NextResponse.json(
        { error: "Failed to update shopping item" },
        { status: 500 }
      );
    }

    if (!shoppingItem) {
      return NextResponse.json(
        { error: "Shopping item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(shoppingItem);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/event-plans/shopping/[id] - Full update of a shopping item
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const supabase = await createServer();
    const params = await context.params;
    const shoppingItemId = (params.id);

    const body = await request.json();
    
    // Validate all required fields for full update
    if (!body.item || typeof body.item !== "string") {
      return NextResponse.json(
        { error: "item name is required and must be a string" },
        { status: 400 }
      );
    }

    if (!body.vendor || typeof body.vendor !== "string") {
      return NextResponse.json(
        { error: "vendor is required and must be a string" },
        { status: 400 }
      );
    }

    if (typeof body.unit_cost !== "number" || body.unit_cost < 0) {
      return NextResponse.json(
        { error: "unit_cost must be a non-negative number" },
        { status: 400 }
      );
    }

    if (typeof body.quantity !== "number" || body.quantity < 1) {
      return NextResponse.json(
        { error: "quantity must be at least 1" },
        { status: 400 }
      );
    }

    if (typeof body.budget_id !== "number") {
      return NextResponse.json(
        { error: "budget_id is required and must be a number" },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'ordered', 'received', 'cancelled'];
    if (!body.status || !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: `status is required and must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    if (body.activity_id !== null && body.activity_id !== undefined && typeof body.activity_id !== "number") {
      return NextResponse.json(
        { error: "activity_id must be a number or null" },
        { status: 400 }
      );
    }

    // Get existing item to verify event_id
    const { data: existingItem, error: fetchError } = await supabase
      .from("shopping_items")
      .select("event_id")
      .eq("id", shoppingItemId)
      .single();

    if (fetchError || !existingItem) {
      return NextResponse.json(
        { error: "Shopping item not found: ", fetchError },
        { status: 404 }
      );
    }

    // Verify budget_id belongs to the same event
    const { data: budget, error: budgetError } = await supabase
      .from("budget_items")
      .select("id")
      .eq("id", body.budget_id)
      .eq("event_id", existingItem.event_id)
      .single();

    if (budgetError || !budget) {
      return NextResponse.json(
        { error: "Invalid budget_id for this event" },
        { status: 400 }
      );
    }

    // Verify activity_id belongs to the same event (if provided)
    if (body.activity_id !== null && body.activity_id !== undefined) {
      const { data: activity, error: activityError } = await supabase
        .from("activities")
        .select("id")
        .eq("id", body.activity_id)
        .eq("event_id", existingItem.event_id)
        .single();

      if (activityError || !activity) {
        return NextResponse.json(
          { error: "Invalid activity_id for this event" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData = {
      item: body.item,
      vendor: body.vendor,
      unit_cost: body.unit_cost,
      quantity: body.quantity,
      notes: body.notes || "",
      activity_id: body.activity_id || null,
      link: body.link || "",
      budget_id: body.budget_id,
      status: body.status,
    };

    const { data: shoppingItem, error } = await supabase
      .from("shopping_items")
      .update(updateData)
      .eq("id", shoppingItemId)
      .select()
      .single();

    if (error) {
      console.error("Error updating shopping item:", error);
      return NextResponse.json(
        { error: "Failed to update shopping item" },
        { status: 500 }
      );
    }

    return NextResponse.json(shoppingItem);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/event-plans/shopping/[id] - Delete a shopping item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServer();
    const shoppingItemId = params.id;

    // First check if shopping item exists
    const { data: existingShoppingItem, error: fetchError } = await supabase
      .from("shopping_items")
      .select("id, budget_id")
      .eq("id", shoppingItemId)
      .single();

    if (fetchError || !existingShoppingItem) {
      return NextResponse.json(
        { error: "Shopping item not found" },
        { status: 404 }
      );
    }

    // Delete the shopping item
    const { error: deleteError } = await supabase
      .from("shopping_items")
      .delete()
      .eq("id", shoppingItemId);

    if (deleteError) {
      console.error("Error deleting shopping item:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete shopping item" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Shopping item deleted successfully" },
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