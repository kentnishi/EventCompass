import EventPlanningPage from "@/components/EventPlanningPage";

export default function EventDetails({ params }: { params: { id: string } }) {
    console.log("Event ID:", params.id); // Log the event ID to verify it's being received correctly
    return <EventPlanningPage id={params.id} />;
}
