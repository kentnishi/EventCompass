"use client";
import React, { useState } from "react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PeopleIcon from "@mui/icons-material/People";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";

const OverviewTab = ({ 
  eventPlan, 
  updatePlan, 
  isReadOnly 
}: { 
  eventPlan: any; 
  updatePlan: (field: string, value: any) => void; 
  isReadOnly: boolean 
}) => {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [tempData, setTempData] = useState<any>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const startEditing = (section: string) => {
    setEditingSection(section);
    // Save current state as temp data
    if (section === 'basic') {
      setTempData({ 
        name: eventPlan.name,
        description: eventPlan.description 
      });
    } else if (section === 'datetime') {
      setTempData({
        start_date: eventPlan.start_date,
        start_time: eventPlan.start_time,
        end_date: eventPlan.end_date,
        end_time: eventPlan.end_time,
      });
    } else if (section === 'logistics') {
      setTempData({
        location: eventPlan.location,
        attendees: eventPlan.attendees,
        registration_required: eventPlan.registration_required,
      });
    }
    setHasUnsavedChanges(false);
  };

  const saveSection = () => {
    // Apply temp changes to actual data
    Object.keys(tempData).forEach(key => {
      updatePlan(key, tempData[key]);
    });
    setEditingSection(null);
    setTempData({});
    setHasUnsavedChanges(false);
  };

  const cancelEdit = () => {
    setEditingSection(null);
    setTempData({});
    setHasUnsavedChanges(false);
  };

  const updateTempData = (field: string, value: any) => {
    setTempData((prev: any) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
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
      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        {/* Basic Information Section */}
        <div
          style={{
            paddingBottom: "32px",
            borderBottom: "1px solid #e5e7ff",
          }}
        >
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginBottom: "20px"
          }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#333", margin: 0 }}>
              Basic Information
            </h3>
            {!isReadOnly && editingSection !== 'basic' && (
              <button
                onClick={() => startEditing('basic')}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  backgroundColor: "transparent",
                  color: "#6B7FD7",
                  border: "1px solid #6B7FD7",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#6B7FD7";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#6B7FD7";
                }}
              >
                <EditIcon style={{ width: "16px", height: "16px" }} />
                Edit
              </button>
            )}
            {editingSection === 'basic' && (
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={saveSection}
                  disabled={!hasUnsavedChanges}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 16px",
                    backgroundColor: hasUnsavedChanges ? "#6B7FD7" : "#ccc",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    cursor: hasUnsavedChanges ? "pointer" : "not-allowed",
                  }}
                >
                  <SaveIcon style={{ width: "16px", height: "16px" }} />
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 16px",
                    backgroundColor: "transparent",
                    color: "#666",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <CloseIcon style={{ width: "16px", height: "16px" }} />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {editingSection === 'basic' ? (
            // Edit Mode
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#4a5676",
                    marginBottom: "8px",
                  }}
                >
                  Event Name *
                </label>
                <input
                  type="text"
                  value={tempData.name || ""}
                  onChange={(e) => updateTempData("name", e.target.value)}
                  placeholder="Enter event name"
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: "1rem",
                    border: "2px solid #6B7FD7",
                    borderRadius: "8px",
                    color: "#4a5676",
                    fontWeight: 500,
                    outline: "none",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#4a5676",
                    marginBottom: "8px",
                  }}
                >
                  Description
                </label>
                <textarea
                  value={tempData.description || ""}
                  onChange={(e) => updateTempData("description", e.target.value)}
                  placeholder="Describe your event..."
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: "1rem",
                    border: "2px solid #6B7FD7",
                    borderRadius: "8px",
                    color: "#4a5676",
                    fontWeight: 500,
                    resize: "vertical",
                    minHeight: "120px",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />
              </div>
              <button
                style={{
                  alignSelf: "flex-start",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  backgroundColor: "#f8f9ff",
                  color: "#6B7FD7",
                  border: "1px solid #6B7FD7",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#6B7FD7";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8f9ff";
                  e.currentTarget.style.color = "#6B7FD7";
                }}
              >
                <AutoAwesomeIcon style={{ width: "16px", height: "16px" }} />
                AI: Improve Description
              </button>
            </div>
          ) : (
            // View Mode
            <div>
              <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "6px" }}>
                Event Name
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "16px" }}>
                {eventPlan.name || "Untitled Event"}
              </div>
              {eventPlan.description && (
                <>
                  <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "6px" }}>
                    Description
                  </div>
                  <div style={{ fontSize: "1rem", color: "#4a5676", lineHeight: "1.6" }}>
                    {eventPlan.description}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Date & Time Section */}
        <div
          style={{
            paddingBottom: "32px",
            borderBottom: "1px solid #e5e7ff",
          }}
        >
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginBottom: "20px"
          }}>
            <h3 style={{ 
              fontSize: "1.2rem", 
              fontWeight: 700, 
              color: "#333", 
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <CalendarTodayIcon style={{ width: "20px", height: "20px", color: "#6B7FD7" }} />
              Date & Time
            </h3>
            {!isReadOnly && editingSection !== 'datetime' && (
              <button
                onClick={() => startEditing('datetime')}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  backgroundColor: "transparent",
                  color: "#6B7FD7",
                  border: "1px solid #6B7FD7",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#6B7FD7";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#6B7FD7";
                }}
              >
                <EditIcon style={{ width: "16px", height: "16px" }} />
                Edit
              </button>
            )}
            {editingSection === 'datetime' && (
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={saveSection}
                  disabled={!hasUnsavedChanges}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 16px",
                    backgroundColor: hasUnsavedChanges ? "#6B7FD7" : "#ccc",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    cursor: hasUnsavedChanges ? "pointer" : "not-allowed",
                  }}
                >
                  <SaveIcon style={{ width: "16px", height: "16px" }} />
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 16px",
                    backgroundColor: "transparent",
                    color: "#666",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <CloseIcon style={{ width: "16px", height: "16px" }} />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {editingSection === 'datetime' ? (
            // Edit Mode
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "#4a5676", marginBottom: "8px" }}>
                  Start
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <input
                    type="date"
                    value={tempData.start_date || ""}
                    onChange={(e) => updateTempData("start_date", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      fontSize: "1rem",
                      border: "2px solid #6B7FD7",
                      borderRadius: "8px",
                      color: "#4a5676",
                      fontWeight: 500,
                    }}
                  />
                  <input
                    type="time"
                    value={tempData.start_time || ""}
                    onChange={(e) => updateTempData("start_time", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      fontSize: "1rem",
                      border: "2px solid #6B7FD7",
                      borderRadius: "8px",
                      color: "#4a5676",
                      fontWeight: 500,
                    }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "#4a5676", marginBottom: "8px" }}>
                  End
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <input
                    type="date"
                    value={tempData.end_date || ""}
                    onChange={(e) => updateTempData("end_date", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      fontSize: "1rem",
                      border: "2px solid #6B7FD7",
                      borderRadius: "8px",
                      color: "#4a5676",
                      fontWeight: 500,
                    }}
                  />
                  <input
                    type="time"
                    value={tempData.end_time || ""}
                    onChange={(e) => updateTempData("end_time", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      fontSize: "1rem",
                      border: "2px solid #6B7FD7",
                      borderRadius: "8px",
                      color: "#4a5676",
                      fontWeight: 500,
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            // View Mode
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <div>
                <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "6px" }}>
                  Start Date & Time
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#1a1a1a" }}>
                  {eventPlan.start_date 
                    ? new Date(eventPlan.start_date + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : "Not set"}
                  {eventPlan.start_time && ` at ${eventPlan.start_time}`}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "6px" }}>
                  End Date & Time
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#1a1a1a" }}>
                  {eventPlan.end_date 
                    ? new Date(eventPlan.end_date + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : "Not set"}
                  {eventPlan.end_time && ` at ${eventPlan.end_time}`}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Location & Logistics Section */}
        <div>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginBottom: "20px"
          }}>
            <h3 style={{ 
              fontSize: "1.2rem", 
              fontWeight: 700, 
              color: "#333", 
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <LocationOnIcon style={{ width: "20px", height: "20px", color: "#6B7FD7" }} />
              Location & Logistics
            </h3>
            {!isReadOnly && editingSection !== 'logistics' && (
              <button
                onClick={() => startEditing('logistics')}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  backgroundColor: "transparent",
                  color: "#6B7FD7",
                  border: "1px solid #6B7FD7",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#6B7FD7";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#6B7FD7";
                }}
              >
                <EditIcon style={{ width: "16px", height: "16px" }} />
                Edit
              </button>
            )}
            {editingSection === 'logistics' && (
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={saveSection}
                  disabled={!hasUnsavedChanges}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 16px",
                    backgroundColor: hasUnsavedChanges ? "#6B7FD7" : "#ccc",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    cursor: hasUnsavedChanges ? "pointer" : "not-allowed",
                  }}
                >
                  <SaveIcon style={{ width: "16px", height: "16px" }} />
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 16px",
                    backgroundColor: "transparent",
                    color: "#666",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <CloseIcon style={{ width: "16px", height: "16px" }} />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {editingSection === 'logistics' ? (
            // Edit Mode
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "#4a5676", marginBottom: "8px" }}>
                  Venue / Location
                </label>
                <input
                  type="text"
                  value={tempData.location || ""}
                  onChange={(e) => updateTempData("location", e.target.value)}
                  placeholder="e.g., Student Center Room 201"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: "1rem",
                    border: "2px solid #6B7FD7",
                    borderRadius: "8px",
                    color: "#4a5676",
                    fontWeight: 500,
                  }}
                />
              </div>
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.9rem", fontWeight: 600, color: "#4a5676", marginBottom: "8px" }}>
                  <PeopleIcon style={{ width: "18px", height: "18px" }} />
                  Expected Attendance
                </label>
                <input
                  type="number"
                  value={tempData.attendees || 0}
                  onChange={(e) => updateTempData("attendees", parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: "1rem",
                    border: "2px solid #6B7FD7",
                    borderRadius: "8px",
                    color: "#4a5676",
                    fontWeight: 500,
                  }}
                />
              </div>
              <div style={{ padding: "16px", backgroundColor: "#f8f9ff", borderRadius: "8px", border: "1px solid #e5e7ff" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.95rem", fontWeight: 600, color: "#4a5676", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={tempData.registration_required || false}
                    onChange={(e) => updateTempData("registration_required", e.target.checked)}
                    style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "#6B7FD7" }}
                  />
                  Registration Required
                </label>
              </div>
            </div>
          ) : (
            // View Mode
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px" }}>
              <div>
                <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "6px" }}>
                  Venue / Location
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#1a1a1a" }}>
                  {eventPlan.location || "Not set"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "6px" }}>
                  Expected Attendance
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#1a1a1a" }}>
                  {eventPlan.attendees || 0} people
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "6px" }}>
                  Total Budget
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#1a1a1a" }}>
                  ${Number(eventPlan.budget || 0).toFixed(2) || "0.00"}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#888", fontStyle: "italic", marginTop: "2px" }}>
                  Auto-calculated
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "6px" }}>
                  Registration
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: 600, color: eventPlan.registration_required ? "#4caf50" : "#888" }}>
                  {eventPlan.registration_required ? "✓ Required" : "Not required"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;