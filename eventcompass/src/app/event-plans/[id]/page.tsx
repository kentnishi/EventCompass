import EventPlanningPage from "@/components/EventPlanningPage";

export default async function EventDetails({ params }: { params: { id: string } }) {
    const eventId = await params.id;
    console.log("Event ID:", eventId); // Log the event ID to verify it's being received correctly
    return <EventPlanningPage id={eventId} />;
}
