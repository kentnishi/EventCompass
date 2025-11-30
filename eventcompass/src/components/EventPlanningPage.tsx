"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import OverviewTab from './builder/tabs/OverviewTab';
import { EventPlan, EventBasics } from "@/types/eventPlan";

const PLACEHOLDER_EVENT_PLAN = {
  id: "794208bc-af43-4c6b-9a5d-f339d1c131aa",
  name: "Memory Lane Letter Writing Night",
  // org: "Alzheimer's Awareness Group",
  description: "An intimate evening where students write heartfelt letters to nursing home residents while learning about Alzheimer's disease and memory care.",
  // goals: ["Awareness/education", "Community bonding"],
  start_date: new Date().toISOString().split("T")[0], // Current date in YYYY-MM-DD format
  end_date: new Date(new Date().setDate(new Date().getDate() + 1)) // Next day in YYYY-MM-DD format
    .toISOString()
    .split("T")[0],
  start_time: "09:00 AM", // Default start time
  end_time: "05:00 PM", // Default end time
  // committee: "On-Campus",
  budget: 500,
  location: "Thwing Atrium",
  attendees: 60,
  registration_required: true,
  event_type: "Social",
  activities: [
    { 
      id: 1, 
      name: "Check-in & Welcome", 
      description: "Greet attendees, distribute writing materials and name tags" 
    },
    { 
      id: 2, 
      name: "Educational Introduction", 
      description: "Guest speaker shares about Alzheimer's disease and the impact of letters on residents" 
    },
    { 
      id: 3, 
      name: "Letter Writing Session", 
      description: "Guided letter writing with prompts and examples provided at each table" 
    },
    { 
      id: 4, 
      name: "Reflection & Sharing", 
      description: "Optional sharing at reflection board with light refreshments" 
    },
    { 
      id: 5, 
      name: "Wrap-up & Clean-up", 
      description: "Collect letters, thank attendees, and coordinate cleanup" 
    }
  ],
  schedule_items: [
    { time: "6:00 PM", duration: 15, activityId: 1, notes: "" },
    { time: "6:15 PM", duration: 15, activityId: 2, notes: "" },
    { time: "6:35 PM", duration: 15, activityId: 3, notes: "" },
    { time: "7:20 PM", duration: 20, activityId: 4, notes: "" },
    { time: "7:40 PM", duration: 20, activityId: 5, notes: "" }
  ],
  shopping_items: [
    { 
      id: 1, 
      item: "Stationery sets", 
      quantity: "60", 
      category: "Materials", 
      linkedTo: "activity-3", 
      purchased: false 
    },
    { 
      id: 2, 
      item: "Writing prompts cards", 
      quantity: "60", 
      category: "Materials", 
      linkedTo: "activity-3", 
      purchased: false 
    },
    { 
      id: 3, 
      item: "Tea & Coffee", 
      quantity: "For 60", 
      category: "Food", 
      linkedTo: "activity-4", 
      purchased: false 
    },
    { 
      id: 4, 
      item: "Cookies", 
      quantity: "5 boxes", 
      category: "Food", 
      linkedTo: "activity-4", 
      purchased: false 
    },
    { 
      id: 5, 
      item: "Display boards", 
      quantity: "2", 
      category: "Equipment", 
      linkedTo: "activity-4", 
      purchased: false 
    },
    { 
      id: 6, 
      item: "Name tags", 
      quantity: "60", 
      category: "Materials", 
      linkedTo: "activity-1", 
      purchased: false 
    },
    { 
      id: 7, 
      item: "Envelopes", 
      quantity: "60", 
      category: "Materials", 
      linkedTo: "activity-3", 
      purchased: false 
    }
  ],
  tasks: [
    { 
      id: 1, 
      task: "Book guest speaker", 
      assignedTo: "", 
      deadline: "2025-11-25",
      status: "pending", 
      linkedTo: "activity-2" 
    },
    { 
      id: 2, 
      task: "Order stationery supplies", 
      assignedTo: "", 
      deadline: "2025-11-25", 
      status: "pending", 
      linkedTo: "activity-3" 
    },
    { 
      id: 3, 
      task: "Create letter writing prompts", 
      assignedTo: "", 
      deadline: "2025-11-25", 
      status: "pending", 
      linkedTo: "activity-3" 
    },
    { 
      id: 4, 
      task: "Set up reflection board", 
      assignedTo: "", 
      deadline: "Day of event", 
      status: "pending", 
      linkedTo: "activity-4" 
    },
    { 
      id: 5, 
      task: "Coordinate with nursing home", 
      assignedTo: "", 
      deadline: "2025-11-25", 
      status: "pending", 
      linkedTo: null 
    },
    { 
      id: 6, 
      task: "Reserve venue", 
      assignedTo: "", 
      deadline: "2025-11-25", 
      status: "pending", 
      linkedTo: null 
    },
    { 
      id: 7, 
      task: "Purchase refreshments", 
      assignedTo: "", 
      deadline: "2025-11-25", 
      status: "pending", 
      linkedTo: "activity-4" 
    }
  ],
  budget_items: [
    { category: "Food & Beverages", estimated: 200, actual: 0 },
    { category: "Stationery & Materials", estimated: 150, actual: 0 },
    { category: "Guest Speaker", estimated: 0, actual: 0 },
    { category: "Decorations", estimated: 75, actual: 0 },
    { category: "Printing & Signage", estimated: 50, actual: 0 },
    { category: "Miscellaneous", estimated: 25, actual: 0 }
  ]
};

const EventPlanningPage = ({ id }: { id: string }) => {
  console.log("Event ID in EventPlanningPage:", id);
  
  
  // const searchParams = useSearchParams();
  // const eventPlanParam = searchParams.get("eventPlan");

  // console.log("EventPlanParam: ", eventPlanParam);
  
  // const initialEventPlan = eventPlanParam 
  //   ? JSON.parse(eventPlanParam) 
  //   : PLACEHOLDER_EVENT_PLAN;
  
  
  const PLACEHOLDER_EVENT_BASICS = {
    name: "Memory Lane Letter Writing Night",
    description: "An intimate evening where students write heartfelt letters to nursing home residents while learning about Alzheimer's disease and memory care.",
    attendees: 60,
    start_date: "2023-10-05", // ISO date string (e.g., "2023-10-05")
    start_time: "9:00 AM", // Time string (e.g., "09:00 AM")
    end_date: "2023-10-05", // ISO date string (e.g., "2023-10-06")
    end_time: "10:00 AM", // Time string (e.g., "05:00 PM")
    budget: 500, // Total budget
    location: "Thwing Atrium",
    registration_required: true,
    event_type: "Social"
  }

  const [eventPlan, setEventPlan] = useState(PLACEHOLDER_EVENT_PLAN);
  const [eventBasics, setEventBasics] = useState<EventBasics>(PLACEHOLDER_EVENT_BASICS);
  const [activeTab, setActiveTab] = useState("overview");
  const [status, setStatus] = useState("planning");
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [ 
          eventResponse
        ] = await Promise.all([
          fetch(`/api/event-plans/${id}`)
        ])

        const event_response = await eventResponse.json();
        const event = event_response.event;
        console.log("Updating state with: ", event);
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
        // setEventPlan(data.eventPlan);
      } catch (error) {
        console.error("Error fetching event plan:", error);
      } 
    };

    fetchData();
  }, [id]);
  
  
  console.log("Event basics from EventPlanningPage:", eventBasics);
  

  const updatePlan = (field, value) => {
    setEventPlan((prev) => ({ ...prev, [field]: value }));
  };

  const updateActivity = (index, field, value) => {
    const newActivities = [...eventPlan.activities];
    newActivities[index][field] = value;
    updatePlan("activities", newActivities);
  };

  const addActivity = () => {
    const newId = Math.max(0, ...eventPlan.activities.map((a) => a.id)) + 1;
    const newActivities = [
      ...eventPlan.activities, 
      { id: newId, name: "", description: "" }
    ];
    updatePlan("activities", newActivities);
  };

  const deleteActivity = (index) => {
    const newActivities = eventPlan.activities.filter((_, i) => i !== index);
    updatePlan("activities", newActivities);
  };

  const updateSchedule = (index, field, value) => {
    const newSchedule = [...eventPlan.schedule];
    newSchedule[index][field] = value;
    updatePlan("schedule", newSchedule);
  };

  const addScheduleItem = () => {
    const newSchedule = [
      ...eventPlan.schedule, 
      { time: "", duration: "", activityId: null, notes: "" }
    ];
    updatePlan("schedule", newSchedule);
  };

  const deleteScheduleItem = (index) => {
    const newSchedule = eventPlan.schedule.filter((_, i) => i !== index);
    updatePlan("schedule", newSchedule);
  };

  const updateShoppingItem = (index, field, value) => {
    const newShopping = [...eventPlan.shopping];
    newShopping[index][field] = value;
    updatePlan("shopping", newShopping);
  };

  const addShoppingItem = () => {
    const newId = Math.max(0, ...eventPlan.shopping.map((s) => s.id)) + 1;
    const newShopping = [
      ...eventPlan.shopping, 
      { id: newId, item: "", quantity: "", category: "", linkedTo: null, purchased: false }
    ];
    updatePlan("shopping", newShopping);
  };

  const deleteShoppingItem = (index) => {
    const newShopping = eventPlan.shopping.filter((_, i) => i !== index);
    updatePlan("shopping", newShopping);
  };

  const updateTask = (index, field, value) => {
    const newTasks = [...eventPlan.tasks];
    newTasks[index][field] = value;
    updatePlan("tasks", newTasks);
  };

  const addTask = () => {
    const newId = Math.max(0, ...eventPlan.tasks.map((t) => t.id)) + 1;
    const newTasks = [
      ...eventPlan.tasks, 
      { id: newId, task: "", assignedTo: "", deadline: "", status: "pending", linkedTo: null }
    ];
    updatePlan("tasks", newTasks);
  };

  const deleteTask = (index) => {
    const newTasks = eventPlan.tasks.filter((_, i) => i !== index);
    updatePlan("tasks", newTasks);
  };

  const updateBudgetItem = (index, field, value) => {
    const newBudget = [...eventPlan.budget];
    newBudget[index][field] = value;
    updatePlan("budget", newBudget);
  };
  
  const totalBudget = eventBasics.budget;
  // const totalBudget = eventBasics.budget = (eventBasics.budget | 0).reduce((sum, item) => sum + item.estimated, 0) || 0;
  const isReadOnly = status !== "planning";



  // From Editor Screen
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'activities', label: 'Activities' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'budget', label: 'Budget' }
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

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px' }}>
        {activeTab === 'overview' && (
          <OverviewTab
            eventPlan={eventBasics}
            updatePlan={updatePlan}
            isReadOnly={isReadOnly}
          />
          
        )}

        {activeTab === 'activities' && (
          <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#333', margin: 0 }}>Activities</h3>
              {!isReadOnly && (
                <button 
                  onClick={addActivity}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    backgroundColor: '#6B7FD7',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <AddIcon style={{ width: '16px', height: '16px' }} />
                  Add Activity
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {eventPlan.activities.map((activity, i) => (
                <div key={i} style={{ padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: isReadOnly ? '#f9f9f9' : '#fff' }}>
                  <input
                    type="text"
                    value={activity.name}
                    onChange={(e) => updateActivity(i, 'name', e.target.value)}
                    placeholder="Activity name"
                    disabled={isReadOnly}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      marginBottom: '8px',
                      backgroundColor: isReadOnly ? '#f5f5f5' : '#fff',
                      cursor: isReadOnly ? 'not-allowed' : 'text'
                    }}
                  />
                  <textarea
                    value={activity.description}
                    onChange={(e) => updateActivity(i, 'description', e.target.value)}
                    placeholder="Description"
                    disabled={isReadOnly}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '0.95rem',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      minHeight: '60px',
                      resize: 'vertical',
                      backgroundColor: isReadOnly ? '#f5f5f5' : '#fff',
                      cursor: isReadOnly ? 'not-allowed' : 'text'
                    }}
                  />
                  {!isReadOnly && (
                    <button 
                      onClick={() => deleteActivity(i)}
                      style={{
                        marginTop: '8px',
                        padding: '6px 12px',
                        backgroundColor: 'transparent',
                        color: '#f44336',
                        border: '1px solid #f44336',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#333', margin: 0 }}>Schedule</h3>
              {!isReadOnly && (
                <button 
                  onClick={addScheduleItem}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    backgroundColor: '#6B7FD7',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <AddIcon style={{ width: '16px', height: '16px' }} />
                  Add Time Slot
                </button>
              )}
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>Time</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>Duration</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>Activity</th>
                    {!isReadOnly && <th style={{ padding: '12px' }}></th>}
                  </tr>
                </thead>
                <tbody>
                  {eventPlan.schedule.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ padding: '12px' }}>
                        <input
                          type="text"
                          value={item.time}
                          onChange={(e) => updateSchedule(i, 'time', e.target.value)}
                          placeholder="7:00 PM"
                          disabled={isReadOnly}
                          style={{ 
                            padding: '8px', 
                            fontSize: '0.9rem', 
                            border: '1px solid #ddd', 
                            borderRadius: '6px', 
                            width: '100px',
                            backgroundColor: isReadOnly ? '#f5f5f5' : '#fff',
                            cursor: isReadOnly ? 'not-allowed' : 'text'
                          }}
                        />
                      </td>
                      <td style={{ padding: '12px' }}>
                        <input
                          type="text"
                          value={item.duration}
                          onChange={(e) => updateSchedule(i, 'duration', e.target.value)}
                          placeholder="30 min"
                          disabled={isReadOnly}
                          style={{ 
                            padding: '8px', 
                            fontSize: '0.9rem', 
                            border: '1px solid #ddd', 
                            borderRadius: '6px', 
                            width: '100px',
                            backgroundColor: isReadOnly ? '#f5f5f5' : '#fff',
                            cursor: isReadOnly ? 'not-allowed' : 'text'
                          }}
                        />
                      </td>
                      <td style={{ padding: '12px' }}>
                        <select
                          value={item.activityId || ''}
                          onChange={(e) => updateSchedule(i, 'activityId', e.target.value ? parseInt(e.target.value) : null)}
                          disabled={isReadOnly}
                          style={{ 
                            padding: '8px', 
                            fontSize: '0.9rem', 
                            border: '1px solid #ddd', 
                            borderRadius: '6px', 
                            width: '100%',
                            backgroundColor: isReadOnly ? '#f5f5f5' : '#fff',
                            cursor: isReadOnly ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <option value="">Select...</option>
                          {eventPlan.activities.map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                          ))}
                        </select>
                      </td>
                      {!isReadOnly && (
                        <td style={{ padding: '12px' }}>
                          <button onClick={() => deleteScheduleItem(i)} style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer' }}>
                            <DeleteIcon style={{ width: '18px', height: '18px' }} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'shopping' && (
          <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#333', margin: 0 }}>Shopping List</h3>
              {!isReadOnly && (
                <button 
                  onClick={addShoppingItem}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    backgroundColor: '#6B7FD7',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <AddIcon style={{ width: '16px', height: '16px' }} />
                  Add Item
                </button>
              )}
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>Item</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>Qty</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>Category</th>
                    {!isReadOnly && <th style={{ padding: '12px' }}></th>}
                  </tr>
                </thead>
                <tbody>
                  {eventPlan.shopping.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ padding: '12px' }}>
                        <input
                          type="text"
                          value={item.item}
                          onChange={(e) => updateShoppingItem(i, 'item', e.target.value)}
                          placeholder="Item name"
                          disabled={isReadOnly}
                          style={{ 
                            padding: '8px', 
                            fontSize: '0.9rem', 
                            border: '1px solid #ddd', 
                            borderRadius: '6px', 
                            width: '100%',
                            backgroundColor: isReadOnly ? '#f5f5f5' : '#fff',
                            cursor: isReadOnly ? 'not-allowed' : 'text'
                          }}
                        />
                      </td>
                      <td style={{ padding: '12px' }}>
                        <input
                          type="text"
                          value={item.quantity}
                          onChange={(e) => updateShoppingItem(i, 'quantity', e.target.value)}
                          placeholder="Qty"
                          disabled={isReadOnly}
                          style={{ 
                            padding: '8px', 
                            fontSize: '0.9rem', 
                            border: '1px solid #ddd', 
                            borderRadius: '6px', 
                            width: '80px',
                            backgroundColor: isReadOnly ? '#f5f5f5' : '#fff',
                            cursor: isReadOnly ? 'not-allowed' : 'text'
                          }}
                        />
                      </td>
                      <td style={{ padding: '12px' }}>
                        <select
                          value={item.category}
                          onChange={(e) => updateShoppingItem(i, 'category', e.target.value)}
                          disabled={isReadOnly}
                          style={{ 
                            padding: '8px', 
                            fontSize: '0.9rem', 
                            border: '1px solid #ddd', 
                            borderRadius: '6px', 
                            width: '150px',
                            backgroundColor: isReadOnly ? '#f5f5f5' : '#fff',
                            cursor: isReadOnly ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <option value="">Select...</option>
                          <option value="Food">Food</option>
                          <option value="Materials">Materials</option>
                          <option value="Equipment">Equipment</option>
                        </select>
                      </td>
                      {!isReadOnly && (
                        <td style={{ padding: '12px' }}>
                          <button onClick={() => deleteShoppingItem(i)} style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer' }}>
                            <DeleteIcon style={{ width: '18px', height: '18px' }} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#333', margin: 0 }}>Tasks</h3>
              {!isReadOnly && (
                <button 
                  onClick={addTask}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    backgroundColor: '#6B7FD7',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <AddIcon style={{ width: '16px', height: '16px' }} />
                  Add Task
                </button>
              )}
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>Task</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>Assigned</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>Deadline</th>
                    {!isReadOnly && <th style={{ padding: '12px' }}></th>}
                  </tr>
                </thead>
                <tbody>
                  {eventPlan.tasks.map((task, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ padding: '12px' }}>
                        <input
                          type="text"
                          value={task.task}
                          onChange={(e) => updateTask(i, 'task', e.target.value)}
                          placeholder="Task description"
                          disabled={isReadOnly}
                          style={{ 
                            padding: '8px', 
                            fontSize: '0.9rem', 
                            border: '1px solid #ddd', 
                            borderRadius: '6px', 
                            width: '100%',
                            backgroundColor: isReadOnly ? '#f5f5f5' : '#fff',
                            cursor: isReadOnly ? 'not-allowed' : 'text'
                          }}
                        />
                      </td>
                      <td style={{ padding: '12px' }}>
                        <input
                          type="text"
                          value={task.assignedTo}
                          onChange={(e) => updateTask(i, 'assignedTo', e.target.value)}
                          placeholder="Name"
                          disabled={isReadOnly}
                          style={{ 
                            padding: '8px', 
                            fontSize: '0.9rem', 
                            border: '1px solid #ddd', 
                            borderRadius: '6px', 
                            width: '120px',
                            backgroundColor: isReadOnly ? '#f5f5f5' : '#fff',
                            cursor: isReadOnly ? 'not-allowed' : 'text'
                          }}
                        />
                      </td>
                      <td style={{ padding: '12px' }}>
                        <input
                          type="text"
                          value={task.deadline}
                          onChange={(e) => updateTask(i, 'deadline', e.target.value)}
                          placeholder="Date"
                          disabled={isReadOnly}
                          style={{ 
                            padding: '8px', 
                            fontSize: '0.9rem', 
                            border: '1px solid #ddd', 
                            borderRadius: '6px', 
                            width: '120px',
                            backgroundColor: isReadOnly ? '#f5f5f5' : '#fff',
                            cursor: isReadOnly ? 'not-allowed' : 'text'
                          }}
                        />
                      </td>
                      {!isReadOnly && (
                        <td style={{ padding: '12px' }}>
                          <button onClick={() => deleteTask(i)} style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer' }}>
                            <DeleteIcon style={{ width: '18px', height: '18px' }} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'budget' && (
          <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#333', marginBottom: '24px' }}>Budget</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>Category</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>Estimated</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>Actual</th>
                  </tr>
                </thead>
                <tbody>
                  {eventPlan.budget.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ padding: '12px', fontWeight: 600, color: '#333' }}>{item.category}</td>
                      <td style={{ padding: '12px' }}>
                        <input
                          type="number"
                          value={item.estimated}
                          onChange={(e) => updateBudgetItem(i, 'estimated', parseInt(e.target.value) || 0)}
                          disabled={isReadOnly}
                          style={{ 
                            padding: '8px', 
                            fontSize: '0.9rem', 
                            border: '1px solid #ddd', 
                            borderRadius: '6px', 
                            width: '100px',
                            backgroundColor: isReadOnly ? '#f5f5f5' : '#fff',
                            cursor: isReadOnly ? 'not-allowed' : 'text'
                          }}
                        />
                      </td>
                      <td style={{ padding: '12px' }}>
                        <input
                          type="number"
                          value={item.actual}
                          onChange={(e) => updateBudgetItem(i, 'actual', parseInt(e.target.value) || 0)}
                          disabled={isReadOnly}
                          style={{ 
                            padding: '8px', 
                            fontSize: '0.9rem', 
                            border: '1px solid #ddd', 
                            borderRadius: '6px', 
                            width: '100px',
                            backgroundColor: isReadOnly ? '#f5f5f5' : '#fff',
                            cursor: isReadOnly ? 'not-allowed' : 'text'
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                  <tr style={{ backgroundColor: '#f5f5f5', fontWeight: 700 }}>
                    <td style={{ padding: '12px' }}>Total</td>
                    <td style={{ padding: '12px' }}>${totalBudget}</td>
                    <td style={{ padding: '12px' }}>${eventPlan.budget.reduce((s, i) => s + i.actual, 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventPlanningPage;