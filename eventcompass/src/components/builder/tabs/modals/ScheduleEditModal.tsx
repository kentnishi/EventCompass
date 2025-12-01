import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NotesIcon from "@mui/icons-material/Notes";

import { ScheduleItem, Activity } from "@/types/eventPlan";
import { LocalActivity } from "@mui/icons-material";


interface ScheduleEditModalProps {
  item: ScheduleItem;
  index: number;
  activities: Activity[];
  isReadOnly: boolean;
  onClose: () => void;
  onUpdate: (index: number, field: keyof ScheduleItem, updatedValue: any) => void;
  onDelete: (index: number) => void;
}

const ScheduleEditModal: React.FC<ScheduleEditModalProps> = ({
  item,
  index,
  activities,
  isReadOnly,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [isMultiDay, setIsMultiDay] = useState(!!item.end_date);
  const [localActivityId, setLocalActivityId] = useState<number | null>(item.activity_id);
  const [localStartDate, setLocalStartDate] = useState(item.start_date);
  const [localEndDate, setLocalEndDate] = useState(item.end_date || item.start_date);
  const [localStartTime, setLocalStartTime] = useState(item.start_time);
  const [localEndTime, setLocalEndTime] = useState(item.end_time);
  const [localLocation, setLocalLocation] = useState(item.location || "");
  const [localNotes, setLocalNotes] = useState(item.notes || "");

  const handleMultiDayToggle = (checked: boolean) => {
    setIsMultiDay(checked);
  
    if (checked) {
      const nextDay = new Date(localStartDate + "T00:00:00");
      nextDay.setDate(nextDay.getDate() + 1);
      const newEndDate = nextDay.toISOString().split("T")[0];
      setLocalEndDate(newEndDate);
  
      // Update only the end_date field
      onUpdate(index, "end_date", newEndDate);
    } else {
      setLocalEndDate(localStartDate);
  
      // Update only the end_date field to null
      onUpdate(index, "end_date", null);
    }
  };

  // Function to handle updating a schedule item
  const handleUpdateScheduleItem = async () => {
    try {
      // Update each field individually using the new onUpdate method
      onUpdate(index, "start_date", localStartDate);
      onUpdate(index, "end_date", localEndDate);
      onUpdate(index, "start_time", localStartTime);
      onUpdate(index, "end_time", localEndTime);
      onUpdate(index, "location", localLocation);
      onUpdate(index, "notes", localNotes);
  
      // Send the updated item to the backend
      const updatedItem = {
        ...item,
        start_date: localStartDate,
        end_date: localEndDate,
        start_time: localStartTime,
        end_time: localEndTime,
        location: localLocation,
        notes: localNotes,
      };
      const id = item.id;
      const response = await fetch(`/api/event-plans/schedule/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedItem),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update schedule item");
      }
  
      console.log("Schedule item updated successfully");
      onClose(); // Close the modal after successful update
    } catch (error) {
      console.error("Error updating schedule item:", error);
    }
  };

  // Function to handle deleting a schedule item
  const handleDeleteScheduleItem = async () => {
    try {
      const id = item.id;
      const response = await fetch(`/api/event-plans/schedule/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete schedule item");
      }

      console.log("Schedule item deleted successfully");
      onDelete(index); // Notify parent component
      onClose();
    } catch (error) {
      console.error("Error deleting schedule item:", error);
    }
  };

  const handleActivityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newActivityId = e.target.value ? parseInt(e.target.value) : null;
    setLocalActivityId(newActivityId);
    onUpdate(index, "activity_id", newActivityId); // Update the activity_id field
  };


  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "32px",
          maxWidth: "600px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
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
            {isReadOnly ? "Schedule Item Details" : "Edit Schedule Item"}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#666",
              padding: "4px",
            }}
          >
            <CloseIcon />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
         {/* Activity Dropdown */}
         <div>
            <label
              style={{
                display: "block",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#333",
                marginBottom: "8px",
              }}
            >
              Activity
            </label>
            <select
              value={localActivityId || ""}
              onChange={handleActivityChange}
              disabled={isReadOnly}
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "0.9rem",
                border: "1px solid #ddd",
                borderRadius: "6px",
                backgroundColor: isReadOnly ? "#f5f5f5" : "#fff",
                cursor: isReadOnly ? "not-allowed" : "pointer",
              }}
            >
              <option value="">Select an activity...</option>
              {activities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.name}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#333",
                marginBottom: "8px",
              }}
            >
              Start Date
            </label>
            <input
              type="date"
              value={localStartDate}
              onChange={(e) => {
                setLocalStartDate(e.target.value);
                onUpdate(index, "start_date", e.target.value);
              }}
              disabled={isReadOnly}
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "0.9rem",
                border: "1px solid #ddd",
                borderRadius: "6px",
                backgroundColor: isReadOnly ? "#f5f5f5" : "#fff",
                cursor: isReadOnly ? "not-allowed" : "text",
              }}
            />
          </div>

          {/* Multi-day Toggle */}
          {!isReadOnly && (
            <div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={isMultiDay}
                  onChange={(e) => handleMultiDayToggle(e.target.checked)}
                  style={{ width: "auto", cursor: "pointer" }}
                />
                <span
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#333",
                  }}
                >
                  This activity spans multiple days
                </span>
              </label>
            </div>
          )}

          {/* End Date */}
          {isMultiDay && (
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "#333",
                  marginBottom: "8px",
                }}
              >
                End Date
              </label>
              <input
                type="date"
                value={localEndDate}
                onChange={(e) => {
                  setLocalEndDate(e.target.value);
                  onUpdate(index, "end_date", e.target.value);
                }}
                disabled={isReadOnly}
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "0.9rem",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  backgroundColor: isReadOnly ? "#f5f5f5" : "#fff",
                  cursor: isReadOnly ? "not-allowed" : "text",
                }}
              />
            </div>
          )}

          {/* Start Time and End Time */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "#333",
                  marginBottom: "8px",
                }}
              >
                Start Time
              </label>
              <input
                type="time"
                value={localStartTime}
                onChange={(e) => {
                  setLocalStartTime(e.target.value);
                  onUpdate(index, "start_time", e.target.value);
                }}
                disabled={isReadOnly}
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "0.9rem",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  backgroundColor: isReadOnly ? "#f5f5f5" : "#fff",
                  cursor: isReadOnly ? "not-allowed" : "text",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "#333",
                  marginBottom: "8px",
                }}
              >
                End Time
              </label>
              <input
                type="time"
                value={localEndTime}
                onChange={(e) => {
                  setLocalEndTime(e.target.value);
                  onUpdate(index, "end_time", e.target.value);
                }}
                disabled={isReadOnly}
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "0.9rem",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  backgroundColor: isReadOnly ? "#f5f5f5" : "#fff",
                  cursor: isReadOnly ? "not-allowed" : "text",
                }}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#333",
                marginBottom: "8px",
              }}
            >
              <LocationOnIcon style={{ width: "18px", height: "18px" }} />
              Location
            </label>
            <input
              type="text"
              value={item.location || ""}
              onChange={(e) => onUpdate(index, "location", e.target.value)}
              placeholder="e.g., Grand Ballroom, Room 301, Outdoor Quad"
              disabled={isReadOnly}
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "0.9rem",
                border: "1px solid #ddd",
                borderRadius: "6px",
                backgroundColor: isReadOnly ? "#f5f5f5" : "#fff",
                cursor: isReadOnly ? "not-allowed" : "text",
              }}
            />
          </div>

          {/* Notes */}
          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#333",
                marginBottom: "8px",
              }}
            >
              <NotesIcon style={{ width: "18px", height: "18px" }} />
              Notes
            </label>
            <textarea
              value={item.notes || ""}
              onChange={(e) => onUpdate(index, "notes", e.target.value)}
              placeholder="Add any additional notes or details..."
              disabled={isReadOnly}
              rows={4}
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "0.9rem",
                border: "1px solid #ddd",
                borderRadius: "6px",
                backgroundColor: isReadOnly ? "#f5f5f5" : "#fff",
                cursor: isReadOnly ? "not-allowed" : "text",
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "32px",
            justifyContent: "flex-end",
          }}
        >
          {!isReadOnly && (
            <button
              onClick={() => {
                if (confirm("Are you sure you want to delete this schedule item?")) {
                  handleDeleteScheduleItem();
                }
              }}
              disabled={isReadOnly}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                backgroundColor: "#f44336",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <DeleteIcon style={{ width: "16px", height: "16px" }} />
              Delete
            </button>
          )}
          <button
            onClick={handleUpdateScheduleItem} 
            disabled={isReadOnly}
            style={{
              padding: "10px 20px",
              backgroundColor: "#6B7FD7",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {isReadOnly ? "Close" : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleEditModal;