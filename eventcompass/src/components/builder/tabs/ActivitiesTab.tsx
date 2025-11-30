import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PeopleIcon from "@mui/icons-material/People";
import DescriptionIcon from "@mui/icons-material/Description";

interface StaffingNeed {
  id: number;
  count: number;
  responsibility: string;
}

interface Activity {
  id: number;
  name: string;
  description: string;
  notes?: string;
  staffing_needs?: StaffingNeed[];
}

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

interface ActivityModalProps {
  activity: Activity;
  onClose: () => void;
  onUpdate: (activity: Activity) => void;
  onDelete: () => void;
  isReadOnly: boolean;
  scheduleItems: ScheduleItem[];
  shoppingItems: ShoppingItem[];
}

const ActivityModal: React.FC<ActivityModalProps> = ({
  activity,
  onClose,
  onUpdate,
  onDelete,
  isReadOnly,
  scheduleItems,
  shoppingItems,
}) => {
  const [name, setName] = useState(activity.name);
  const [description, setDescription] = useState(activity.description);
  const [notes, setNotes] = useState(activity.notes || "");
  const [staffingNeeds, setStaffingNeeds] = useState<StaffingNeed[]>(
    activity.staffing_needs || []
  );

  const handleSave = () => {
    onUpdate({
      ...activity,
      name,
      description,
      notes,
      staffing_needs: staffingNeeds,
    });
  };

  // Auto-save on changes
  React.useEffect(() => {
    if (!isReadOnly) {
      const timer = setTimeout(() => {
        handleSave();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [name, description, notes, staffingNeeds]);

  const addStaffingNeed = () => {
    setStaffingNeeds([
      ...staffingNeeds,
      { id: Date.now(), count: 1, responsibility: "" },
    ]);
  };

  const updateStaffingNeed = (id: number, field: string, value: any) => {
    setStaffingNeeds(
      staffingNeeds.map((need) =>
        need.id === id ? { ...need, [field]: value } : need
      )
    );
  };

  const removeStaffingNeed = (id: number) => {
    setStaffingNeeds(staffingNeeds.filter((need) => need.id !== id));
  };

  const totalStaff = staffingNeeds.reduce((sum, need) => sum + need.count, 0);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          maxWidth: "1200px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "#F5F3FF",
            padding: "24px",
            borderBottom: "1px solid #E9D5FF",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isReadOnly}
            placeholder="Activity name"
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "#1F2937",
              backgroundColor: "transparent",
              border: "none",
              outline: "none",
              padding: "8px",
              marginLeft: "-8px",
              width: "100%",
              cursor: isReadOnly ? "not-allowed" : "text",
            }}
            onFocus={(e) => {
              if (!isReadOnly) {
                e.target.style.backgroundColor = "#fff";
                e.target.style.borderRadius = "6px";
              }
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = "transparent";
            }}
          />
          <button
            onClick={onClose}
            style={{
              marginLeft: "16px",
              color: "#9CA3AF",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <CloseIcon style={{ width: "24px", height: "24px" }} />
          </button>
        </div>

        {/* Content - Two Column Layout */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
          {/* Main Content Area */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            {/* Description */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isReadOnly}
                placeholder="Brief description of this activity..."
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #D1D5DB",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  resize: "vertical",
                  minHeight: "80px",
                  outline: "none",
                  backgroundColor: isReadOnly ? "#F9FAFB" : "#fff",
                  cursor: isReadOnly ? "not-allowed" : "text",
                }}
                onFocus={(e) => {
                  if (!isReadOnly) {
                    e.target.style.borderColor = "#A78BFA";
                    e.target.style.boxShadow = "0 0 0 3px rgba(167, 139, 250, 0.1)";
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#D1D5DB";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Notes/Instructions */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <DescriptionIcon style={{ width: "18px", height: "18px", color: "#8B5CF6" }} />
                <label
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "#374151",
                  }}
                >
                  Notes & Instructions
                </label>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isReadOnly}
                placeholder="Detailed notes, setup instructions, special requirements..."
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #D1D5DB",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  resize: "vertical",
                  minHeight: "100px",
                  outline: "none",
                  backgroundColor: isReadOnly ? "#F9FAFB" : "#fff",
                  cursor: isReadOnly ? "not-allowed" : "text",
                }}
                onFocus={(e) => {
                  if (!isReadOnly) {
                    e.target.style.borderColor = "#A78BFA";
                    e.target.style.boxShadow = "0 0 0 3px rgba(167, 139, 250, 0.1)";
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#D1D5DB";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Staffing Needs - Structured */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <PeopleIcon style={{ width: "18px", height: "18px", color: "#8B5CF6" }} />
                  <label
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: "#374151",
                    }}
                  >
                    Staffing Needs
                  </label>
                </div>
                {!isReadOnly && (
                  <button
                    onClick={addStaffingNeed}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "0.875rem",
                      color: "#8B5CF6",
                      fontWeight: 500,
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <AddIcon style={{ width: "16px", height: "16px" }} />
                    Add Staff
                  </button>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {staffingNeeds.map((need) => (
                  <div
                    key={need.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px",
                      backgroundColor: "#F9FAFB",
                      borderRadius: "8px",
                      border: "1px solid #E5E7EB",
                    }}
                  >
                    <input
                      type="number"
                      min="1"
                      value={need.count}
                      onChange={(e) =>
                        updateStaffingNeed(need.id, "count", parseInt(e.target.value) || 1)
                      }
                      disabled={isReadOnly}
                      style={{
                        width: "64px",
                        padding: "8px 12px",
                        border: "1px solid #D1D5DB",
                        borderRadius: "6px",
                        textAlign: "center",
                        outline: "none",
                        backgroundColor: isReadOnly ? "#F3F4F6" : "#fff",
                        cursor: isReadOnly ? "not-allowed" : "text",
                      }}
                    />
                    <span style={{ color: "#6B7280", fontSize: "0.875rem" }}>×</span>
                    <input
                      type="text"
                      value={need.responsibility}
                      onChange={(e) =>
                        updateStaffingNeed(need.id, "responsibility", e.target.value)
                      }
                      disabled={isReadOnly}
                      placeholder="Role or responsibility..."
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        border: "1px solid #D1D5DB",
                        borderRadius: "6px",
                        outline: "none",
                        backgroundColor: isReadOnly ? "#F3F4F6" : "#fff",
                        cursor: isReadOnly ? "not-allowed" : "text",
                      }}
                    />
                    {!isReadOnly && (
                      <button
                        onClick={() => removeStaffingNeed(need.id)}
                        style={{
                          color: "#9CA3AF",
                          backgroundColor: "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: "4px",
                        }}
                      >
                        <DeleteIcon style={{ width: "18px", height: "18px" }} />
                      </button>
                    )}
                  </div>
                ))}

                {staffingNeeds.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "24px",
                      color: "#6B7280",
                      fontSize: "0.875rem",
                    }}
                  >
                    No staffing needs defined. {!isReadOnly && 'Click "Add Staff" to add one.'}
                  </div>
                )}
              </div>

              {staffingNeeds.length > 0 && (
                <div style={{ marginTop: "12px", fontSize: "0.875rem", color: "#6B7280" }}>
                  Total: <span style={{ fontWeight: 600 }}>{totalStaff}</span> staff members needed
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Related Items */}
          <div
            style={{
              width: "320px",
              backgroundColor: "#F9FAFB",
              borderLeft: "1px solid #E5E7EB",
              overflowY: "auto",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            {/* Related Schedule Items */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <CalendarTodayIcon style={{ width: "18px", height: "18px", color: "#8B5CF6" }} />
                <h3
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#1F2937",
                    margin: 0,
                  }}
                >
                  Schedule
                </h3>
              </div>

              {scheduleItems.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {scheduleItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: "12px",
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        border: "1px solid #E5E7EB",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#C4B5FD";
                        e.currentTarget.style.boxShadow = "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#E5E7EB";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div style={{ fontWeight: 500, color: "#1F2937", fontSize: "0.875rem" }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: "4px" }}>
                        {item.start_time} - {item.end_time}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "16px",
                    color: "#6B7280",
                    fontSize: "0.75rem",
                  }}
                >
                  No schedule items linked
                </div>
              )}
            </div>

            {/* Related Shopping Items */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <ShoppingCartIcon style={{ width: "18px", height: "18px", color: "#8B5CF6" }} />
                <h3
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#1F2937",
                    margin: 0,
                  }}
                >
                  Shopping List
                </h3>
              </div>

              {shoppingItems.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {shoppingItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: "12px",
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        border: "1px solid #E5E7EB",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#C4B5FD";
                        e.currentTarget.style.boxShadow = "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#E5E7EB";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div style={{ fontWeight: 500, color: "#1F2937", fontSize: "0.875rem" }}>
                        {item.item_name}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: "4px" }}>
                        {item.quantity} {item.unit}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#8B5CF6", fontWeight: 600, marginTop: "4px" }}>
                        ${item.estimated_cost}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "16px",
                    color: "#6B7280",
                    fontSize: "0.75rem",
                  }}
                >
                  No shopping items linked
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            backgroundColor: "#F9FAFB",
            borderTop: "1px solid #E5E7EB",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ fontSize: "0.875rem", color: "#6B7280" }}>Auto-saved</div>
            {!isReadOnly && (
              <button
                onClick={onDelete}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 12px",
                  backgroundColor: "transparent",
                  color: "#EF4444",
                  border: "1px solid #EF4444",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                <DeleteIcon style={{ width: "16px", height: "16px" }} />
                Delete Activity
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              backgroundColor: "#8B5CF6",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

interface ActivitiesTabProps {
  activities: Activity[];
  isReadOnly: boolean;
  updateActivity: (index: number, field: string, value: any) => void;
  addActivity: () => void;
  deleteActivity: (index: number) => void;
  scheduleItems?: ScheduleItem[];
  shoppingItems?: ShoppingItem[];
}

const ActivitiesTab: React.FC<ActivitiesTabProps> = ({
  activities,
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

  const handleUpdateActivity = (updatedActivity: Activity) => {
    if (selectedIndex !== null) {
      Object.keys(updatedActivity).forEach((key) => {
        if (key !== "id") {
          updateActivity(selectedIndex, key, updatedActivity[key as keyof Activity]);
        }
      });
    }
  };

  const handleDeleteActivity = () => {
    if (selectedIndex !== null) {
      deleteActivity(selectedIndex);
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
          onUpdate={handleUpdateActivity}
          onDelete={handleDeleteActivity}
          isReadOnly={isReadOnly}
          scheduleItems={getRelatedScheduleItems(selectedActivity.id)}
          shoppingItems={getRelatedShoppingItems(selectedActivity.id)}
        />
      )}
    </div>
  );
};

export default ActivitiesTab;