import React, { useState } from "react";
import { Activity, StaffingNeed, ScheduleItem, ShoppingItem, Task } from "@/types/eventPlan";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DescriptionIcon from "@mui/icons-material/Description";
import PeopleIcon from "@mui/icons-material/People";
import AddIcon from "@mui/icons-material/Add";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

interface ActivityModalProps {
  activity: Activity;
  onClose: () => void;
  onActivityUpdated: (updatedActivity: Activity) => void;
  onActivityDeleted: () => void;
  isReadOnly: boolean;
  scheduleItems: ScheduleItem[];
  tasks: Task[];
  shoppingItems?: ShoppingItem[];
}

const ActivityModal: React.FC<ActivityModalProps> = ({
    activity,
    onClose,
    onActivityUpdated,
    onActivityDeleted,
    isReadOnly,
    scheduleItems,
    tasks,
    shoppingItems = [],
}) => {
    const [name, setName] = useState(activity.name || "");
    const [description, setDescription] = useState(activity.description || "");
    const [notes, setNotes] = useState(activity.notes || "");
    const [staffingNeeds, setStaffingNeeds] = useState<StaffingNeed[]>(
        activity.staffing_needs || []
    );

    const handleSave = async () => {
        try {
            const response = await fetch(`/api/event-plans/activities/${activity.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                description,
                notes,
                staffing_needs: staffingNeeds,
            }),
            });

            if (!response.ok) {
            throw new Error("Failed to update activity");
            }

            const updatedActivity = await response.json();
            onActivityUpdated(updatedActivity);
            onClose();
        } catch (error) {
            console.error("Error updating activity:", error);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/event-plans/activities/${activity.id}`, {
            method: "DELETE",
            });

            if (!response.ok) {
            throw new Error("Failed to delete activity");
            }

            onActivityDeleted();
            onClose();
        } catch (error) {
            console.error("Error deleting activity:", error);
        }
    };
    
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
    const totalShoppingCost = shoppingItems.reduce((sum, item) => sum + (item.unit_cost * item.quantity), 0);
  
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
  
              {/* Staffing Needs */}
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
                        backgroundColor: "#F9FAFB",
                        borderRadius: "8px",
                        border: "1px dashed #E5E7EB",
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

              {/* Shopping List */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <ShoppingCartIcon style={{ width: "18px", height: "18px", color: "#8B5CF6" }} />
                    <label
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "#374151",
                      }}
                    >
                      Shopping List
                    </label>
                    {shoppingItems.length > 0 && (
                      <span style={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        color: "#6B7280",
                        backgroundColor: "#F3F4F6",
                        padding: "2px 8px",
                        borderRadius: "10px",
                      }}>
                        {shoppingItems.length}
                      </span>
                    )}
                  </div>
                  {shoppingItems.length > 0 && (
                    <div style={{ fontSize: "0.875rem", color: "#6B7280" }}>
                      Total: <span style={{ fontWeight: 600, color: "#059669" }}>${totalShoppingCost.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {shoppingItems.length > 0 ? (
                  <div style={{ 
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "12px",
                  }}>
                    {shoppingItems.map((item: ShoppingItem) => {
                      const getStatusConfig = (status: ShoppingItem['status']) => {
                        switch (status) {
                          case 'received': return { bg: '#ECFDF5', text: '#059669', label: 'Received', icon: '✓' };
                          case 'ordered': return { bg: '#EFF6FF', text: '#2563EB', label: 'Ordered', icon: '📦' };
                          case 'cancelled': return { bg: '#FEF2F2', text: '#DC2626', label: 'Cancelled', icon: '✕' };
                          default: return { bg: '#FFF3E0', text: '#D97706', label: 'Pending', icon: '○' };
                        }
                      };

                      const statusConfig = getStatusConfig(item.status);
                      const totalCost = item.unit_cost * item.quantity;

                      return (
                        <div
                          key={item.id}
                          style={{
                            padding: "12px",
                            backgroundColor: "#fff",
                            borderRadius: "8px",
                            border: "1px solid #E5E7EB",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#C4B5FD";
                            e.currentTarget.style.boxShadow = "0 2px 4px 0 rgba(0, 0, 0, 0.06)";
                            e.currentTarget.style.backgroundColor = "#FAFAF9";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#E5E7EB";
                            e.currentTarget.style.boxShadow = "none";
                            e.currentTarget.style.backgroundColor = "#fff";
                          }}
                        >
                          {/* Item Name and Link */}
                          <div style={{ display: "flex", alignItems: "start", gap: "6px", marginBottom: "6px" }}>
                            <div style={{ 
                              flex: 1, 
                              fontWeight: 600, 
                              color: "#1F2937", 
                              fontSize: "0.85rem",
                              lineHeight: "1.3",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}>
                              {item.item}
                            </div>
                            {item.link && (
                              <a 
                                href={item.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{
                                  color: "#8B5CF6",
                                  display: "flex",
                                  alignItems: "center",
                                  flexShrink: 0,
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                  <polyline points="15 3 21 3 21 9"/>
                                  <line x1="10" y1="14" x2="21" y2="3"/>
                                </svg>
                              </a>
                            )}
                          </div>

                          {/* Vendor */}
                          <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "4px",
                            fontSize: "0.7rem", 
                            color: "#6B7280",
                            marginBottom: "8px"
                          }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                              <polyline points="9 22 9 12 15 12 15 22"/>
                            </svg>
                            {item.vendor}
                          </div>

                          {/* Status Badge */}
                          <div style={{ 
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "0.7rem", 
                            fontWeight: 600,
                            color: statusConfig.text,
                            backgroundColor: statusConfig.bg,
                            padding: "3px 8px",
                            borderRadius: "10px",
                            marginBottom: "8px"
                          }}>
                            {statusConfig.icon} {statusConfig.label}
                          </div>

                          {/* Quantity and Cost */}
                          <div style={{ 
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingTop: "8px",
                            borderTop: "1px solid #F3F4F6"
                          }}>
                            <div style={{ 
                              fontSize: "0.75rem", 
                              color: "#6B7280"
                            }}>
                              Qty: <span style={{ fontWeight: 600, color: "#1F2937" }}>{item.quantity}</span> × ${item.unit_cost.toFixed(2)}
                            </div>
                            <div style={{ 
                              fontSize: "0.85rem", 
                              fontWeight: 700,
                              color: item.status === 'ordered' || item.status === 'received' ? "#059669" : "#1F2937"
                            }}>
                              ${totalCost.toFixed(2)}
                            </div>
                          </div>

                          {/* Notes */}
                          {item.notes && (
                            <div style={{ 
                              fontSize: "0.7rem", 
                              color: "#6B7280",
                              fontStyle: "italic",
                              marginTop: "8px",
                              paddingTop: "8px",
                              borderTop: "1px solid #F3F4F6",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}>
                              {item.notes}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ 
                    padding: "24px", 
                    textAlign: "center", 
                    color: "#6B7280",
                    fontSize: "0.875rem",
                    backgroundColor: "#F9FAFB",
                    borderRadius: "8px",
                    border: "1px dashed #E5E7EB"
                  }}>
                    No shopping items linked to this activity yet.
                  </div>
                )}
              </div>
            </div>
  
            {/* Sidebar - Schedule & Tasks */}
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
                    {scheduleItems.map((item: ScheduleItem) => {
                      const isMultiDay = item.end_date && item.end_date !== item.start_date;
                      const formatDate = (dateStr: string) => {
                        const date = new Date(dateStr);
                        return date.toLocaleDateString("en-US", { 
                          month: "short", 
                          day: "numeric", 
                          year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined 
                        });
                      };
                      
                      return (
                        <div
                          key={item.id}
                          style={{
                            padding: "12px 16px",
                            backgroundColor: "#fff",
                            borderRadius: "8px",
                            border: "1px solid #E5E7EB",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#C4B5FD";
                            e.currentTarget.style.boxShadow = "0 2px 4px 0 rgba(0, 0, 0, 0.06)";
                            e.currentTarget.style.backgroundColor = "#FAFAF9";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#E5E7EB";
                            e.currentTarget.style.boxShadow = "none";
                            e.currentTarget.style.backgroundColor = "#fff";
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "8px" }}>
                            <div style={{ fontWeight: 600, color: "#1F2937", fontSize: "0.9rem" }}>
                              {formatDate(item.start_date)}
                              {isMultiDay && (
                                <span style={{ fontWeight: 400, color: "#6B7280" }}>
                                  {" → "}{formatDate(item.end_date)}
                                </span>
                              )}
                            </div>
                            {isMultiDay && (
                              <span style={{
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                color: "#8B5CF6",
                                backgroundColor: "#F3E8FF",
                                padding: "2px 8px",
                                borderRadius: "10px",
                              }}>
                                MULTI-DAY
                              </span>
                            )}
                          </div>

                          <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "6px",
                            fontSize: "0.8rem", 
                            color: "#6B7280",
                            marginBottom: item.location || item.notes ? "8px" : "0"
                          }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                              <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            {item.start_time} - {item.end_time}
                          </div>

                          {item.location && (
                            <div style={{ 
                              display: "flex", 
                              alignItems: "center", 
                              gap: "6px",
                              fontSize: "0.8rem", 
                              color: "#059669",
                              backgroundColor: "#ECFDF5",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              marginBottom: item.notes ? "8px" : "0"
                            }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                <circle cx="12" cy="10" r="3"/>
                              </svg>
                              {item.location}
                            </div>
                          )}

                          {item.notes && (
                            <div style={{ 
                              fontSize: "0.75rem", 
                              color: "#6B7280",
                              fontStyle: "italic",
                              paddingLeft: "20px",
                              borderLeft: "2px solid #E5E7EB",
                              marginTop: "8px"
                            }}>
                              {item.notes}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ 
                    padding: "24px", 
                    textAlign: "center", 
                    color: "#9CA3AF",
                    fontSize: "0.8rem",
                    backgroundColor: "#F9FAFB",
                    borderRadius: "8px",
                    border: "1px dashed #E5E7EB"
                  }}>
                    No schedule items yet. Add this activity to the schedule to see timing details.
                  </div>
                )}
              </div>
              
              {/* Related Tasks */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <CheckBoxIcon style={{ width: "18px", height: "18px", color: "#8B5CF6" }} />
                  <h3
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#1F2937",
                      margin: 0,
                    }}
                  >
                    Task List
                  </h3>
                  {tasks.length > 0 && (
                    <span style={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color: "#6B7280",
                      backgroundColor: "#F3F4F6",
                      padding: "2px 8px",
                      borderRadius: "10px",
                    }}>
                      {tasks.length}
                    </span>
                  )}
                </div>

                {tasks.length > 0 ? (
                  <div style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    gap: "8px",
                    maxHeight: "400px",
                    overflowY: "auto",
                    paddingRight: "4px"
                  }}>
                    {tasks.map((task: Task) => {
                      const getStatusColor = (status: Task['status']) => {
                        switch (status) {
                          case 'done': return { bg: '#ECFDF5', text: '#059669', label: 'Done' };
                          case 'in_progress': return { bg: '#EFF6FF', text: '#2563EB', label: 'In Progress' };
                          case 'blocked': return { bg: '#FEF2F2', text: '#DC2626', label: 'Blocked' };
                          default: return { bg: '#F9FAFB', text: '#6B7280', label: 'To Do' };
                        }
                      };

                      const getPriorityColor = (priority: Task['priority']) => {
                        switch (priority) {
                          case 'high': return { bg: '#FEF2F2', text: '#DC2626' };
                          case 'medium': return { bg: '#FEF3C7', text: '#D97706' };
                          default: return { bg: '#F3F4F6', text: '#6B7280' };
                        }
                      };

                      const statusConfig = getStatusColor(task.status);
                      const priorityConfig = getPriorityColor(task.priority);
                      const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

                      return (
                        <div
                          key={task.id}
                          style={{
                            padding: "12px",
                            backgroundColor: "#fff",
                            borderRadius: "8px",
                            border: "1px solid #E5E7EB",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#C4B5FD";
                            e.currentTarget.style.boxShadow = "0 2px 4px 0 rgba(0, 0, 0, 0.06)";
                            e.currentTarget.style.backgroundColor = "#FAFAF9";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#E5E7EB";
                            e.currentTarget.style.boxShadow = "none";
                            e.currentTarget.style.backgroundColor = "#fff";
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "start", gap: "6px", marginBottom: "8px" }}>
                            <div style={{ flex: 1, fontWeight: 600, color: "#1F2937", fontSize: "0.85rem", lineHeight: "1.3" }}>
                              {task.title}
                            </div>
                            <span style={{
                              fontSize: "0.65rem",
                              fontWeight: 600,
                              color: priorityConfig.text,
                              backgroundColor: priorityConfig.bg,
                              padding: "2px 6px",
                              borderRadius: "8px",
                              textTransform: "uppercase",
                              flexShrink: 0,
                            }}>
                              {task.priority}
                            </span>
                          </div>

                          {task.description && (
                            <div style={{ 
                              fontSize: "0.75rem", 
                              color: "#6B7280", 
                              marginBottom: "8px",
                              lineHeight: "1.4",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}>
                              {task.description}
                            </div>
                          )}

                          <div style={{ 
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "0.7rem", 
                            fontWeight: 600,
                            color: statusConfig.text,
                            backgroundColor: statusConfig.bg,
                            padding: "3px 8px",
                            borderRadius: "10px",
                            marginBottom: "8px"
                          }}>
                            {task.status === 'done' && '✓ '}
                            {task.status === 'blocked' && '⚠ '}
                            {statusConfig.label}
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            {task.assignee_name && (
                              <div style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                gap: "4px",
                                fontSize: "0.7rem", 
                                color: "#6B7280"
                              }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                  <circle cx="12" cy="7" r="4"/>
                                </svg>
                                {task.assignee_name}
                              </div>
                            )}
                            {task.due_date && (
                              <div style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                gap: "4px",
                                fontSize: "0.7rem", 
                                color: isOverdue ? "#DC2626" : "#6B7280",
                                fontWeight: isOverdue ? 600 : 400,
                              }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                  <line x1="16" y1="2" x2="16" y2="6"/>
                                  <line x1="8" y1="2" x2="8" y2="6"/>
                                  <line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                                Due {new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                {isOverdue && " (overdue)"}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ 
                    padding: "24px", 
                    textAlign: "center", 
                    color: "#9CA3AF",
                    fontSize: "0.8rem",
                    backgroundColor: "#F9FAFB",
                    borderRadius: "8px",
                    border: "1px dashed #E5E7EB"
                  }}>
                    No tasks linked to this activity yet.
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
              {!isReadOnly && (
                <button
                  onClick={handleDelete}
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
              onClick={handleSave}
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

export default ActivityModal;