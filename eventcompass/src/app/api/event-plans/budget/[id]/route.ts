import { NextRequest, NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";

/*
/api/event-plans/budget/[id]/route.ts - Operations on a specific budget item:
GET - Fetch a single budget item by ID
PATCH - Update budget item fields (category, description, allocated, spent)
DELETE - Delete a budget item
*/

// GET /api/event-plans/budget/[id] - Get a single budget item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServer();
    const budgetItemId = parseInt(params.id);

    if (isNaN(budgetItemId)) {
      return NextResponse.json(
        { error: "Invalid budget item ID" },
        { status: 400 }
      );
    }

    const { data: budgetItem, error } = await supabase
      .from("budget_items")
      .select("*")
      .eq("id", budgetItemId)
      .single();

    if (error) {
      console.error("Error fetching budget item:", error);
      return NextResponse.json(
        { error: "Failed to fetch budget item" },
        { status: 500 }
      );
    }

    if (!budgetItem) {
      return NextResponse.json(
        { error: "Budget item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(budgetItem);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/event-plans/budget/[id] - Update a budget item
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServer();
    const budgetItemId = parseInt(params.id);

    if (isNaN(budgetItemId)) {
      return NextResponse.json(
        { error: "Invalid budget item ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { category, description, allocated, spent } = body;

    // Build update object with only provided fields
    const updateData: any = {};
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (allocated !== undefined) updateData.allocated = allocated;
    if (spent !== undefined) updateData.spent = spent;

    // Validate fields if provided
    if (category !== undefined && typeof category !== "string") {
      return NextResponse.json(
        { error: "category must be a string" },
        { status: 400 }
      );
    }

    if (description !== undefined && typeof description !== "string") {
      return NextResponse.json(
        { error: "description must be a string" },
        { status: 400 }
      );
    }

    if (allocated !== undefined && (typeof allocated !== "number" || allocated < 0)) {
      return NextResponse.json(
        { error: "allocated must be a non-negative number" },
        { status: 400 }
      );
    }

    if (spent !== undefined && (typeof spent !== "number" || spent < 0)) {
      return NextResponse.json(
        { error: "spent must be a non-negative number" },
        { status: 400 }
      );
    }

    const { data: budgetItem, error } = await supabase
      .from("budget_items")
      .update(updateData)
      .eq("id", budgetItemId)
      .select()
      .single();

    if (error) {
      console.error("Error updating budget item:", error);
      return NextResponse.json(
        { error: "Failed to update budget item" },
        { status: 500 }
      );
    }

    if (!budgetItem) {
      return NextResponse.json(
        { error: "Budget item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(budgetItem);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/event-plans/budget/[id] - Delete a budget item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServer();
    const budgetItemId = parseInt(params.id);

    if (isNaN(budgetItemId)) {
      return NextResponse.json(
        { error: "Invalid budget item ID" },
        { status: 400 }
      );
    }

    // First check if budget item exists
    const { data: existingBudgetItem, error: fetchError } = await supabase
      .from("budget_items")
      .select("id")
      .eq("id", budgetItemId)
      .single();

    if (fetchError || !existingBudgetItem) {
      return NextResponse.json(
        { error: "Budget item not found" },
        { status: 404 }
      );
    }

    // Delete the budget item
    const { error: deleteError } = await supabase
      .from("budget_items")
      .delete()
      .eq("id", budgetItemId);

    if (deleteError) {
      console.error("Error deleting budget item:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete budget item" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Budget item deleted successfully" },
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