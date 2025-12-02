import React, { useState } from "react";
import { Button } from "@mui/material";
import { Description } from "@mui/icons-material";
import EventReportModal from "./modals/EventReportModal";
import { EventPlan } from "@/types/eventPlan";

interface SummaryTabButtonProps {
  eventPlan: EventPlan;
}

const SummaryTabButton: React.FC<SummaryTabButtonProps> = ({ eventPlan }) => {
  const [showReportModal, setShowReportModal] = useState(false);

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<Description />}
        onClick={() => setShowReportModal(true)}
        sx={{ textTransform: "none" }}
      >
        Generate Report
      </Button>

      <EventReportModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        eventPlan={eventPlan}
      />
    </>
  );
};

export default SummaryTabButton;

// Usage example in your main event page:
// <SummaryTabButton eventPlan={eventPlan} />