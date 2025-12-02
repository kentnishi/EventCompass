"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";
import { CheckCircle as CheckCircleIcon, CloudQueue as CloudQueueIcon, CloudDone as CloudDoneIcon } from "@mui/icons-material";

// Components
import OverviewTab from "./builder/tabs/OverviewTab";
import ActivitiesTab from "./builder/tabs/ActivitiesTab";
import ScheduleTab from "./builder/tabs/ScheduleTab";
import ShoppingTab from "./builder/tabs/ShoppingTab";
import TasksTab from "./builder/tabs/TasksTab";
import BudgetTab from "./builder/tabs/BudgetTab";
import SummaryTab from "./builder/tabs/SummaryTab";
import EventCopilot from "./eventcopilot/EventCopilot";

// Types & Utils
import { EventPlan, Activity, ScheduleItem, Task, BudgetItem, ShoppingItem, EventBasics } from "@/types/eventPlan";


interface EventPlanningPageProps {
  id: string;
}

const statusOptions = [
  { value: "planning", label: "Planning", color: "#6B7FD7" },
  { value: "confirmed", label: "Confirmed", color: "#28a745" },
  { value: "completed", label: "Completed", color: "#6c757d" },
  { value: "cancelled", label: "Cancelled", color: "#dc3545" },
];

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "activities", label: "Activities" },
  { id: "schedule", label: "Schedule" },
  { id: "tasks", label: "Tasks" },
  { id: "budget", label: "Budget" },
  { id: "shopping", label: "Shopping" },
  { id: "summary", label: "Summary" },
];

const EventPlanningPage = ({ id }: EventPlanningPageProps) => {
  const router = useRouter();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Data State
  const [eventBasics, setEventBasics] = useState<EventBasics | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [budget, setBudget] = useState<BudgetItem[]>([]);
  const [shopping, setShopping] = useState<ShoppingItem[]>([]);
  const [status, setStatus] = useState("planning");

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch event basics
        const eventRes = await fetch(`/api/event-plans/${id}`);
        if (!eventRes.ok) throw new Error("Failed to fetch event details");
        const eventData = await eventRes.json();

        setEventBasics(eventData);
        setStatus(eventData.status || "planning");

        // Fetch sub-collections in parallel
        const [activitiesRes, scheduleRes, tasksRes, budgetRes, shoppingRes] = await Promise.all([
          fetch(`/api/event-plans/${id}/activities`),
          fetch(`/api/event-plans/${id}/schedule`),
          fetch(`/api/event-plans/${id}/tasks`),
          fetch(`/api/event-plans/${id}/budget`),
          fetch(`/api/event-plans/${id}/shopping`)
        ]);

        if (activitiesRes.ok) setActivities(await activitiesRes.json());
        if (scheduleRes.ok) setSchedule(await scheduleRes.json());
        if (tasksRes.ok) setTasks(await tasksRes.json());
        if (budgetRes.ok) setBudget(await budgetRes.json());
        if (shoppingRes.ok) setShopping(await shoppingRes.json());

      } catch (err) {
        console.error("Error loading event data:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Helper to update local state and trigger save (simplified for now)
  // In a real app, you might want to debounce this or handle it per-tab
  const updateEventBasics = (field: string, value: any) => {
    if (!eventBasics) return;
    setEventBasics(prev => prev ? { ...prev, [field]: value } : null);
    // TODO: Implement auto-save or explicit save for basics
  };

  // --- Actions ---

  const addActivity = async () => {
    try {
      const newActivity: Partial<Activity> = {
        name: "New Activity",
        event_id: id,
        description: "",
        notes: "",
        staffing_needs: [],
      };

      const response = await fetch(`/api/event-plans/${id}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newActivity),
      });

      if (!response.ok) throw new Error("Failed to add activity");

      const createdActivity = await response.json();
      setActivities((prev) => [...prev, createdActivity]);
    } catch (error) {
      console.error("Error adding activity:", error);
      alert("Failed to add activity. Please try again.");
    }
  };

  const updateActivity = (index: number, field: string, value: any) => {
    const newActivities = [...activities];
    // @ts-ignore
    newActivities[index][field] = value;
    setActivities(newActivities);
    // Note: This only updates local state. You'd need a way to save these changes to DB.
  };

  const deleteActivity = async (index: number) => {
    try {
      const activity = activities[index];
      if (!activity.id) return;

      if (!confirm(`Are you sure you want to delete "${activity.name}"?`)) {
        return;
      }

      const response = await fetch(`/api/event-plans/activities/${activity.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete activity");

      setActivities((prev) => prev.filter((_, i) => i !== index));
      await fetchSchedule(); // Refresh schedule as it might depend on activities
    } catch (error) {
      console.error("Error deleting activity:", error);
      alert("Failed to delete activity. Please try again.");
    }
  };

  const fetchSchedule = async () => {
    try {
      const response = await fetch(`/api/event-plans/${id}/schedule`);
      if (!response.ok) throw new Error("Failed to fetch schedule");
      const data = await response.json();
      setSchedule(data || []);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  };

  const addScheduleItem = () => {
    // Implementation depends on how ScheduleTab handles additions. 
    // Often it might just be a local addition until saved, or a direct API call.
    // For consistency with addActivity, let's assume direct API or passed down handler.
    // Since ScheduleTab takes addScheduleItem, we can define it here if needed, 
    // or let ScheduleTab handle the API call. 
    // Looking at the original code, it seemed to just update local state.
    // Let's keep it simple for now.
    const newItem: Partial<ScheduleItem> = {
      event_id: id,
      start_time: "",
      end_time: "",
      activity_id: null,
      notes: ""
    };
    setSchedule(prev => [...prev, newItem as ScheduleItem]);
  };

  const fetchShoppingItems = async () => {
    try {
      const response = await fetch(`/api/event-plans/${id}/shopping`);
      if (!response.ok) throw new Error("Failed to fetch shopping items");
      const data = await response.json();
      setShopping(data || []);
    } catch (error) {
      console.error("Error fetching shopping items:", error);
    }
  };

  const onBudgetChange = () => {
    // Re-fetch budget items if needed
    fetch(`/api/event-plans/${id}/budget`)
      .then(res => res.json())
      .then(data => setBudget(data))
      .catch(err => console.error("Error refreshing budget:", err));
  };

  const onStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/event-plans/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      setStatus(newStatus);
      console.log(`Status updated to "${newStatus}"`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/event-plans/${id}/tasks`);
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();
      setTasks(data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Copilot update plan handler
  const updatePlan = (field: string, value: any) => {
    // This is a generic handler for the copilot. 
    // We need to map 'field' to the correct state setter.
    switch (field) {
      case 'activities': setActivities(value); break;
      case 'schedule': setSchedule(value); break;
      case 'tasks': setTasks(value); break;
      case 'budget': setBudget(value); break;
      case 'shopping': setShopping(value); break;
      case 'event_basics': setEventBasics(prev => ({ ...prev, ...value })); break;
      default: console.warn(`Unknown field update from Copilot: ${field}`);
    }
  };

  // Derived state
  const isReadOnly = status !== "planning";
  const currentStatus = statusOptions.find(s => s.value === status) || statusOptions[0];

  // --- Render ---

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#d5dcf1',
          gap: 3
        }}
      >
        <CircularProgress size={60} sx={{ color: '#6B7FD7' }} />
        <Typography variant="h6" sx={{ color: '#333', fontWeight: 600 }}>
          Loading event data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#d5dcf1',
          gap: 2
        }}
      >
        <Typography variant="h6" sx={{ color: '#d32f2f', fontWeight: 600 }}>
          Failed to load event
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          {error}
        </Typography>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 24px',
            backgroundColor: '#6B7FD7',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: '16px'
          }}
        >
          Retry
        </button>
      </Box>
    );
  }

  if (!eventBasics) return null;

  // Construct the full event plan object for child components that need it
  const eventPlan: EventPlan = {
    id: id,
    event_basics: eventBasics,
    activities,
    schedule_items: schedule,
    tasks,
    budget_items: budget,
    shopping_items: shopping
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#d5dcf1' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#FFF', borderBottom: '1px solid #e0e0e0', padding: '20px 30px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#333', margin: 0 }}>
            {eventBasics.name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#666' }}>Status:</label>
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              style={{
                padding: '8px 32px 8px 12px',
                fontSize: '0.9rem',
                fontWeight: 600,
                border: `2px solid ${currentStatus.color}`,
                borderRadius: '8px',
                backgroundColor: '#fff',
                color: currentStatus.color,
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ backgroundColor: '#FFF', borderBottom: '1px solid #e0e0e0' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 30px' }}>
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '16px 24px',
                  backgroundColor: 'transparent',
                  color: activeTab === tab.id ? '#6B7FD7' : '#666',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '3px solid #6B7FD7' : '3px solid transparent',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Read-only warning */}
      {isReadOnly && (
        <div style={{ maxWidth: '1400px', margin: '20px auto 0', padding: '0 30px' }}>
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#856404'
          }}>
            <CheckCircleIcon style={{ width: '20px', height: '20px' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
              This event is marked as <strong>{currentStatus.label}</strong> and is in read-only mode. Change status to Planning to edit.
            </span>
          </div>
        </div>
      )}

      {/* Save status indicator */}
      {saveStatus !== 'idle' && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background:
              saveStatus === 'saved' ? "#28a745" :
                saveStatus === 'error' ? "#dc3545" :
                  "#ffc107",
            color: saveStatus === 'saved' || saveStatus === 'error' ? "white" : "#333",
            padding: "12px 20px",
            borderRadius: "24px",
            fontSize: "0.9rem",
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            zIndex: 1000,
          }}
        >
          {saveStatus === 'saving' && (
            <>
              <CloudQueueIcon style={{ width: "18px", height: "18px" }} />
              Saving...
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <CloudDoneIcon style={{ width: "18px", height: "18px" }} />
              All changes saved
            </>
          )}
          {saveStatus === 'error' && (
            <>
              ⚠️ Failed to save
            </>
          )}
        </div>
      )}

      {/* Tab content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px' }}>
        {activeTab === 'overview' && (
          <OverviewTab
            eventPlan={eventBasics}
            updatePlan={updateEventBasics}
            isReadOnly={isReadOnly}
          />
        )}

        {activeTab === "activities" && (
          <ActivitiesTab
            activities={activities}
            schedule={schedule}
            tasks={tasks}
            shoppingItems={shopping}
            setActivities={setActivities}
            isReadOnly={isReadOnly}
            updateActivity={updateActivity}
            addActivity={addActivity}
            deleteActivity={deleteActivity}
          />
        )}

        {activeTab === "schedule" && (
          <ScheduleTab
            event_id={id}
            event_basics={eventBasics}
            schedule={schedule}
            setSchedule={setSchedule}
            activities={activities}
            isReadOnly={isReadOnly}
            addScheduleItem={addScheduleItem}
            fetchSchedule={fetchSchedule}
          />
        )}

        {activeTab === "shopping" && (
          <ShoppingTab
            event_id={id}
            budgetItems={budget}
            shoppingItems={shopping}
            activities={activities}
            isReadOnly={isReadOnly}
            onBudgetChange={onBudgetChange}
            fetchShoppingItems={fetchShoppingItems}
          />
        )}

        {activeTab === "tasks" && (
          <TasksTab
            event_id={id}
            tasks={tasks}
            activities={activities}
            isReadOnly={isReadOnly}
            fetchTasks={fetchTasks}
          />
        )}

        {activeTab === "budget" && (
          <BudgetTab
            event_id={id}
            onBudgetChange={onBudgetChange}
            budgetItems={budget}
            isReadOnly={isReadOnly}
            totalBudget={eventBasics.budget}
          />
        )}

        {activeTab === "summary" && (
          <SummaryTab
            eventPlan={eventPlan}
          />
        )}
      </div>

      <EventCopilot eventPlan={eventPlan} updatePlan={updatePlan} eventId={id} />
    </div>
  );
};

export default EventPlanningPage;