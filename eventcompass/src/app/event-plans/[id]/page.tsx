import EventPlanningPage from "@/components/EventPlanningPage";
import { Suspense } from "react";

export default async function EventDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    console.log("Event ID:", id); // Log the event ID to verify it's being received correctly
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EventPlanningPage id={id} />
        </Suspense>
    );
}
