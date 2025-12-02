"use client";
import React, { useState, useEffect, useRef } from "react";
import { CircularProgress, Box, Typography } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';

import OverviewTab from '@/components/builder/tabs/OverviewTab';
import ActivitiesTab from "@/components/builder/tabs/ActivitiesTab";
import ScheduleTab from "@/components/builder/tabs/ScheduleTab";
import TasksTab from "@/components/builder/tabs/TasksTab";
import BudgetTab from "@/components/builder/tabs/BudgetTab";
import ShoppingTab from "@/components/builder/tabs/ShoppingTab";
import SummaryTab from "@/components/builder/tabs/SummaryTab";

import { EventPlan, EventBasics, Activity, ScheduleItem, Task, BudgetItem, ShoppingItem } from "@/types/eventPlan";

const EventPlanningPage = ({ id }: { id: string }) => {
  console.log("Event ID in EventPlanningPage:", id);

  // State
  const [eventBasics, setEventBasics] = useState<EventBasics | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [budget, setBudget] = useState<BudgetItem[]>([]);
  const [shopping, setShopping] = useState<ShoppingItem[]>([]);

  const [activeTab, setActiveTab] = useState("overview");
  const [status, setStatus] = useState("planning");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Single data fetch on mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [
          eventResponse,
          activitiesResponse,
          scheduleResponse,
          tasksResponse,
          budgetResponse,
          shoppingResponse
        ] = await Promise.all([
          fetch(`/api/event-plans/${id}`),
          fetch(`/api/event-plans/${id}/activities`),
          fetch(`/api/event-plans/${id}/schedule`),
          fetch(`/api/event-plans/${id}/tasks`),
          fetch(`/api/event-plans/${id}/budget`),
          fetch(`/api/event-plans/${id}/shopping`),
        ]);

        // Check for errors
        if (!eventResponse.ok) throw new Error("Failed to fetch event details");

        // Parse all responses
        const [
          eventData,
          activitiesData,
          scheduleData,
          tasksData,
          budgetData,
          shoppingData
        ] = await Promise.all([
          eventResponse.json(),
          activitiesResponse.json(),
          scheduleResponse.json(),
          tasksResponse.json(),
          budgetResponse.json(),
          shoppingResponse.json(),
        ]);

        // Set event basics
        const event = eventData.event;
        setEventBasics({
          name: event.name || "Untitled Event",
          description: event.description || "",
          attendees: event.attendees || 0,
          start_date: event.start_date || "",
          start_time: event.start_time || "",
          end_date: event.end_date || "",
          end_time: event.end_time || "",
          budget: event.budget || 0,
          location: event.location || "Unknown",
          registration_required: event.registration_required ?? false,
          event_type: event.event_type || "General",
          keywords: event.keywords || []
        });

        // Set status
        setStatus(event.status || "planning");

        // Set all other data
        setActivities(activitiesData || []);
        setSchedule(scheduleData || []);
        setTasks(tasksData || []);
        setBudget(budgetData || []);
        setShopping(shoppingData || []);

        console.log("✅ All data loaded successfully");
      } catch (err) {
        console.error("Error fetching event data:", err);
        setError(err instanceof Error ? err.message : "Failed to load event data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  // Auto-save for event basics
  const updateEventBasics = async (field: string, value: any) => {
    if (!eventBasics) return;

    // Optimistic update
    setEventBasics((prev) => prev ? { ...prev, [field]: value } : prev);
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    setSaveStatus('saving');
    
    // Debounce API call
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/event-plans/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [field]: value })
        });
        
        if (!response.ok) throw new Error('Failed to save');
        
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('Save error:', error);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    }, 1000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Activities operations
  const updateActivity = async (index: number, field: string, value: any) => {
    try {
      const activity = activities[index];
      const response = await fetch(`/api/event-plans/activities/${activity.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      if (!response.ok) throw new Error("Failed to update activity");

      const updatedData = await response.json();
      setActivities((prev) => prev.map((a, i) => (i === index ? updatedData : a)));
    } catch (error) {
      console.error("Error updating activity:", error);
      alert("Failed to update activity. Please try again.");
    }
  };

  const addActivity = async () => {
    try {
      const newActivity: Activity = {
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

  const deleteActivity = async (index: number) => {
    try {
      const activity = activities[index];

      if (!confirm(`Are you sure you want to delete "${activity.name}"?`)) {
        return;
      }

      const response = await fetch(`/api/event-plans/activities/${activity.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete activity");

      setActivities((prev) => prev.filter((_, i) => i !== index));
      await fetchSchedule(); // Refresh schedule
    } catch (error) {
      console.error("Error deleting activity:", error);
      alert("Failed to delete activity. Please try again.");
    }
  };

  // Schedule operations
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

  const addScheduleItem = async () => {
    try {
      const newScheduleItem = {
        start_date: new Date().toISOString().split('T')[0],
        start_time: "12:00",
        end_time: "13:00",
        activity_id: null,
        location: "",
        notes: "",
      };

      const response = await fetch(`/api/event-plans/${id}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newScheduleItem),
      });

      if (!response.ok) throw new Error("Failed to add schedule item");
      await fetchSchedule();
    } catch (error) {
      console.error("Error adding schedule item:", error);
    }
  };

  // 
  // Tasks operations
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

  // Budget operations
  const fetchBudgetItems = async () => {
    try {
      const response = await fetch(`/api/event-plans/${id}/budget`);
      if (!response.ok) throw new Error("Failed to fetch budget items");
      const data = await response.json();
      setBudget(data);
    } catch (error) {
      console.error("Error fetching budget items:", error);
    }
  };

  const onBudgetChange = () => {
    fetchBudgetItems();
  };

  // Status change
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

  const fetchShoppingItems = async () => {
    try {
      const response = await fetch(`/api/event-plans/${id}/shopping`);
      if (!response.ok) throw new Error("Failed to fetch shopping items");
      const data = await response.json();
      setShopping(data);
    } catch (error) {
      console.error("Error fetching shopping items:", error);
    }
  };

  // Recalculate budget when shopping changes
  useEffect(() => {
    if (!loading && shopping.length > 0) {
      fetchBudgetItems();
    }
  }, [shopping]); // Only trigger on length change to avoid excessive calls

  const isReadOnly = status === "completed";

  // Tab and status configuration
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'activities', label: 'Activities' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'budget', label: 'Budget' },
    { id: 'summary', label: 'Summary' }
  ];

  const statusOptions = [
    { value: 'planning', label: 'Planning', color: '#9e9e9e' },
    { value: 'in_progress', label: 'In Progress', color: '#2196f3' },
    { value: 'ready', label: 'Ready', color: '#ff9800' },
    { value: 'completed', label: 'Completed', color: '#4caf50' }
  ];

  const currentStatus = statusOptions.find(s => s.value === status) || statusOptions[0];

  // Loading screen
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

  // Error screen
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

  // Main content (only renders when data is loaded)
  if (!eventBasics) return null;

  // Create eventPlan object only when needed
  const eventPlan: EventPlan = {
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
    </div>
  );
};

export default EventPlanningPage;