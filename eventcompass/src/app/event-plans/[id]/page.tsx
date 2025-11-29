import EventPlanningPage from "@/components/EventPlanningPage";

export default async function EventDetails({ params }: { params: { id: string } }) {
    const { id: eventId } = await params; 
    console.log("Event ID:", eventId); // Log the event ID to verify it's being received correctly
    return <EventPlanningPage id={eventId} />;
}
