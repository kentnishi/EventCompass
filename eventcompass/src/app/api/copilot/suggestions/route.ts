import { NextResponse } from "next/server";
import { getChatCompletion, ChatCompletionMessage } from "@/lib/openai";
import { createServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { eventContext, eventId } = await req.json();

    console.log("----- SUGGESTIONS REQUEST -----");
    console.log("Event Context Summary:", {
      name: eventContext.name,
      activitiesCount: eventContext.activities?.length || 0,
      tasksCount: eventContext.tasks?.length || 0,
      budgetTotal: (eventContext.budget_items || eventContext.budget)?.reduce((sum: number, item: any) => sum + (item.allocated || item.estimated || 0), 0) || 0,
      shoppingItemsCount: (eventContext.shopping_items || eventContext.shopping)?.length || 0,
      scheduleItemsCount: (eventContext.schedule_items || eventContext.schedule)?.length || 0
    });

    const systemPrompt: ChatCompletionMessage = {
      role: "system",
      content: `You are an expert event planning assistant. Analyze the current event plan and provide 3-5 specific, actionable suggestions to improve it.
      
      Current Event Plan Context:
      ${JSON.stringify(eventContext, null, 2)}
      
      Return ONLY a JSON object with a 'suggestions' array. Each suggestion should have:
      - id: string (unique)
      - title: string (short, action-oriented)
      - description: string (why this is important)
      - type: "task" | "budget" | "activity" | "shopping" | "schedule" | "agent_action"
      
      - actionData: object (optional, specific data to apply)
        - For "task": { title, due_date, status, assignee_name }
        - For "budget": { category, allocated }
        - For "activity": { name, description, notes, staffing_needs }
        - For "shopping": { item, quantity, unit_cost, vendor, budget_id }
        - For "schedule": { start_time, end_time, notes }
        - For "agent_action": { goal: "Description of the complex goal to achieve" }
      
      IMPORTANT DATA INTEGRITY RULES:
      1. **Shopping Items**: You MUST include a 'budget_id' in actionData. Look at the 'budget_items' array in the context. Find the budget item that best matches the purchase (e.g., "Food", "Decor", "General") and use its 'id'. If no good match exists, use the first available budget item ID.
      2. **Schedule Items**: If you are scheduling an activity that already exists in 'activities', use its 'activity_id'. If it's a new activity, provide 'activity_name' so it can be auto-created.
      
      DECISION LOGIC:
      - If the suggestion is a **specific, concrete, single-item change** (e.g., "Add a task to buy flowers"), use the specific type (task, budget, etc.).
      - If the suggestion is **high-level, multi-step, or vague** (e.g., "Research venues", "Optimize schedule", "Plan check-in flow", "Handle catering"), use 'agent_action'.
      - **NOTE**: The Agent is capable of creating tasks. If a high-level goal involves manual work (e.g., "Call vendors"), it is OK to use 'agent_action' with a goal like "Manage vendor communications". The Agent will then create the necessary tasks for the user.
      
      Example:
      {
        "suggestions": [
          {
            "id": "1",
            "title": "Add Cleanup Task",
            "description": "You have a cleanup activity but no assigned task for it.",
            "type": "task",
            "actionData": {
              "title": "Coordinate cleanup crew",
              "due_date": "2025-11-25",
              "status": "todo"
            }
          },
          {
            "id": "2",
            "title": "Buy Decorations",
            "description": "Purchase streamers and balloons.",
            "type": "shopping",
            "actionData": {
              "item": "Streamers and Balloons",
              "quantity": 5,
              "unit_cost": 20,
              "vendor": "Party City",
              "budget_id": 123 
            }
          },
          {
            "id": "3",
            "title": "Research Venues",
            "description": "We need to find a suitable location for the event.",
            "type": "agent_action",
            "actionData": {
              "goal": "Research and suggest 3 potential venues in San Francisco with a capacity of 100 people."
            }
          }
        ]
      }
      `
    };

    const response = await getChatCompletion([systemPrompt]);

    if (!response || !response.content) {
      return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 });
    }

    console.log("----- SUGGESTIONS RESPONSE -----");
    console.log("Raw AI Response:", response.content);
    console.log("--------------------------------");

    // Parse JSON from response (handling potential markdown code blocks)
    let jsonStr = response.content;
    if (jsonStr.includes("```json")) {
      jsonStr = jsonStr.split("```json")[1].split("```")[0];
    } else if (jsonStr.includes("```")) {
      jsonStr = jsonStr.split("```")[1].split("```")[0];
    }

    const suggestionsData = JSON.parse(jsonStr.trim());

    // Persist suggestions if eventId is provided
    if (eventId) {
      const supabase = createServer();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Check if we already have suggestions for this event AND user
        const { data: existing } = await supabase
          .from('suggestions')
          .select('id')
          .eq('event_id', eventId)
          .eq('user_id', user.id) // Enforce user ownership
          .single();

        if (existing) {
          await supabase
            .from('suggestions')
            .update({
              suggestions: suggestionsData.suggestions,
              updated_at: new Date().toISOString()
            })
            .eq('event_id', eventId)
            .eq('user_id', user.id); // Enforce user ownership
        } else {
          await supabase
            .from('suggestions')
            .insert({
              event_id: eventId,
              user_id: user.id,
              suggestions: suggestionsData.suggestions
            });
        }
      }
    }

    return NextResponse.json(suggestionsData);

  } catch (error) {
    console.error("Suggestions API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    const supabase = createServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: suggestionRecord } = await supabase
      .from('suggestions')
      .select('suggestions')
      .eq('event_id', eventId)
      .eq('user_id', user.id) // Enforce user ownership
      .single();

    if (suggestionRecord) {
      return NextResponse.json({ suggestions: suggestionRecord.suggestions });
    }

    return NextResponse.json({ suggestions: [] });

  } catch (error) {
    console.error("Suggestions API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { suggestions, eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    const supabase = createServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update the suggestions record
    const { error } = await supabase
      .from('suggestions')
      .update({
        suggestions: suggestions,
        updated_at: new Date().toISOString()
      })
      .eq('event_id', eventId)
      .eq('user_id', user.id); // Enforce user ownership

    if (error) {
      console.error("Error updating suggestions:", error);
      return NextResponse.json({ error: "Failed to update suggestions" }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Suggestions API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
