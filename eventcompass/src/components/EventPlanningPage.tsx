"use client";
import React, { useState, useEffect, useRef } from "react";
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

import { PLACEHOLDER_EVENT_BASICS, generatePlaceholderActivities, generatePlaceholderScheduleItems } from "@/app/utils/placeholderData";

import { EventPlan, EventBasics, Activity, ScheduleItem, Task, BudgetItem, ShoppingItem } from "@/types/eventPlan";

const EventPlanningPage = ({ id }: { id: string }) => {
  console.log("Event ID in EventPlanningPage:", id);

  const [eventPlan, setEventPlan] = useState<EventPlan>({
    event_basics: PLACEHOLDER_EVENT_BASICS,
    activities: [],
    schedule_items: [],
    tasks: [],
    budget_items: [],
    shopping_items: []
  });
  const [eventBasics, setEventBasics] = useState<EventBasics>(PLACEHOLDER_EVENT_BASICS);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [budget, setBudget] = useState<BudgetItem[]>([]);
  const [shopping, setShopping] = useState<ShoppingItem[]>([]);

  const [activeTab, setActiveTab] = useState("overview");
  const [status, setStatus] = useState("planning");
  const [loading, setLoading] = useState(true);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  // Fetching data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [ 
          eventResponse,
          eventActivitiesResponse,
          eventScheduleResponse,
          eventTasksResponse,
          eventBudgetResponse,
          eventShoppingResponse
        ] = await Promise.all([
          fetch(`/api/event-plans/${id}`),
          fetch(`/api/event-plans/${id}/activities`),
          fetch(`/api/event-plans/${id}/schedule`),
          fetch(`/api/event-plans/${id}/tasks`),
          fetch(`/api/event-plans/${id}/budget`),
          fetch(`/api/event-plans/${id}/shopping`),
        ])

        // Event Basics: Name, Description, etc.
        const event_response = await eventResponse.json();
        const event = event_response.event;
        // console.log("Event Basics: ", event);
        setEventBasics({
          // id: event.id,
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
        console.log("eventBasics: ", eventBasics);


        // Activities: List of activities
        const activities_response = await eventActivitiesResponse.json()
        console.log("Activities response from API: ", activities_response);
        setActivities(activities_response || []);

        // Schedule: List of schedule items
        const schedule_response = await eventScheduleResponse.json()
        console.log("Schedule response from API: ", schedule_response);
        setSchedule(schedule_response || []);

        // Tasks: List of tasks
        const tasks_response = await eventTasksResponse.json()
        console.log("Tasks response from API: ", tasks_response);
        setTasks(tasks_response || []);

        // Budget: List of budget items
        const budget_response = await eventBudgetResponse.json()
        console.log("Budget response from API: ", budget_response);
        setBudget(budget_response || []);

        // Shopping: List of shopping items
        const shopping_response = await eventShoppingResponse.json()
        console.log("Shopping response from API: ", shopping_response);
        setShopping(shopping_response || []);


        // setEventPlan(data.eventPlan);
      } catch (error) {
        console.error("Error fetching event plan:", error);
      } 
    };

    fetchData();
    
  }, [id]);

  useEffect(() => {
    setEventPlan({ 
      event_basics: eventBasics, 
      activities: activities, 
      schedule_items: schedule, 
      tasks: tasks, 
      budget_items: budget, 
      shopping_items: shopping});
  }, [eventBasics, activities, schedule, tasks, budget, shopping]);
  
  
   // ✅ Updated updatePlan with auto-save
   const updateEventBasics = async (field: string, value: any) => {
    // Update local state immediately (optimistic update)
    // Implement the rest of the tabs too
    setEventBasics((prev) => ({ ...prev, [field]: value }));
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Show saving status immediately
    setSaveStatus('saving');
    
    // Debounce the API call (wait 1 second after last change)
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/event-plans/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            [field]: value
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to save');
        }
        
        // Success!
        setSaveStatus('saved');
        
        // Hide success message after 2 seconds
        setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);
        
      } catch (error) {
        console.error('Save error:', error);
        setSaveStatus('error');
        
        // Optionally: revert the optimistic update
        // You could refetch the data here or keep a backup of previous state
        
        // Hide error message after 3 seconds
        setTimeout(() => {
          setSaveStatus('idle');
        }, 3000);
      }
    }, 1000); // 1 second debounce
  };

  // ✅ Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // For Activities Tab
  const updateActivity = async (index: number, field: string, value: any) => {
    try {
      const activity = activities[index];
      const updatedActivity = { ...activity, [field]: value };
  
      const response = await fetch(`/api/event-plans/activities/${activity.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [field]: value }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update activity");
      }
  
      const updatedData = await response.json();
  
      // Update the activity in the local state
      setActivities((prevActivities) =>
        prevActivities.map((a, i) => (i === index ? updatedData : a))
      );
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newActivity),
      });
  
      if (!response.ok) {
        throw new Error("Failed to add activity");
      }
  
      const createdActivity = await response.json();
  
      // Add the new activity to the local state
      setActivities((prevActivities) => [...prevActivities, createdActivity]);
    } catch (error) {
      console.error("Error adding activity:", error);
      alert("Failed to add activity. Please try again.");
    }
  };
  
  const deleteActivity = async (index: number) => {
    try {
      const activity = activities[index];
  
      if (!confirm(`Are you sure you want to delete the activity "${activity.name}"?`)) {
        return;
      }
  
      const response = await fetch(`/api/event-plans/activities/${activity.id}`, {
        method: "DELETE",
      });
  
      if (!response.ok) {
        throw new Error("Failed to delete activity");
      }
  
      // Remove the activity from the local state
      setActivities((prevActivities) =>
        prevActivities.filter((_, i) => i !== index)
      );

      // Refresh schedule in case any items were linked to this activity
      fetchSchedule();
    } catch (error) {
      console.error("Error deleting activity:", error);
      alert("Failed to delete activity. Please try again.");
    }
  };

  // For Schedule Tab
  const fetchSchedule = async () => {
    try {
      const response = await fetch(`/api/event-plans/${id}/schedule`);
      if (!response.ok) {
        throw new Error("Failed to fetch schedule");
      }
      const scheduleData = await response.json();
      console.log("Fetched schedule:", scheduleData);
      setSchedule(scheduleData || []);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  };

  // Function to add a new schedule item
  const addScheduleItem = async () => {
    try {
      const newScheduleItem = {
        start_date: "2024-12-14", // Example default values
        start_time: "12:00",
        end_time: "13:00",
        activity_id: null,
        location: "",
        notes: "",
      };

      const response = await fetch(`/api/event-plans/${id}/schedule`, {
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

  // For Tasks tab
  const fetchTasks = async (eventId: string, setTasks: (tasks: Task[]) => void) => {
    try {
      const response = await fetch(`/api/event-plans/${eventId}/tasks`, {
        method: "GET",
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
  
      const tasks = await response.json();
      console.log("Fetched tasks:", tasks);
  
      // Update the tasks state
      setTasks(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Function to fetch budget items from API
  const fetchBudgetItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/event-plans/${id}/budget`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch budget items");
      }
      
      const data = await response.json();
      setBudget(data);
    } catch (error) {
      console.error("Error fetching budget items:", error);
    } finally {
      setLoading(false);
    }
  };

  

  // This is the callback function to pass to BudgetTab
  const onBudgetChange = () => {
    fetchBudgetItems();
  };

  // Recalculate spending whenever shopping changes
  useEffect(() => {
    fetchBudgetItems();
  }, [shopping]);
  
  const isReadOnly = status !== "planning";



  // From Editor Screen
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
    { value: 'promo', label: 'In Progress', color: '#2196f3' },
    { value: 'reservations', label: 'Ready', color: '#ff9800' },
    { value: 'completed', label: 'Completed', color: '#4caf50' }
  ];

  const currentStatus = statusOptions.find(s => s.value === status) || statusOptions[0];

  

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#d5dcf1' }}>
      <div style={{ backgroundColor: '#FFF', borderBottom: '1px solid #e0e0e0', padding: '20px 30px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#333', margin: 0 }}>
            {eventBasics.name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#666' }}>Status:</label>
            <select
              value={status}
              // onChange={(e) => onStatusChange(e.target.value)}
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

      {/* ✅ Add Save Status Indicator (shared across all tabs) */}
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
            animation: "slideIn 0.3s ease",
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
            activities={activities}
            isReadOnly={isReadOnly}
            onBudgetChange={onBudgetChange}
          />
        )}

        {activeTab === "tasks" && (
          <TasksTab
            event_id={id}
            tasks={tasks}
            activities={activities}
            isReadOnly={isReadOnly}
            fetchTasks={() => fetchTasks(id, setTasks)}
          />
        )}

      {activeTab === "budget" && (
        <BudgetTab
          event_id={id}
          onBudgetChange={onBudgetChange}
          budgetItems={budget}
          isReadOnly={isReadOnly}
          // updateBudgetItem={updateBudgetItem}
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