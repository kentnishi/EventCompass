// UPDATE TO ONLY SHOW EVENT IN PROGRESS

import EventPlan from "@/components/EventPagewithPlan";

export default function Events() {

  return <EventPlan filterByStatus="planning" />;

}
