import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import LinkIcon from "@mui/icons-material/Link";
import NotesIcon from "@mui/icons-material/Notes";

import { Task, Activity } from "@/types/eventPlan";

interface TaskModalProps {
  task: Task;
  index: number;
  activities: Activity[];
  isReadOnly: boolean;
  onClose: () => void;
  fetchTasks: () => void; // Function to refresh tasks after updates or deletions
}

const TaskModal: React.FC<TaskModalProps> = ({
  task,
  index,
  activities,
  isReadOnly,
  onClose,
  fetchTasks,
}) => {
  const [localTask, setLocalTask] = useState<Task>(task);
  const [isSaving, setIsSaving] = useState(false);
  const selectedActivity = activities.find((a) => a.id === task.activity_id);

  // Update task field locally
  const handleFieldChange = (field: keyof Task, value: any) => {
    setLocalTask((prev) => ({ ...prev, [field]: value }));
  };

  // Save changes to the backend
  const handleSave = async () => {
    try {
      setIsSaving(true);

      const response = await fetch(`/api/event-plans/tasks/${localTask.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(localTask),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      console.log("Task updated successfully");
      fetchTasks(); // Refresh tasks after saving
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error updating task:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete the task
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await fetch(`/api/event-plans/tasks/${localTask.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      console.log("Task deleted successfully");
      fetchTasks(); // Refresh tasks after deletion
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error deleting task:", error);
    }
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
          maxWidth: "700px",
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
            alignItems: "start",
            marginBottom: "24px",
          }}
        >
          <h3
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#333",
              margin: 0,
              flex: 1,
              marginRight: "16px",
            }}
          >
            {isReadOnly ? "Task Details" : "Edit Task"}
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
          {/* Title */}
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
              Task Title
            </label>
            <input
              type="text"
              value={localTask.title}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              placeholder="Enter task title..."
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

          {/* Status and Priority */}
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
                Status
              </label>
              <select
                value={localTask.status}
                onChange={(e) => handleFieldChange("status", e.target.value)}
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
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="blocked">Blocked</option>
                <option value="done">Done</option>
              </select>
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
                Priority
              </label>
              <select
                value={localTask.priority}
                onChange={(e) => handleFieldChange("priority", e.target.value)}
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
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Assignee Name and Email */}
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
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "#333",
                  marginBottom: "8px",
                }}
              >
                <PersonIcon style={{ width: "18px", height: "18px" }} />
                Assignee Name
              </label>
              <input
                type="text"
                value={localTask.assignee_name}
                onChange={(e) => handleFieldChange("assignee_name", e.target.value)}
                placeholder="Enter name..."
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
                Assignee Email
              </label>
              <input
                type="email"
                value={localTask.assignee_email}
                onChange={(e) => handleFieldChange("assignee_email", e.target.value)}
                placeholder="email@example.com"
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

          {/* Activity */}
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
              <LinkIcon style={{ width: "18px", height: "18px" }} />
              Activity
            </label>
            <select
              value={localTask.activity_id || ""}
              onChange={(e) =>
                handleFieldChange("activity_id", parseInt(e.target.value) || null)
              }
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
              <option value="">No activity linked</option>
              {activities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
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
                Due Date
            </label>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {/* Date Input */}
                <input
                type="date"
                value={localTask.due_date ? localTask.due_date.split("T")[0] : ""}
                onChange={(e) => {
                    const date = e.target.value;
                    const time = task.due_date ? task.due_date.split("T")[1] : "00:00:00";
                    const timestamp = date ? `${date}T${time}` : null;
                    handleFieldChange("due_date", timestamp);
                }}
                disabled={isReadOnly}
                style={{
                    flex: 1,
                    padding: "10px",
                    fontSize: "0.9rem",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    backgroundColor: isReadOnly ? "#f5f5f5" : "#fff",
                    cursor: isReadOnly ? "not-allowed" : "text",
                }}
                />

                {/* Time Input */}
                <input
                type="time"
                value={localTask.due_date ? localTask.due_date.split("T")[1]?.slice(0, 5) : ""}
                onChange={(e) => {
                    const time = e.target.value;
                    const date = localTask.due_date ? localTask.due_date.split("T")[0] : "";
                    const timestamp = date ? `${date}T${time}` : null;
                    handleFieldChange("due_date", timestamp);
                }}
                disabled={isReadOnly}
                style={{
                    flex: 1,
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

          {/* Description */}
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
              Description
            </label>
            <textarea
              value={localTask.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              placeholder="Add detailed description..."
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
              Notes / Updates
            </label>
            <textarea
              value={localTask.notes}
              onChange={(e) => handleFieldChange("notes", e.target.value)}
              placeholder="Add progress updates, blockers, or additional notes..."
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
              onClick={handleDelete}
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
          {!isReadOnly && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{
                padding: "10px 20px",
                backgroundColor: isSaving ? "#ccc" : "#6B7FD7",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: isSaving ? "not-allowed" : "pointer",
              }}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskModal;