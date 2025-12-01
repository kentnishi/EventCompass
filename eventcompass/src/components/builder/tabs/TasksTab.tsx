import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import NotesIcon from "@mui/icons-material/Notes";
import LinkIcon from "@mui/icons-material/Link";

import { Task, Activity } from "@/types/eventPlan";

import TaskModal from "./modals/TaskModal";

export type TaskStatus = "todo" | "in_progress" | "blocked" | "done";
export type TaskPriority = "low" | "medium" | "high";


interface TasksTabProps {
  event_id: string;
  tasks: Task[];
  activities: Activity[];
  isReadOnly: boolean;
  fetchTasks: () => void;
}

// Helper function to get status badge styling
const getStatusStyle = (status: TaskStatus) => {
  const styles = {
    todo: { background: "#f5f5f5", color: "#666" },
    in_progress: { background: "#e3f2fd", color: "#1976d2" },
    blocked: { background: "#ffebee", color: "#c62828" },
    done: { background: "#e8f5e9", color: "#2e7d32" },
  };
  return styles[status];
};

// Helper function to get status label
const getStatusLabel = (status: TaskStatus) => {
  const labels = {
    todo: "To Do",
    in_progress: "In Progress",
    blocked: "Blocked",
    done: "Done",
  };
  return labels[status];
};

// Helper function to get initials from name
const getInitials = (name: string): string => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const TasksTab: React.FC<TasksTabProps> = ({
  event_id,
  tasks,
  activities,
  isReadOnly,
  fetchTasks,
}) => {
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");

  // Filter tasks by status
  const filteredTasks = statusFilter === "all" 
    ? tasks 
    : tasks.filter((t) => t.status === statusFilter);

  // Count tasks by status
  const statusCounts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    blocked: tasks.filter((t) => t.status === "blocked").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  // Format date for display
  const formatDate = (timestamp: string | null): string => {
    if (!timestamp) return "—";
  
    const date = new Date(timestamp);
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  
    // If the timestamp includes a time, display both date and time
    return timestamp.includes("T") ? `${formattedDate} at ${formattedTime}` : formattedDate;
  };

  // Check if date is overdue
  const isOverdue = (dateStr: string | null, status: TaskStatus): boolean => {
    if (!dateStr || status === "done") return false;
    const due = new Date(dateStr + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  // AddTask handler
  const addTask = async () => {
    try {
      const newTask:Task = {
        event_id: event_id,
        title: "New Task", // Default title
        description: "",
        status: "todo", // Default status
        priority: "medium", // Default priority
        assignee_name: "",
        assignee_email: "",
        activity_id: null,
        due_date: null,
        notes: "",
      };
  
      const response = await fetch(`/api/event-plans/${event_id}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      });
  
      if (!response.ok) {
        throw new Error("Failed to add task");
      }
  
      console.log("Task added successfully");
      fetchTasks(); // Refresh the task list after adding
    } catch (error) {
      console.error("Error adding task:", error);
    }
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
            Tasks
          </h3>
          {!isReadOnly && (
            <button
              onClick={addTask}
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
              Add Task
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "24px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "0.9rem",
              color: "#666",
              fontWeight: 600,
            }}
          >
            Status:
          </span>
          <button
            onClick={() => setStatusFilter("all")}
            style={{
              padding: "6px 16px",
              background: statusFilter === "all" ? "#e3f2fd" : "#f5f5f5",
              border: statusFilter === "all" ? "2px solid #2196F3" : "2px solid #e0e0e0",
              borderRadius: "6px",
              fontSize: "0.85rem",
              cursor: "pointer",
              fontWeight: statusFilter === "all" ? 600 : 400,
              color: statusFilter === "all" ? "#1976d2" : "#666",
            }}
          >
            All ({statusCounts.all})
          </button>
          <button
            onClick={() => setStatusFilter("todo")}
            style={{
              padding: "6px 16px",
              background: statusFilter === "todo" ? "#e3f2fd" : "#f5f5f5",
              border: statusFilter === "todo" ? "2px solid #2196F3" : "2px solid #e0e0e0",
              borderRadius: "6px",
              fontSize: "0.85rem",
              cursor: "pointer",
              fontWeight: statusFilter === "todo" ? 600 : 400,
              color: statusFilter === "todo" ? "#1976d2" : "#666",
            }}
          >
            To Do ({statusCounts.todo})
          </button>
          <button
            onClick={() => setStatusFilter("in_progress")}
            style={{
              padding: "6px 16px",
              background: statusFilter === "in_progress" ? "#e3f2fd" : "#f5f5f5",
              border: statusFilter === "in_progress" ? "2px solid #2196F3" : "2px solid #e0e0e0",
              borderRadius: "6px",
              fontSize: "0.85rem",
              cursor: "pointer",
              fontWeight: statusFilter === "in_progress" ? 600 : 400,
              color: statusFilter === "in_progress" ? "#1976d2" : "#666",
            }}
          >
            In Progress ({statusCounts.in_progress})
          </button>
          <button
            onClick={() => setStatusFilter("done")}
            style={{
              padding: "6px 16px",
              background: statusFilter === "done" ? "#e3f2fd" : "#f5f5f5",
              border: statusFilter === "done" ? "2px solid #2196F3" : "2px solid #e0e0e0",
              borderRadius: "6px",
              fontSize: "0.85rem",
              cursor: "pointer",
              fontWeight: statusFilter === "done" ? 600 : 400,
              color: statusFilter === "done" ? "#1976d2" : "#666",
            }}
          >
            Done ({statusCounts.done})
          </button>
        </div>

        {filteredTasks.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px 20px",
              color: "#999",
            }}
          >
            <p style={{ fontSize: "1rem", marginBottom: "8px" }}>
              No tasks yet
            </p>
            <p style={{ fontSize: "0.9rem" }}>
              Click "Add Task" to start managing your event tasks
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f5f5f5" }}>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "#666",
                      width: "30%",
                    }}
                  >
                    Task
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "#666",
                      width: "15%",
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "#666",
                      width: "20%",
                    }}
                  >
                    Assignee
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "#666",
                      width: "20%",
                    }}
                  >
                    Activity
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "#666",
                      width: "15%",
                    }}
                  >
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task, i) => {
                  // Find the original index in the unfiltered array
                  const originalIndex = tasks.indexOf(task);
                  const activity = activities.find((a) => a.id === task.activity_id);
                  const statusStyle = getStatusStyle(task.status);
                  const overdue = isOverdue(task.due_date, task.status);

                  return (
                    <tr
                      key={originalIndex}
                      onClick={() => setSelectedTaskIndex(originalIndex)}
                      style={{
                        borderBottom: "1px solid #e0e0e0",
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#fafafa";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <td style={{ padding: "12px" }}>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#333",
                            fontSize: "0.9rem",
                          }}
                        >
                          {task.title || "Untitled Task"}
                        </div>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            borderRadius: "12px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            ...statusStyle,
                          }}
                        >
                          {getStatusLabel(task.status)}
                        </span>
                      </td>
                      <td style={{ padding: "12px" }}>
                        {task.assignee_name ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <div
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "50%",
                                background: "#6B7FD7",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                              }}
                            >
                              {getInitials(task.assignee_name)}
                            </div>
                            <span style={{ fontSize: "0.9rem" }}>
                              {task.assignee_name}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: "#999", fontSize: "0.9rem" }}>
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "12px" }}>
                        {activity ? (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "2px 8px",
                              background: "#f3e5f5",
                              color: "#9c27b0",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                            }}
                          >
                            {activity.name}
                          </span>
                        ) : (
                          <span style={{ color: "#999", fontSize: "0.9rem" }}>
                            —
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            fontSize: "0.9rem",
                            color: overdue ? "#f44336" : "#666",
                            fontWeight: overdue ? 600 : 400,
                          }}
                        >
                          {formatDate(task.due_date)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Task Modal */}
      {selectedTaskIndex !== null && (
        <TaskModal
            task={tasks[selectedTaskIndex]}
            index={selectedTaskIndex}
            activities={activities}
            isReadOnly={isReadOnly}
            onClose={() => setSelectedTaskIndex(null)}
            fetchTasks={fetchTasks}
        />
      )}
    </>
  );
};

export default TasksTab;