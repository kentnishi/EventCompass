import React, { useState, useEffect } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NotesIcon from "@mui/icons-material/Notes";

import { ScheduleItem, Activity, EventBasics } from "@/types/eventPlan";

import ScheduleEditModal from "./modals/ScheduleEditModal";



interface ScheduleTabProps {
    event_id: string;
    event_basics: EventBasics;
    schedule: ScheduleItem[];
    setSchedule: React.Dispatch<React.SetStateAction<ScheduleItem[]>>;
    activities: Activity[];
    isReadOnly: boolean;
    addScheduleItem: () => void;
    fetchSchedule: () => void; // Function to refetch the schedule after updates
}


// Helper function to calculate duration
const calculateDuration = (
    startDate: string,
    endDate: string | null | undefined,
    startTime: string,
    endTime: string
): string => {
    const effectiveEndDate = endDate || startDate;
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${effectiveEndDate}T${endTime}`);

    let diff = (end.getTime() - start.getTime()) / 1000 / 60; // minutes

    if (diff < 0) {
        diff = 0;
    }

    const totalHours = Math.floor(diff / 60);
    const minutes = diff % 60;
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;

    let durationText = "";
    if (days > 0) {
        durationText = `${days} day${days !== 1 ? "s" : ""}`;
        if (hours > 0) {
            durationText += ` ${hours} hr${hours !== 1 ? "s" : ""}`;
        }
        if (minutes > 0) {
            durationText += ` ${minutes} min`;
        }
    } else if (hours > 0) {
        durationText = `${hours} hr${hours !== 1 ? "s" : ""}`;
        if (minutes > 0) {
            durationText += ` ${minutes} min`;
        }
    } else {
        durationText = `${minutes} min`;
    }

    return durationText;
};

// Helper to format date for display
const formatDateHeader = (dateStr: string): string => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

// Helper to format time for display
const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
};


const ScheduleTab: React.FC<ScheduleTabProps> = ({
    event_id,
    event_basics,
    schedule,
    setSchedule,
    activities,
    isReadOnly,
    addScheduleItem,
    fetchSchedule,
}) => {
    const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(
        null
    );

    // API Calls

    // Function to add a new schedule item
    const handleAddScheduleItem = async () => {
        try {
            console.log("Event Basics passed into Schedule: ", event_basics);
            const newScheduleItem = {
                start_date: event_basics.start_date, // Example default values
                start_time: event_basics.start_time,
                end_time: event_basics.end_time,
                end_date: null,
                activity_id: null,
                location: "",
                notes: "",
            };

            const response = await fetch(`/api/event-plans/${event_id}/schedule`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newScheduleItem),
            });

            if (!response.ok) {
                throw new Error("Failed to add schedule item");
            }

            console.log("Schedule item added successfully");
            fetchSchedule(); // Refresh the schedule after adding
        } catch (error) {
            console.error("Error adding schedule item:", error);
        }
    };


    // Function to handle updates from the modal
    const handleUpdate = (index: number, field: keyof ScheduleItem, updatedValue: any) => {
        const updatedSchedule = [...schedule];
        updatedSchedule[index] = {
            ...updatedSchedule[index],
            [field]: updatedValue, // Dynamically update the specific field
        };
        setSchedule(updatedSchedule); // Update the state directly
    };

    // Function to handle deletions from the modal
    const handleDelete = (index: number) => {
        const updatedSchedule = schedule.filter((_, i) => i !== index);
        fetchSchedule(); // Optionally refetch the schedule
    };



    // Group schedule items by start_date
    const groupedByDate = schedule.reduce(
        (acc, item, index) => {
            const date = item.start_date || "Unscheduled";
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push({ ...item, originalIndex: index });
            return acc;
        },
        {} as Record<string, Array<ScheduleItem & { originalIndex: number }>>
    );

    // Sort dates
    const sortedDates = Object.keys(groupedByDate).sort();

    // Group items by time range (start_time + end_time) within each date
    const getTimeRangeGroups = (
        items: Array<ScheduleItem & { originalIndex: number }>
    ) => {
        const timeRangeGroups: Record<
            string,
            Array<ScheduleItem & { originalIndex: number }>
        > = {};
        items.forEach((item) => {
            const key = `${item.start_time || ""}|${item.end_time || ""}`;
            if (!timeRangeGroups[key]) {
                timeRangeGroups[key] = [];
            }
            timeRangeGroups[key].push(item);
        });

        // Sort by start time, then end time
        const sortedKeys = Object.keys(timeRangeGroups).sort((a, b) => {
            const [startA, endA] = a.split("|");
            const [startB, endB] = b.split("|");
            if (startA !== startB) {
                return startA.localeCompare(startB);
            }
            return endA.localeCompare(endB);
        });

        const sorted: Record<
            string,
            Array<ScheduleItem & { originalIndex: number }>
        > = {};
        sortedKeys.forEach((key) => {
            sorted[key] = timeRangeGroups[key];
        });

        return sorted;
    };

    const isMultiDay = (item: ScheduleItem): boolean => {
        return !!item.end_date && item.end_date !== item.start_date;
    };

    return (
        <>
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
                        Schedule
                    </h3>
                    {!isReadOnly && (
                        <button
                            onClick={handleAddScheduleItem}
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
                            Add Time Slot
                        </button>
                    )}
                </div>

                {schedule.length === 0 ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "48px 20px",
                            color: "#999",
                        }}
                    >
                        <p style={{ fontSize: "1rem", marginBottom: "8px" }}>
                            No schedule items yet
                        </p>
                        <p style={{ fontSize: "0.9rem" }}>
                            Click "Add Time Slot" to start building your schedule
                        </p>
                    </div>
                ) : (
                    <div style={{ marginTop: "24px" }}>
                        {sortedDates.map((date) => {
                            const dateItems = groupedByDate[date];
                            return (
                                <div key={date} style={{ marginBottom: "32px" }}>
                                    {/* Day Header */}
                                    <div
                                        style={{
                                            fontSize: "1.2rem",
                                            fontWeight: 700,
                                            color: "#6B7FD7",
                                            marginBottom: "16px",
                                            paddingBottom: "8px",
                                            borderBottom: "2px solid #6B7FD7",
                                        }}
                                    >
                                        {date === "Unscheduled" ? date : formatDateHeader(date)}
                                    </div>

                                    {/* Timeline for this day */}
                                    <div>
                                        {Object.entries(getTimeRangeGroups(dateItems)).map(
                                            ([timeRangeKey, timeRangeItems]) => {
                                                const [startTime, endTime] = timeRangeKey.split("|");
                                                const hasMultiple = timeRangeItems.length > 1;
                                                const firstItem = timeRangeItems[0];
                                                const duration = calculateDuration(
                                                    firstItem.start_date,
                                                    firstItem.end_date,
                                                    firstItem.start_time,
                                                    firstItem.end_time
                                                );

                                                return (
                                                    <div
                                                        key={timeRangeKey}
                                                        style={{ marginBottom: "24px" }}
                                                    >
                                                        <div
                                                            style={{
                                                                fontSize: "1rem",
                                                                fontWeight: 600,
                                                                color: "#6B7FD7",
                                                                marginBottom: "12px",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: "8px",
                                                            }}
                                                        >
                                                            <span>
                                                                {formatTime(startTime)} - {formatTime(endTime)}
                                                            </span>
                                                            <span
                                                                style={{
                                                                    fontSize: "0.75rem",
                                                                    padding: "3px 10px",
                                                                    background: "#e8f5e9",
                                                                    color: "#2e7d32",
                                                                    borderRadius: "4px",
                                                                    fontWeight: 600,
                                                                }}
                                                            >
                                                                {duration}
                                                            </span>
                                                            {hasMultiple && (
                                                                <span
                                                                    style={{
                                                                        fontSize: "0.7rem",
                                                                        padding: "2px 8px",
                                                                        background: "#e3f2fd",
                                                                        color: "#1976d2",
                                                                        borderRadius: "4px",
                                                                        fontWeight: 600,
                                                                    }}
                                                                >
                                                                    {timeRangeItems.length} Activities
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                flexDirection: "column",
                                                                gap: "8px",
                                                                paddingLeft: "24px",
                                                                borderLeft: "3px solid #6B7FD7",
                                                            }}
                                                        >
                                                            {timeRangeItems.map((item) => {
                                                                const activity = activities.find(
                                                                    (a) => a.id === item.activity_id
                                                                );
                                                                const itemIsMultiDay = isMultiDay(item);

                                                                return (
                                                                    <div
                                                                        key={item.originalIndex}
                                                                        onClick={() =>
                                                                            setSelectedItemIndex(item.originalIndex)
                                                                        }
                                                                        style={{
                                                                            background: "#fff",
                                                                            border: hasMultiple
                                                                                ? "2px solid #2196F3"
                                                                                : itemIsMultiDay
                                                                                    ? "2px solid #9c27b0"
                                                                                    : "2px solid #e0e0e0",
                                                                            borderLeft: itemIsMultiDay
                                                                                ? "4px solid #9c27b0"
                                                                                : hasMultiple
                                                                                    ? "4px solid #2196F3"
                                                                                    : undefined,
                                                                            borderRadius: "6px",
                                                                            padding: "12px 16px",
                                                                            display: "flex",
                                                                            justifyContent: "space-between",
                                                                            alignItems: "center",
                                                                            cursor: "pointer",
                                                                            transition: "all 0.2s",
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            e.currentTarget.style.borderColor =
                                                                                "#6B7FD7";
                                                                            e.currentTarget.style.transform =
                                                                                "translateX(4px)";
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            e.currentTarget.style.borderColor =
                                                                                hasMultiple
                                                                                    ? "#2196F3"
                                                                                    : itemIsMultiDay
                                                                                        ? "#9c27b0"
                                                                                        : "#e0e0e0";
                                                                            e.currentTarget.style.transform =
                                                                                "translateX(0)";
                                                                        }}
                                                                    >
                                                                        <div style={{ flex: 1 }}>
                                                                            <div
                                                                                style={{
                                                                                    fontWeight: 600,
                                                                                    color: "#333",
                                                                                    marginBottom: "4px",
                                                                                }}
                                                                            >
                                                                                {activity
                                                                                    ? activity.name
                                                                                    : "Untitled Activity"}
                                                                            </div>
                                                                            <div
                                                                                style={{
                                                                                    display: "flex",
                                                                                    gap: "12px",
                                                                                    fontSize: "0.85rem",
                                                                                    color: "#666",
                                                                                    flexWrap: "wrap",
                                                                                    alignItems: "center",
                                                                                }}
                                                                            >
                                                                                {item.location && (
                                                                                    <span>📍 {item.location}</span>
                                                                                )}
                                                                                {itemIsMultiDay && (
                                                                                    <span
                                                                                        style={{
                                                                                            background: "#f3e5f5",
                                                                                            padding: "2px 8px",
                                                                                            borderRadius: "3px",
                                                                                            fontSize: "0.75rem",
                                                                                            color: "#9c27b0",
                                                                                            fontWeight: 600,
                                                                                        }}
                                                                                    >
                                                                                        Multi-day
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            {item.notes && (
                                                                                <div
                                                                                    style={{
                                                                                        marginTop: "6px",
                                                                                        fontSize: "0.85rem",
                                                                                        color: "#999",
                                                                                        fontStyle: "italic",
                                                                                    }}
                                                                                >
                                                                                    {item.notes.length > 60
                                                                                        ? item.notes.substring(0, 60) +
                                                                                        "..."
                                                                                        : item.notes}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <EditIcon
                                                                            style={{
                                                                                width: "20px",
                                                                                height: "20px",
                                                                                color: "#999",
                                                                            }}
                                                                        />
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {selectedItemIndex !== null && (
                <ScheduleEditModal
                    item={schedule[selectedItemIndex]}
                    index={selectedItemIndex}
                    activities={activities}
                    isReadOnly={isReadOnly}
                    onClose={() => setSelectedItemIndex(null)}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                />
            )}
        </>
    );
};

export default ScheduleTab;