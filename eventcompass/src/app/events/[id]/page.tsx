import EventPlanningPage from "@/components/EventPlanningPage";

export default function EventDetails({ params }: { params: { id: string } }) {
    const eventId = params.id;
    console.log("Event ID:", eventId); // Log the event ID to verify it's being received correctly
    return <EventPlanningPage id={eventId} />;
}
