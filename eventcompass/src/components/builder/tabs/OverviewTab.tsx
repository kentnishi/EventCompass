"use client";

import React from "react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

const OverviewTab = ({ eventPlan, updatePlan, isReadOnly }: { eventPlan: any; updatePlan: (field: string, value: any) => void; isReadOnly: boolean }) => {

  return (
    <div
      style={{
        backgroundColor: "#FFF",
        borderRadius: "12px",
        padding: "32px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Event Name */}
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
            Event Name
          </label>
          <input
            type="text"
            value={eventPlan.name}
            onChange={(e) => updatePlan("name", e.target.value)}
            disabled={isReadOnly}
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: "1rem",
              border: "1px solid #ddd",
              borderRadius: "8px",
              color: "#4a5676",
              fontWeight: 500,
              backgroundColor: isReadOnly ? "#f5f5f5" : "#fff",
              cursor: isReadOnly ? "not-allowed" : "text",
            }}
          />
        </div>

        {/* Description */}
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
            value={eventPlan.description}
            onChange={(e) => updatePlan("description", e.target.value)}
            disabled={isReadOnly}
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: "1rem",
              border: "1px solid #ddd",
              borderRadius: "8px",
              color: "#4a5676",
              fontWeight: 500,
              resize: "vertical",
              minHeight: "120px",
              backgroundColor: isReadOnly ? "#f5f5f5" : "#fff",
              cursor: isReadOnly ? "not-allowed" : "text",
            }}
          />
        </div>

        {/* AI: Improve Description Button */}
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
            }}
          >
            <AutoAwesomeIcon style={{ width: "16px", height: "16px" }} />
            AI: Improve Description
          </button>
        )}
      </div>
    </div>
  );
};

export default OverviewTab;