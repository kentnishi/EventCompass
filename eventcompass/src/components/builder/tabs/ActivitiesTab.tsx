import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import PeopleIcon from "@mui/icons-material/People";
import { Activity, StaffingNeed } from "@/types/eventPlan";
import ActivityModal from "./modals/ActivityModal";

interface ScheduleItem {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  activity_id?: number;
}

interface ShoppingItem {
  id: number;
  item_name: string;
  quantity: number;
  unit: string;
  estimated_cost: string;
  activity_id?: number;
}


interface ActivitiesTabProps {
  activities: Activity[];
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
  isReadOnly: boolean;
  updateActivity: (index: number, field: string, value: any) => void;
  addActivity: () => void;
  deleteActivity: (index: number) => void;
  scheduleItems?: ScheduleItem[];
  shoppingItems?: ShoppingItem[];
}

const ActivitiesTab: React.FC<ActivitiesTabProps> = ({
  activities,
  setActivities,
  isReadOnly,
  updateActivity,
  addActivity,
  deleteActivity,
  scheduleItems = [],
  shoppingItems = [],
}) => {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleActivityClick = (activity: Activity, index: number) => {
    setSelectedActivity(activity);
    setSelectedIndex(index);
  };

  const handleActivityUpdated = (updatedActivity: Activity) => {
    setActivities((prevActivities) =>
      prevActivities.map((activity) =>
        activity.id === updatedActivity.id ? updatedActivity : activity
      )
    );
  };
  
  const handleActivityDeleted = () => {
    if (selectedIndex !== null) {
      setActivities((prevActivities) =>
        prevActivities.filter((_, index) => index !== selectedIndex)
      );
      setSelectedActivity(null);
      setSelectedIndex(null);
    }
  };

  const getRelatedScheduleItems = (activityId: number) => {
    return scheduleItems.filter((item) => item.activity_id === activityId);
  };

  const getRelatedShoppingItems = (activityId: number) => {
    return shoppingItems.filter((item) => item.activity_id === activityId);
  };

  return (
    <div
      style={{
        backgroundColor: "#FFF",
        borderRadius: "12px",
        padding: "32px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h3
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#333",
            margin: 0,
          }}
        >
          Activities
        </h3>
        {!isReadOnly && (
          <button
            onClick={addActivity}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              backgroundColor: "#6B7FD7",
              color: "#FFF",
              border: "none",
              borderRadius: "8px",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <AddIcon style={{ width: "16px", height: "16px" }} />
            Add Activity
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {activities.map((activity, i) => {
          const staffCount = activity.staffing_needs?.reduce(
            (sum, need) => sum + need.count,
            0
          ) || 0;

          return (
            <div
              key={activity.id || i}
              onClick={() => handleActivityClick(activity, i)}
              style={{
                padding: "16px",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                backgroundColor: "#fff",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
                e.currentTarget.style.borderColor = "#C4B5FD";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "#E5E7EB";
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontWeight: 600, fontSize: "1.125rem", color: "#1F2937", margin: "0 0 4px 0" }}>
                    {activity.name || "Untitled Activity"}
                  </h4>
                  <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0 0 8px 0" }}>
                    {activity.description || "No description"}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "0.75rem", color: "#9CA3AF" }}>
                    {staffCount > 0 && (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <PeopleIcon style={{ width: "14px", height: "14px" }} />
                        {staffCount} staff
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ marginLeft: "16px", color: "#8B5CF6" }}>
                  <svg style={{ width: "20px", height: "20px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}

        {activities.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "48px 24px",
              color: "#9CA3AF",
              fontSize: "0.875rem",
            }}
          >
            No activities yet. {!isReadOnly && 'Click "Add Activity" to create one.'}
          </div>
        )}
      </div>

      {selectedActivity && selectedIndex !== null && (
        <ActivityModal
          activity={selectedActivity}
          onClose={() => {
            setSelectedActivity(null);
            setSelectedIndex(null);
          }}
          onActivityUpdated={handleActivityUpdated}
          onActivityDeleted={handleActivityDeleted}
          isReadOnly={isReadOnly}
          scheduleItems={getRelatedScheduleItems(selectedActivity.id)}
          shoppingItems={getRelatedShoppingItems(selectedActivity.id)}
        />
      )}
    </div>
  );
};

export default ActivitiesTab;