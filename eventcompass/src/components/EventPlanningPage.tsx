"use client";
import React, { useState } from "react";
import EditorScreen from "./builder/EditorScreen";
import { useRouter, useSearchParams } from "next/navigation";

const PLACEHOLDER_EVENT_PLAN = {
  name: "Memory Lane Letter Writing Night",
  org: "Alzheimer's Awareness Group",
  description: "An intimate evening where students write heartfelt letters to nursing home residents while learning about Alzheimer's disease and memory care.",
  goals: ["Awareness/education", "Community bonding"],
  attendance: 60,
  date: "TBD",
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
  schedule: [
    { time: "6:00 PM", duration: "15 min", activityId: 1, notes: "" },
    { time: "6:15 PM", duration: "20 min", activityId: 2, notes: "" },
    { time: "6:35 PM", duration: "45 min", activityId: 3, notes: "" },
    { time: "7:20 PM", duration: "20 min", activityId: 4, notes: "" },
    { time: "7:40 PM", duration: "20 min", activityId: 5, notes: "" }
  ],
  shopping: [
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
      deadline: "2 weeks before", 
      status: "pending", 
      linkedTo: "activity-2" 
    },
    { 
      id: 2, 
      task: "Order stationery supplies", 
      assignedTo: "", 
      deadline: "1 week before", 
      status: "pending", 
      linkedTo: "activity-3" 
    },
    { 
      id: 3, 
      task: "Create letter writing prompts", 
      assignedTo: "", 
      deadline: "1 week before", 
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
      deadline: "3 weeks before", 
      status: "pending", 
      linkedTo: null 
    },
    { 
      id: 6, 
      task: "Reserve venue", 
      assignedTo: "", 
      deadline: "3 weeks before", 
      status: "pending", 
      linkedTo: null 
    },
    { 
      id: 7, 
      task: "Purchase refreshments", 
      assignedTo: "", 
      deadline: "2 days before", 
      status: "pending", 
      linkedTo: "activity-4" 
    }
  ],
  budget: [
    { category: "Food & Beverages", estimated: 200, actual: 0 },
    { category: "Stationery & Materials", estimated: 150, actual: 0 },
    { category: "Guest Speaker", estimated: 0, actual: 0 },
    { category: "Decorations", estimated: 75, actual: 0 },
    { category: "Printing & Signage", estimated: 50, actual: 0 },
    { category: "Miscellaneous", estimated: 25, actual: 0 }
  ]
};

const EventPlanningPage = () => {
  const searchParams = useSearchParams();
  const eventPlanParam = searchParams.get("eventPlan");
  
  const initialEventPlan = eventPlanParam 
    ? JSON.parse(eventPlanParam) 
    : PLACEHOLDER_EVENT_PLAN;
  
  const [eventPlan, setEventPlan] = useState(initialEventPlan);
  const [activeTab, setActiveTab] = useState("overview");
  const [status, setStatus] = useState("draft");

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

  const totalBudget = eventPlan?.budget.reduce((sum, item) => sum + item.estimated, 0) || 0;
  const isReadOnly = status !== "draft";

  return (
    <EditorScreen
      eventPlan={eventPlan}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      updatePlan={updatePlan}
      updateActivity={updateActivity}
      addActivity={addActivity}
      deleteActivity={deleteActivity}
      updateSchedule={updateSchedule}
      addScheduleItem={addScheduleItem}
      deleteScheduleItem={deleteScheduleItem}
      updateShoppingItem={updateShoppingItem}
      addShoppingItem={addShoppingItem}
      deleteShoppingItem={deleteShoppingItem}
      updateTask={updateTask}
      addTask={addTask}
      deleteTask={deleteTask}
      updateBudgetItem={updateBudgetItem}
      totalBudget={totalBudget}
      status={status}
      onStatusChange={setStatus}
      isReadOnly={isReadOnly}
    />
  );
};

export default EventPlanningPage;