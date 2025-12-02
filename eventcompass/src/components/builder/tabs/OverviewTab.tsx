"use client";
import React, { useState, useEffect, useRef } from "react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PeopleIcon from "@mui/icons-material/People";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";

const OverviewTab = ({
  eventPlan,
  updatePlan,
  isReadOnly
}: {
  eventPlan: any;
  updatePlan: (field: string, value: any) => void;
  isReadOnly: boolean
}) => {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [keywordInput, setKeywordInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleFieldChange = (field: string, value: any) => {
    updatePlan(field, value);

  };

  const addKeyword = () => {
    if (keywordInput.trim()) {
      const currentKeywords = eventPlan.keywords || [];
      const newKeywords = [...currentKeywords, keywordInput.trim()];
      handleFieldChange("keywords", newKeywords);
      setKeywordInput("");
    }
  };

  const removeKeyword = (index: number) => {
    const newKeywords = eventPlan.keywords.filter((_: string, i: number) => i !== index);
    handleFieldChange("keywords", newKeywords);
  };

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (keywordInput.trim()) {
        addKeyword();
      }
      setEditingField(null);
    } else if (e.key === 'Escape') {
      setKeywordInput("");
      setEditingField(null);
    }
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const ClickToEditField = ({
    field,
    label,
    value,
    placeholder = "Click to add",
    type = "text",
    multiline = false,
    displayFormat = (v: any) => v || <span style={{ color: "#999", fontStyle: "italic" }}>{placeholder}</span>,
    displayStyle = {}
  }: {
    field: string;
    label: string;
    value: any;
    placeholder?: string;
    type?: string;
    multiline?: boolean;
    displayFormat?: (v: any) => any;
    displayStyle?: React.CSSProperties;
  }) => {
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    const [localValue, setLocalValue] = useState(value);
    const isEditing = editingField === field;

    // Update local value when prop changes
    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    const startEdit = () => {
      if (!isReadOnly) {
        setEditingField(field);
        setLocalValue(value);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    };

    const finishEdit = () => {
      setTimeout(() => {
        setEditingField(null);
        // Only save if value changed
        if (localValue !== value) {
          handleFieldChange(field, localValue);
        }
      }, 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !multiline) {
        e.preventDefault();
        finishEdit();
      } else if (e.key === 'Escape') {
        setLocalValue(value); // Revert on escape
        setTimeout(() => setEditingField(null), 0);
      } else if (e.key === 'Enter' && multiline && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        finishEdit();
      }
    };

    return (
      <div>
        <div style={{
          fontSize: "0.85rem",
          color: "#666",
          marginBottom: "6px"
        }}>
          {label}
        </div>

        {isEditing ? (
          multiline ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={localValue || ""}
              onChange={(e) => setLocalValue(e.target.value)}
              onBlur={finishEdit}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: "1rem",
                border: "2px solid #6B7FD7",
                borderRadius: "8px",
                color: "#4a5676",
                fontWeight: 500,
                backgroundColor: "white",
                boxShadow: "0 0 0 3px rgba(107, 127, 215, 0.1)",
                outline: "none",
                fontFamily: "inherit",
                minHeight: "100px",
                resize: "vertical",
              }}
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type={type}
              value={localValue || ""}
              onChange={(e) => {
                const newValue = type === "number"
                  ? (parseFloat(e.target.value) || 0)
                  : e.target.value;
                setLocalValue(newValue);
              }}
              onBlur={finishEdit}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              step={type === "number" ? "0.01" : undefined}
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: "1rem",
                border: "2px solid #6B7FD7",
                borderRadius: "8px",
                color: "#4a5676",
                fontWeight: 500,
                backgroundColor: "white",
                boxShadow: "0 0 0 3px rgba(107, 127, 215, 0.1)",
                outline: "none",
              }}
            />
          )
        ) : (
          <div
            onClick={startEdit}
            style={{
              ...displayStyle,
              cursor: isReadOnly ? "default" : "pointer",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "2px solid transparent",
              backgroundColor: isReadOnly ? "transparent" : "transparent",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (!isReadOnly) {
                e.currentTarget.style.backgroundColor = "#f8f9fa";
                e.currentTarget.style.borderColor = "#e5e7eb";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = "transparent";
            }}
          >
            {displayFormat(value)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        backgroundColor: "#FFF",
        borderRadius: "12px",
        padding: "32px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        position: "relative",
      }}
    >

      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        {/* Basic Information Section */}
        <div style={{ paddingBottom: "32px", borderBottom: "1px solid #e5e7ff" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#333", marginBottom: "20px" }}>
            Basic Information
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <ClickToEditField
              field="name"
              label="Event Name"
              value={eventPlan.name}
              placeholder="Click to add event name"
              displayFormat={(v) => v || <span style={{ color: "#999", fontStyle: "italic" }}>Click to add event name</span>}
              displayStyle={{ fontSize: "1.5rem", fontWeight: 700, color: "#1a1a1a" }}
            />

            <div>
              <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "6px" }}>
                Keywords
              </div>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                {eventPlan.keywords && eventPlan.keywords.length > 0 && eventPlan.keywords.map((keyword: string, index: number) => (
                  <span
                    key={index}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 14px",
                      backgroundColor: "#e5e7ff",
                      color: "#6B7FD7",
                      borderRadius: "20px",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                    }}
                  >
                    {keyword}
                    {!isReadOnly && (
                      <button
                        onClick={() => removeKeyword(index)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#6B7FD7",
                          cursor: "pointer",
                          padding: "0",
                          display: "flex",
                          alignItems: "center",
                          fontSize: "1.2rem",
                          lineHeight: "1",
                        }}
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}

                {!isReadOnly && (
                  editingField === 'keywords' ? (
                    <input
                      ref={inputRef}
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyPress={handleKeywordKeyPress}
                      onBlur={() => {
                        if (keywordInput.trim()) {
                          addKeyword();
                        }
                        setEditingField(null);
                      }}
                      placeholder="Type keyword..."
                      autoFocus
                      style={{
                        padding: "6px 12px",
                        fontSize: "0.9rem",
                        border: "2px solid #6B7FD7",
                        borderRadius: "20px",
                        color: "#6B7FD7",
                        backgroundColor: "white",
                        boxShadow: "0 0 0 3px rgba(107, 127, 215, 0.1)",
                        outline: "none",
                        minWidth: "150px",
                      }}
                    />
                  ) : (
                    <button
                      onClick={() => setEditingField('keywords')}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "32px",
                        height: "32px",
                        padding: "0",
                        backgroundColor: "#f8f9ff",
                        color: "#6B7FD7",
                        border: "2px dashed #6B7FD7",
                        borderRadius: "50%",
                        fontSize: "1.2rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "#6B7FD7";
                        e.currentTarget.style.color = "#fff";
                        e.currentTarget.style.borderStyle = "solid";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "#f8f9ff";
                        e.currentTarget.style.color = "#6B7FD7";
                        e.currentTarget.style.borderStyle = "dashed";
                      }}
                    >
                      +
                    </button>
                  )
                )}
              </div>
            </div>

            <ClickToEditField
              field="description"
              label="Description"
              value={eventPlan.description}
              placeholder="Click to add description"
              multiline
              displayFormat={(v) => v || <span style={{ color: "#999", fontStyle: "italic" }}>Click to add description</span>}
              displayStyle={{ fontSize: "1rem", color: "#4a5676", lineHeight: "1.6" }}
            />

            {!isReadOnly && (
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
            )}
          </div>
        </div>

        {/* Date & Time Section */}
        <div style={{ paddingBottom: "32px", borderBottom: "1px solid #e5e7ff" }}>
          <h3 style={{
            fontSize: "1.2rem",
            fontWeight: 700,
            color: "#333",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <CalendarTodayIcon style={{ width: "20px", height: "20px", color: "#6B7FD7" }} />
            Date & Time
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <ClickToEditField
              field="start_date"
              label="Start Date"
              value={eventPlan.start_date}
              type="date"
              placeholder="Select date"
              displayFormat={(v) => v
                ? new Date(v + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : <span style={{ color: "#999", fontStyle: "italic" }}>Click to set</span>
              }
              displayStyle={{ fontSize: "1.1rem", fontWeight: 600, color: "#1a1a1a" }}
            />

            <ClickToEditField
              field="start_time"
              label="Start Time"
              value={eventPlan.start_time}
              type="time"
              placeholder="Select time"
              displayFormat={(v) => v || <span style={{ color: "#999", fontStyle: "italic" }}>Click to set</span>}
              displayStyle={{ fontSize: "1.1rem", fontWeight: 600, color: "#1a1a1a" }}
            />

            <ClickToEditField
              field="end_date"
              label="End Date"
              value={eventPlan.end_date}
              type="date"
              placeholder="Select date"
              displayFormat={(v) => v
                ? new Date(v + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : <span style={{ color: "#999", fontStyle: "italic" }}>Click to set</span>
              }
              displayStyle={{ fontSize: "1.1rem", fontWeight: 600, color: "#1a1a1a" }}
            />

            <ClickToEditField
              field="end_time"
              label="End Time"
              value={eventPlan.end_time}
              type="time"
              placeholder="Select time"
              displayFormat={(v) => v || <span style={{ color: "#999", fontStyle: "italic" }}>Click to set</span>}
              displayStyle={{ fontSize: "1.1rem", fontWeight: 600, color: "#1a1a1a" }}
            />
          </div>
        </div>

        {/* Location & Logistics Section */}
        <div>
          <h3 style={{
            fontSize: "1.2rem",
            fontWeight: 700,
            color: "#333",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <LocationOnIcon style={{ width: "20px", height: "20px", color: "#6B7FD7" }} />
            Location & Logistics
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px" }}>
            <ClickToEditField
              field="location"
              label="Venue / Location"
              value={eventPlan.location}
              placeholder="Click to add"
              displayFormat={(v) => v || <span style={{ color: "#999", fontStyle: "italic" }}>Not set</span>}
              displayStyle={{ fontSize: "1.1rem", fontWeight: 600, color: "#1a1a1a" }}
            />

            <ClickToEditField
              field="attendees"
              label="Expected Attendance"
              value={eventPlan.attendees}
              type="number"
              placeholder="0"
              displayFormat={(v) => v ? `${v} people` : <span style={{ color: "#999", fontStyle: "italic" }}>Not set</span>}
              displayStyle={{ fontSize: "1.1rem", fontWeight: 600, color: "#1a1a1a" }}
            />

            <div>
              <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "6px" }}>
                Total Budget
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#1a1a1a", padding: "8px 12px" }}>
                ${eventPlan.budget?.toFixed(2) || "0.00"}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#888", fontStyle: "italic", marginTop: "2px", paddingLeft: "12px" }}>
                Auto-calculated
              </div>
            </div>

            <div>
              <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "6px" }}>
                Registration
              </div>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "#4a5676",
                padding: "8px 12px",
                backgroundColor: isReadOnly ? "transparent" : "transparent",
                borderRadius: "6px",
                border: "2px solid transparent",
                cursor: isReadOnly ? "default" : "pointer",
                transition: "all 0.2s ease",
              }}
                onMouseEnter={(e) => {
                  if (!isReadOnly) {
                    e.currentTarget.style.backgroundColor = "#f8f9fa";
                    e.currentTarget.style.borderColor = "#e5e7eb";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.borderColor = "transparent";
                }}
              >
                <input
                  type="checkbox"
                  checked={eventPlan.registration_required || false}
                  onChange={(e) => handleFieldChange("registration_required", e.target.checked)}
                  disabled={isReadOnly}
                  style={{
                    width: "20px",
                    height: "20px",
                    cursor: isReadOnly ? "not-allowed" : "pointer",
                    accentColor: "#6B7FD7"
                  }}
                />
                <span style={{ color: eventPlan.registration_required ? "#4caf50" : "#888" }}>
                  {eventPlan.registration_required ? "✓ Required" : "Not required"}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateY(100px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default OverviewTab;