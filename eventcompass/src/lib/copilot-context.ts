import { createServer } from "@/lib/supabase/server";

export interface EventContext {
    historicalAggregates: {
        avgBudgetPerAttendee: number;
        commonItemCategories: string[];
        avgDurationHours: number;
    };
    userStyle: {
        lastEvents: {
            name: string;
            itemCount: number;
            hasDetailedSchedule: boolean;
            topCategories: string[];
        }[];
    };
}

export async function getEventContext(currentEventId: string): Promise<EventContext> {
    const supabase = createServer();

    // 1. Fetch all past events for aggregates
    const { data: allEvents } = await supabase
        .from("events")
        .select("id, budget, attendees, start_date, start_time, end_time")
        .neq("id", currentEventId) // Exclude current
        .not("budget", "is", null)
        .order("start_date", { ascending: false });

    // 2. Fetch recent events for style learning (limit 3)
    const recentEvents = allEvents?.slice(0, 3) || [];

    // --- Calculate Aggregates ---
    let totalBudgetPerAttendee = 0;
    let countBudget = 0;
    let totalDuration = 0;
    let countDuration = 0;

    if (allEvents) {
        for (const ev of allEvents) {
            if (ev.budget && ev.attendees && ev.attendees > 0) {
                totalBudgetPerAttendee += ev.budget / ev.attendees;
                countBudget++;
            }
            if (ev.start_time && ev.end_time) {
                const start = new Date(`1970-01-01T${ev.start_time}`);
                const end = new Date(`1970-01-01T${ev.end_time}`);
                const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                if (diffHours > 0) {
                    totalDuration += diffHours;
                    countDuration++;
                }
            }
        }
    }

    const avgBudgetPerAttendee = countBudget > 0 ? totalBudgetPerAttendee / countBudget : 0;
    const avgDurationHours = countDuration > 0 ? totalDuration / countDuration : 0;

    // --- Analyze User Style (Recent Events) ---
    const userStyleEvents = [];

    for (const ev of recentEvents) {
        // Fetch items for this event to see detail level
        const { data: items } = await supabase
            .from("event_items")
            .select("category, item_type")
            .eq("event_id", ev.id);

        const itemCount = items?.length || 0;

        // Check for schedule items (assuming 'schedule' type in event_items or separate table? 
        // Based on EventColumn.tsx, items have item_type. Let's assume 'schedule' isn't in event_items 
        // but we can infer detail from item count and categories)

        const categories = new Set(items?.map((i: any) => i.category).filter(Boolean) as string[]);

        userStyleEvents.push({
            name: `Event ${ev.id.slice(0, 4)}...`, // Anonymize or use real name if available (wasn't selected above, let's fix select)
            itemCount,
            hasDetailedSchedule: false, // Placeholder, would need schedule table check
            topCategories: Array.from(categories).slice(0, 3),
        });
    }

    // Fix: We need event names for style context
    if (recentEvents.length > 0) {
        const { data: eventNames } = await supabase
            .from("events")
            .select("id, name")
            .in("id", recentEvents.map(e => e.id));

        if (eventNames) {
            userStyleEvents.forEach(styleEv => {
                const match = eventNames.find(n => n.id.startsWith(styleEv.name.substring(6, 10))); // fuzzy match by ID slice
                // Actually, better to just map by ID.
            });
            // Re-fetching properly below to be cleaner
        }
    }

    // Refined Style Fetching
    const refinedUserStyle = [];
    for (const ev of recentEvents) {
        const { data: fullEvent } = await supabase.from("events").select("name").eq("id", ev.id).single();
        const { data: items } = await supabase.from("event_items").select("category").eq("event_id", ev.id);

        const categories = new Set(items?.map((i: any) => i.category).filter(Boolean) as string[]);

        refinedUserStyle.push({
            name: fullEvent?.name || "Unnamed Event",
            itemCount: items?.length || 0,
            hasDetailedSchedule: false, // Simplified for now
            topCategories: Array.from(categories).slice(0, 5)
        });
    }

    return {
        historicalAggregates: {
            avgBudgetPerAttendee: parseFloat(avgBudgetPerAttendee.toFixed(2)),
            commonItemCategories: ["Food", "Materials", "Equipment"], // Placeholder, could aggregate from all items
            avgDurationHours: parseFloat(avgDurationHours.toFixed(1)),
        },
        userStyle: {
            lastEvents: refinedUserStyle,
        },
    };
}
