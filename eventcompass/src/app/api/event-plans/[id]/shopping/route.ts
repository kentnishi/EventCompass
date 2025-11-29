import { createServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const eventId = params.id;
    const supabase = await createServer();

    const { data, error } = await supabase
      .from("shopping_items")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ shopping: data }, { status: 200 });
  } catch (error: any) {
    console.error("Error in GET /api/event-plans/[id]/shopping:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const eventId = params.id;
    const supabase = await createServer();
    const body = await request.json();

    const shoppingData = body.shopping.map((item: any) => ({
      event_id: eventId,
      item: item.item,
      quantity: item.quantity || 0,
      group: item.group || "Other",
      url: item.url || null,
    }));

    const { data, error } = await supabase
      .from("shopping_items")
      .insert(shoppingData)
      .select("*");

    if (error) {
      console.error("Error inserting shopping items:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ shopping: data }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/event-plans/[id]/shopping:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}