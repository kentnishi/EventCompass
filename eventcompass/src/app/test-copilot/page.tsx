"use client";

import React from "react";
import EventCopilot from "@/components/eventcopilot/EventCopilot";

export default function TestCopilotPage() {
    const dummyEventPlan = {
        name: "Test Event",
        activities: [],
        schedule: [],
        shopping: [],
        tasks: [],
        budget: []
    };

    const dummyUpdatePlan = (field: string, value: any) => {
        console.log("Update plan:", field, value);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-2xl font-bold mb-4">Event Copilot Test Page</h1>
            <p className="mb-8">The Event Copilot widget should appear in the bottom-right corner.</p>

            <div className="border p-4 bg-white rounded shadow">
                <p>Content to simulate a page...</p>
            </div>

            <EventCopilot
                eventPlan={dummyEventPlan}
                updatePlan={dummyUpdatePlan}
                eventId="test-event-id"
            />
        </div>
    );
}
