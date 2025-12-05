import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { createServer } from "@/lib/supabase/server";

// Define tools for the agent
const tools = [
    {
        type: "function",
        function: {
            name: "done",
            description: "Call this when you have completed the user's goal. Provide a summary of what you did.",
            parameters: {
                type: "object",
                properties: {
                    summary: { type: "string", description: "A summary of the actions taken." }
                },
                required: ["summary"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "manage_tasks",
            description: "Create, update, or delete tasks",
            parameters: {
                type: "object",
                properties: {
                    action: { type: "string", enum: ["create", "update", "delete"] },
                    id: { type: "string", description: "ID of task to update/delete" },
                    data: {
                        type: "object",
                        properties: {
                            title: { type: "string" },
                            status: { type: "string", enum: ["todo", "in_progress", "done"] },
                            priority: { type: "string", enum: ["low", "medium", "high"] },
                            due_date: { type: "string" },
                            assignee_name: { type: "string" }
                        }
                    }
                },
                required: ["action"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "manage_budget",
            description: "Create, update, or delete budget items",
            parameters: {
                type: "object",
                properties: {
                    action: { type: "string", enum: ["create", "update", "delete"] },
                    id: { type: "string", description: "ID of budget item to update/delete" },
                    data: {
                        type: "object",
                        properties: {
                            description: { type: "string" },
                            category: { type: "string" },
                            allocated: { type: "number" },
                            spent: { type: "number" },
                            notes: { type: "string" }
                        }
                    }
                },
                required: ["action"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "manage_activities",
            description: "Create, update, or delete activities",
            parameters: {
                type: "object",
                properties: {
                    action: { type: "string", enum: ["create", "update", "delete"] },
                    id: { type: "string", description: "ID of activity to update/delete" },
                    data: {
                        type: "object",
                        properties: {
                            name: { type: "string" },
                            description: { type: "string" },
                            location: { type: "string" },
                            start_time: { type: "string" },
                            end_time: { type: "string" },
                            cost: { type: "number" },
                            notes: { type: "string" },
                            staffing_needs: { type: "string" }
                        }
                    }
                },
                required: ["action"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "manage_shopping",
            description: "Create, update, or delete shopping items",
            parameters: {
                type: "object",
                properties: {
                    action: { type: "string", enum: ["create", "update", "delete"] },
                    id: { type: "string", description: "ID of shopping item to update/delete" },
                    data: {
                        type: "object",
                        properties: {
                            item: { type: "string" },
                            quantity: { type: "number" },
                            unit_cost: { type: "number" },
                            vendor: { type: "string" },
                            status: { type: "string", enum: ["pending", "ordered", "received", "cancelled"] },
                            category: { type: "string" },
                            notes: { type: "string" },
                            budget_id: { type: "number", description: "ID of the budget item to link to" },
                            items: {
                                type: "array",
                                description: "List of shopping items to create in bulk. Use this for creating multiple items at once.",
                                items: {
                                    type: "object",
                                    properties: {
                                        item: { type: "string" },
                                        quantity: { type: "number" },
                                        unit_cost: { type: "number" },
                                        vendor: { type: "string" },
                                        status: { type: "string", enum: ["pending", "ordered", "received", "cancelled"] },
                                        category: { type: "string" },
                                        notes: { type: "string" },
                                        budget_id: { type: "number" }
                                    }
                                }
                            }
                        }
                    }
                },
                required: ["action"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "manage_schedule",
            description: "Create, update, or delete schedule items",
            parameters: {
                type: "object",
                properties: {
                    action: { type: "string", enum: ["create", "update", "delete"] },
                    id: { type: "string", description: "ID of schedule item to update/delete" },
                    data: {
                        type: "object",
                        properties: {
                            activity_name: { type: "string" },
                            start_time: { type: "string" },
                            end_time: { type: "string" },
                            location: { type: "string" },
                            description: { type: "string" },
                            notes: { type: "string" },
                            start_date: { type: "string" }
                        }
                    }
                },
                required: ["action"]
            }
        }
    }
];

export async function POST(req: Request) {
    try {
        const { goal, eventId, eventContext } = await req.json();

        if (!goal || !eventId) {
            return NextResponse.json({ error: "Goal and Event ID are required" }, { status: 400 });
        }

        const supabase = createServer();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch fresh data from DB to ensure context is up-to-date
        const [
            { data: tasks },
            { data: budget },
            { data: activities },
            { data: shopping },
            { data: schedule }
        ] = await Promise.all([
            supabase.from("tasks").select("*").eq("event_id", eventId),
            supabase.from("budget_items").select("*").eq("event_id", eventId),
            supabase.from("activities").select("*").eq("event_id", eventId),
            supabase.from("shopping_items").select("*").eq("event_id", eventId),
            supabase.from("schedule_items").select("*").eq("event_id", eventId)
        ]);

        const currentContext = {
            tasks: tasks || [],
            budget: budget || [],
            activities: activities || [],
            shopping: shopping || [],
            schedule: schedule || []
        };

        console.log("Agent Context IDs:", {
            tasks: tasks?.map(t => t.id),
            budget: budget?.map(b => b.id),
            activities: activities?.map(a => a.id),
            shopping: shopping?.map(s => s.id),
            schedule: schedule?.map(s => s.id)
        });

        const messages: any[] = [
            {
                role: "system",
                content: `You are an autonomous event planning agent.
                Current Date: ${new Date().toLocaleDateString()}
                Your goal is to execute the user's request by modifying the event plan.
                
                Current Plan Context (Fresh from Database):
                ${JSON.stringify(currentContext, null, 2)}
                
                User Goal: "${goal}"
                
                Instructions:
                1. Analyze the goal and the current plan.
                2. Call the appropriate tools to achieve the goal.
                3. You can make multiple tool calls in one go.
                4. If the goal involves "consolidating", look for duplicates in the context and delete them, then create a combined item.
                5. Be precise with IDs when updating or deleting.
                6. **CRITICAL**: You must call the 'done' tool when you are finished.
                7. If you create an item, you will see the result in the next turn. You can then use that info if needed.
                8. Loop until you are satisfied that the goal is met.
                `
            },
            { role: "user", content: goal }
        ];

        let iterations = 0;
        const maxIterations = 5;
        const allResults = [];

        while (iterations < maxIterations) {
            iterations++;
            console.log(`Agent Loop Iteration: ${iterations}`);

            const completion = await openai.chat.completions.create({
                model: "gpt-4o", // Upgraded model for better reasoning
                messages: messages,
                tools: tools as any,
                tool_choice: "auto",
            });

            const message = completion.choices[0]?.message;
            if (!message) break;

            messages.push(message);
            const toolCalls = message.tool_calls;

            if (toolCalls) {
                console.log("Agent decided to call tools:", JSON.stringify(toolCalls, null, 2));

                // Check if 'done' was called
                const doneCall = toolCalls.find(tc => (tc as any).function.name === "done");
                if (doneCall) {
                    const args = JSON.parse((doneCall as any).function.arguments);
                    console.log("Agent finished with summary:", args.summary);
                    return NextResponse.json({ success: true, results: allResults, summary: args.summary });
                }

                for (const toolCall of toolCalls) {
                    const fnName = (toolCall as any).function.name;
                    const args = JSON.parse((toolCall as any).function.arguments);
                    console.log(`Executing ${fnName} with args:`, args);

                    let table = "";
                    let result = null;

                    // Map function to table
                    if (fnName === "manage_tasks") table = "tasks";
                    else if (fnName === "manage_budget") table = "budget_items";
                    else if (fnName === "manage_activities") table = "activities";
                    else if (fnName === "manage_shopping") table = "shopping_items";
                    else if (fnName === "manage_schedule") table = "schedule_items";

                    if (table) {
                        try {
                            if (args.action === "create") {
                                // Handle bulk shopping items
                                if (table === "shopping_items" && args.data.items && Array.isArray(args.data.items)) {
                                    const createdItems = [];
                                    for (const item of args.data.items) {
                                        if (!item.budget_id) {
                                            const category = item.category || "Miscellaneous";
                                            const match = budget?.find(b => b.category.toLowerCase() === category.toLowerCase());
                                            if (match) {
                                                item.budget_id = match.id;
                                            } else if (budget && budget.length > 0) {
                                                item.budget_id = budget[0].id;
                                            }
                                        }
                                        const insertData = { ...item, event_id: eventId };
                                        const { data } = await supabase.from(table).insert(insertData).select().single();
                                        if (data) createdItems.push(data);
                                    }
                                    result = { action: "create", table, data: createdItems, count: createdItems.length };
                                } else {
                                    // Auto-resolve budget_id for shopping items if missing
                                    if (table === "shopping_items" && !args.data.budget_id) {
                                        // Try to find matching budget category
                                        const category = args.data.category || "Miscellaneous";
                                        // We need access to budget items here. They are in 'budget' array from the top scope.
                                        // But we are inside a loop. We can access 'budget' because it's in the closure.
                                        const match = budget?.find(b => b.category.toLowerCase() === category.toLowerCase());
                                        if (match) {
                                            args.data.budget_id = match.id;
                                            console.log(`Agent auto-resolved budget_id to ${match.id} (${match.category})`);
                                        } else if (budget && budget.length > 0) {
                                            args.data.budget_id = budget[0].id;
                                            console.log(`Agent defaulted budget_id to ${budget[0].id} (${budget[0].category})`);
                                        } else {
                                            console.warn("Agent could not resolve budget_id: No budget items found.");
                                        }
                                    }

                                    let finalActivityId = args.data.activity_id;

                                    // Auto-create activity if name provided but id missing
                                    if (!finalActivityId && args.data.activity_name && table === "schedule_items") {
                                        const { data: newActivity, error: createError } = await supabase
                                            .from("activities")
                                            .insert({
                                                event_id: eventId,
                                                name: args.data.activity_name,
                                                description: args.data.description || "Created by Agent",
                                                notes: args.data.notes || ""
                                            })
                                            .select()
                                            .single();

                                        if (!createError && newActivity) {
                                            finalActivityId = newActivity.id;
                                            console.log(`Agent auto-created activity: ${newActivity.name} (${newActivity.id})`);
                                        }
                                    }

                                    const insertData = { ...args.data, event_id: eventId };
                                    if (table === "schedule_items") {
                                        insertData.activity_id = finalActivityId;
                                        delete insertData.activity_name; // Remove non-column field
                                    }

                                    const { data, error } = await supabase
                                        .from(table)
                                        .insert(insertData)
                                        .select()
                                        .single();
                                    result = { action: "create", table, data, error };
                                }
                            } else if (args.action === "update" && args.id) {
                                console.log(`Attempting to update ${table} item ${args.id} with data:`, args.data);

                                // Auto-resolve budget_id for shopping items on update too, if provided
                                if (table === "shopping_items" && args.data.budget_id === undefined && args.data.category) {
                                    // If category is changing but budget_id not provided, try to find match
                                    const category = args.data.category;
                                    const match = budget?.find(b => b.category.toLowerCase() === category.toLowerCase());
                                    if (match) {
                                        args.data.budget_id = match.id;
                                        console.log(`Agent auto-resolved budget_id for update to ${match.id} (${match.category})`);
                                    }
                                }

                                const { data, error } = await supabase
                                    .from(table)
                                    .update(args.data)
                                    .eq("id", args.id)
                                    .select();

                                if (error) {
                                    console.error(`Update failed for ${table} ${args.id}:`, error);
                                    result = { action: "update", table, error };
                                } else if (!data || data.length === 0) {
                                    console.warn(`Update returned no data for ${table} ${args.id}. Item might not exist or no changes detected.`);
                                    result = { action: "update", table, error: "Item not found or no changes made" };
                                } else {
                                    console.log(`Update successful for ${table} ${args.id}:`, data[0]);
                                    result = { action: "update", table, data: data[0], error: null };
                                }
                            } else if (args.action === "delete" && args.id) {
                                const { error } = await supabase
                                    .from(table)
                                    .delete()
                                    .eq("id", args.id);
                                result = { action: "delete", table, error };
                            }
                        } catch (err: any) {
                            result = { error: err.message };
                        }
                    }
                    console.log(`Result for ${fnName}:`, result);
                    allResults.push(result);

                    // Feed result back to agent
                    messages.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: JSON.stringify(result)
                    });
                }
            } else {
                console.log("Agent decided NOT to call any tools.");
                // If no tools called and no done, maybe it's just chatting? 
                // We should probably force it to be done or continue.
                // For now, let's break to avoid infinite loop of nothing.
                break;
            }
        }

        // If we exit the loop without a 'done' call, return the last tool results and a generic message
        // This happens if max iterations reached or agent stopped calling tools without saying done
        return NextResponse.json({
            success: true,
            results: allResults,
            summary: "Agent completed actions but did not provide a final summary. Please check the plan for updates."
        });

    } catch (error) {
        console.error("Agent API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
