"use client";

import { useRouter } from "next/navigation";
import React, { useState } from 'react';
import StartScreen from './questionaire/StartScreen';
import IntakeForm from './questionaire/IntakeForm';
import ConceptsScreen from './questionaire/ConceptsScreen';
import PreviewScreen from './questionaire/PreviewScreen';

import { PLACEHOLDER_EVENT_BASICS, generatePlaceholderActivities, generatePlaceholderScheduleItems, generatePlaceholderTasks, generatePlaceholderBudgetItems } from "@/app/utils/placeholderData";


// Main App Component
const EventQuestionaire = () => {
  const [step, setStep] = useState('start');
  const [selectedPath, setSelectedPath] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [eventPlan, setEventPlan] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [keepSections, setKeepSections] = useState({
    activities: true,
    schedule: true,
    logistics: true,
    food: true,
    budget: true,
    marketing: true,
    shopping: true,
    tasks: true
  });
  const [status, setStatus] = useState('planning');

  const router = useRouter();


  const conceptsByPath = {
    'no-idea': [
      {
        id: 1,
        title: "Memory Lane Letter Writing Night",
        goal: "Awareness + community",
        description: "Students write letters to local nursing home residents living with Alzheimer's. Short educational intro by a guest speaker, followed by letter-writing and snacks.",
        elements: ["Stationery table", "Short talk", "Reflection board", "Calm music"],
        budget: "$-$$"
      },
      {
        id: 2,
        title: "Purple Ribbon Craft & Info Fair",
        goal: "Education + hands-on",
        description: "Interactive stations where students learn Alzheimer's facts while creating purple ribbon awareness crafts.",
        elements: ["Craft stations", "Info booths", "Memory games", "Brain-healthy snacks"],
        budget: "$$"
      }
    ],
    'rough-idea': [
      {
        id: 1,
        title: "DIY Korean Convenience Store Night",
        goal: "Interactive + social",
        description: "Stations with ramyeon bar, kimbap rolling demo, and snack tasting. Students build their own combo and decorate snack bags.",
        elements: ["Ramyeon bar", "Kimbap rolling demo", "Snack tasting", "Bag decorating"],
        budget: "$$"
      },
      {
        id: 2,
        title: "Korean Snack Flight Tasting",
        goal: "Low-prep + discovery",
        description: "Curated tasting of Korean snacks with info cards. Pre-prepped and casual with themed stations.",
        elements: ["Tasting stations", "Info cards", "Voting boards", "Photo backdrop"],
        budget: "$"
      }
    ]
  };

  const generateDetailedPlan = () => {
    if (selectedConcept.id === 1) {
      return {
        name: "Memory Lane Letter Writing Night",
        org: "Alzheimer's Awareness Group",
        description: "An intimate evening where students write heartfelt letters to nursing home residents while learning about Alzheimer's disease and memory care.",
        goals: ["Awareness/education", "Community bonding"],
        attendance: 60,
        date: "TBD",
        activities: [
          { id: 1, name: "Check-in & Welcome", description: "Greet attendees, distribute writing materials" },
          { id: 2, name: "Educational Introduction", description: "Guest speaker shares about Alzheimer's and letter impact" },
          { id: 3, name: "Letter Writing Session", description: "Guided letter writing with prompts and examples" },
          { id: 4, name: "Reflection & Sharing", description: "Optional sharing at reflection board with snacks" },
          { id: 5, name: "Wrap-up & Clean-up", description: "Collect letters, thank attendees" }
        ],
        schedule: [
          { time: "6:00 PM", duration: 15, activityId: 1, notes: "" },
          { time: "6:15 PM", duration: 20, activityId: 2, notes: "" },
          { time: "6:35 PM", duration: 45, activityId: 3, notes: "" },
          { time: "7:20 PM", duration: 20, activityId: 4, notes: "" },
          { time: "7:40 PM", duration: 20, activityId: 5, notes: "" }
        ],
        shopping: [
          { item: "Stationery sets", quantity: 60, category: "Materials", linkedTo: null, purchased: false },
          { item: "Writing prompts cards", quantity: 60, category: "Materials", linkedTo: null, purchased: false },
          { item: "Tea & Coffee", quantity: 60, category: "Food", linkedTo: null, purchased: false },
          { item: "Cookies", quantity: 5, category: "Food", linkedTo: null, purchased: false },
          { item: "Display boards", quantity: 2, category: "Equipment", linkedTo: null, purchased: false }
        ],
        tasks: [
          { id: 1, task: "Book guest speaker", assignedTo: "", deadline: "2 weeks before", status: "pending", linkedTo: null },
          { id: 2, task: "Order stationery supplies", assignedTo: "", deadline: "1 week before", status: "pending", linkedTo: null },
          { id: 3, task: "Create letter writing prompts", assignedTo: "", deadline: "1 week before", status: "pending", linkedTo: null },
          { id: 4, task: "Set up reflection board", assignedTo: "", deadline: "Day of event", status: "pending", linkedTo: null },
          { id: 5, task: "Coordinate with nursing home", assignedTo: "", deadline: "3 weeks before", status: "pending", linkedTo: null }
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
    } else {
      return {
        name: "DIY Korean Convenience Store Night",
        org: "Korean Cultural Association",
        description: "Experience the fun of Korean convenience store culture with interactive food stations, DIY snack combos, and K-culture vibes.",
        goals: ["Cultural education", "Community bonding", "Interactive experience"],
        attendance: 80,
        date: "TBD",
        activities: [
          { id: 1, name: "Check-in & Station Overview", description: "Welcome guests, explain stations, distribute tasting cards" },
          { id: 2, name: "Open Stations Time", description: "Ramyeon bar, kimbap rolling, snack tasting, bag decorating" },
          { id: 3, name: "Group Activity & Photos", description: "Best combo contest, photo booth with props" },
          { id: 4, name: "Wrap-up & Clean-up", description: "Thank attendees, collect feedback" }
        ],
        schedule: [
          { time: "7:00 PM", duration: 15, activityId: 1, notes: "" },
          { time: "7:15 PM", duration: 60, activityId: 2, notes: "" },
          { time: "8:15 PM", duration: 30, activityId: 3, notes: "" },
          { time: "8:45 PM", duration: 15, activityId: 4, notes: "" }
        ],
        shopping: [
          { id: 1, item: "Ramyeon varieties", quantity: 80, category: "Food", linkedTo: null, purchased: false },
          { id: 2, item: "Kimbap ingredients", quantity: "For 80", category: "Food", linkedTo: null, purchased: false },
          { id: 3, item: "Korean snacks", quantity: "10 boxes", category: "Food", linkedTo: null, purchased: false },
          { id: 4, item: "Decorative bags", quantity: 80, category: "Materials", linkedTo: null, purchased: false },
          { id: 5, item: "Photo props", quantity: "1 set", category: "Materials", linkedTo: null, purchased: false }
        ],
        tasks: [
          { id: 1, task: "Reserve venue with kitchen", assignedTo: "", deadline: "3 weeks before", status: "pending", linkedTo: null },
          { id: 2, task: "Order Korean ingredients", assignedTo: "", deadline: "1 week before", status: "pending", linkedTo: null },
          { id: 3, task: "Recruit station leaders", assignedTo: "", deadline: "2 weeks before", status: "pending", linkedTo: null },
          { id: 4, task: "Create contest rules", assignedTo: "", deadline: "1 week before", status: "pending", linkedTo: null }
        ],
        budget: [
          { category: "Food & Ingredients", estimated: 600, actual: 0 },
          { category: "Beverages", estimated: 120, actual: 0 },
          { category: "Serving Supplies", estimated: 100, actual: 0 },
          { category: "Decorations & Props", estimated: 80, actual: 0 },
          { category: "Materials", estimated: 60, actual: 0 },
          { category: "Miscellaneous", estimated: 40, actual: 0 }
        ]
      };
    }
  };

  

  const handleStartPath = (path) => {
    setSelectedPath(path);
    setStep('intake');
  };

  const handleIntakeSubmit = () => {
    setStep('concepts');
  };

  const handleConceptSelect = (concept) => {
    setSelectedConcept(concept);
  };

  const handleCreatePlan = () => {
    const plan = generateDetailedPlan();
    setEventPlan(plan);
    setStep('preview');
  };

  const toggleSection = (section) => {
    setKeepSections(prev => ({ ...prev, [section]: !prev[section] }));
  };


  const proceedToEditor = async () => {
    // const customizedPlan = PLACEHOLDER_EVENT_PLAN;

    // if (!keepSections.activities) PLACEHOLDER_ACTIVITIES.activities = [];
    // if (!keepSections.schedule) customizedPlan.schedule = [];
    // if (!keepSections.shopping) customizedPlan.shopping = [];
    // if (!keepSections.tasks) customizedPlan.tasks = [];
    // if (!keepSections.budget) {
    //   customizedPlan.budget = [
    //     { category: "Food & Beverages", estimated: 0, actual: 0 },
    //     { category: "Miscellaneous", estimated: 0, actual: 0 },
    //   ];
    // }
  
    try {
      // Create the event in the database with all related data
      const eventResponse = await fetch("/api/event-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...PLACEHOLDER_EVENT_BASICS, 
        }),
      });
  
      if (!eventResponse.ok) {
        const errorText = await eventResponse.text();
        console.error("Failed to create event:", errorText);
        throw new Error(`Failed to create event: ${errorText}`);
      }
  
      // const result = await response.json();
      const { event } = await eventResponse.json();
      const id = event.id;

      const insertPromises = [];

      const PLACEHOLDER_ACTIVITIES = generatePlaceholderActivities(id);

      // Add activities


      if (PLACEHOLDER_ACTIVITIES.length > 0) { //Replace with whether activities is being kept
        const activitiesResponse = await fetch(`/api/event-plans/${id}/activities`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(PLACEHOLDER_ACTIVITIES),
        });

        if (!activitiesResponse.ok) {
          const errorText = await activitiesResponse.text();
          console.error("Failed to add activities:", errorText);
          throw new Error(`Failed to add activities: ${errorText}`);
        }

        const activities = await activitiesResponse.json();
        console.log("Activities added:", activities);

        // Activities must exist for schedule to work
        const PLACEHOLDER_SCHEDULE = generatePlaceholderScheduleItems(id, activities);
        if (PLACEHOLDER_SCHEDULE.length > 0) { // Replace with logic about whether schedule is being kept
          const scheduleResponse = await fetch(`/api/event-plans/${id}/schedule`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(PLACEHOLDER_SCHEDULE),
            })

            const { schedule } = await scheduleResponse.json();

            if (!scheduleResponse.ok) {
              const errorText = await scheduleResponse.text();
              console.error("Failed to add schedule:", errorText);
              throw new Error(`Failed to add schedule: ${errorText}`);
            }

            console.log("Schedule added:", schedule);
        }

        const PLACEHOLDER_TASKS = generatePlaceholderTasks(id, activities);
        if (PLACEHOLDER_TASKS.length > 0) { // Replace with logic about whether tasks is being kept
          const tasksResponse = await fetch(`/api/event-plans/${id}/tasks`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(PLACEHOLDER_TASKS),
            })

            const { tasks } = await tasksResponse.json();

            if (!tasksResponse.ok) {
              const errorText = await tasksResponse.text();
              console.error("Failed to add tasks:", errorText);
              throw new Error(`Failed to add tasks: ${errorText}`);
            }

            console.log("Tasks added:", tasks);
        }

        const PLACEHOLDER_BUDGET = generatePlaceholderBudgetItems(id);
        if (PLACEHOLDER_BUDGET.length > 0) { // Replace with logic about whether budget is being kept
          const budgetResponse = await fetch(`/api/event-plans/${id}/budget`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(PLACEHOLDER_BUDGET),
            })

            const { budget } = await budgetResponse.json();

            if (!budgetResponse.ok) {
              const errorText = await budgetResponse.text();
              console.error("Failed to add budget items:", errorText);
              throw new Error(`Failed to add budget items: ${errorText}`);
            }

            console.log("Budget items added:", budget);
        }



      }


      
      // Navigate to the event editor page
      router.push(`/event-plans/${id}`);
    } catch (error) {
      console.error("Error creating event:", error);
      alert("An error occurred while creating the event. Please try again.");
    }
  };

  const updatePlan = (field, value) => {
    setEventPlan(prev => ({ ...prev, [field]: value }));
  };

  const updateActivity = (index, field, value) => {
    const newActivities = [...eventPlan.activities];
    newActivities[index][field] = value;
    updatePlan('activities', newActivities);
  };

  const addActivity = () => {
    const newId = Math.max(0, ...eventPlan.activities.map(a => a.id)) + 1;
    const newActivities = [...eventPlan.activities, { id: newId, name: "", description: "" }];
    updatePlan('activities', newActivities);
  };

  const deleteActivity = (index) => {
    const newActivities = eventPlan.activities.filter((_, i) => i !== index);
    updatePlan('activities', newActivities);
  };

  const updateSchedule = (index, field, value) => {
    const newSchedule = [...eventPlan.schedule];
    newSchedule[index][field] = value;
    updatePlan('schedule', newSchedule);
  };

  const addScheduleItem = () => {
    const newSchedule = [...eventPlan.schedule, { time: "", duration: "", activityId: null, notes: "" }];
    updatePlan('schedule', newSchedule);
  };

  const deleteScheduleItem = (index) => {
    const newSchedule = eventPlan.schedule.filter((_, i) => i !== index);
    updatePlan('schedule', newSchedule);
  };

  const updateShoppingItem = (index, field, value) => {
    const newShopping = [...eventPlan.shopping];
    newShopping[index][field] = value;
    updatePlan('shopping', newShopping);
  };

  const addShoppingItem = () => {
    const newId = Math.max(0, ...eventPlan.shopping.map(s => s.id)) + 1;
    const newShopping = [...eventPlan.shopping, { id: newId, item: "", quantity: "", category: "", linkedTo: null, purchased: false }];
    updatePlan('shopping', newShopping);
  };

  const deleteShoppingItem = (index) => {
    const newShopping = eventPlan.shopping.filter((_, i) => i !== index);
    updatePlan('shopping', newShopping);
  };

  const updateTask = (index, field, value) => {
    const newTasks = [...eventPlan.tasks];
    newTasks[index][field] = value;
    updatePlan('tasks', newTasks);
  };

  const addTask = () => {
    const newId = Math.max(0, ...eventPlan.tasks.map(t => t.id)) + 1;
    const newTasks = [...eventPlan.tasks, { id: newId, task: "", assignedTo: "", deadline: "", status: "pending", linkedTo: null }];
    updatePlan('tasks', newTasks);
  };

  const deleteTask = (index) => {
    const newTasks = eventPlan.tasks.filter((_, i) => i !== index);
    updatePlan('tasks', newTasks);
  };

  const updateBudgetItem = (index, field, value) => {
    const newBudget = [...eventPlan.budget];
    newBudget[index][field] = value;
    updatePlan('budget', newBudget);
  };

  const totalBudget = eventPlan?.budget.reduce((sum, item) => sum + item.estimated, 0) || 0;

  // Render appropriate screen based on step
  if (step === 'start') {
    return <StartScreen onSelectPath={handleStartPath} />;
  }

  if (step === 'intake') {
    return (
      <IntakeForm
        selectedPath={selectedPath}
        onBack={() => setStep('start')}
        onSubmit={handleIntakeSubmit}
        formData={formData}
        setFormData={setFormData}
      />
    );
  }

  if (step === 'concepts') {
    return (
      <ConceptsScreen
        selectedPath={selectedPath}
        concepts={conceptsByPath[selectedPath] || []}
        selectedConcept={selectedConcept}
        onSelectConcept={handleConceptSelect}
        onCreatePlan={handleCreatePlan}
        onBack={() => setStep('intake')}
      />
    );
  }

  if (step === 'preview' && eventPlan) {
    return (
      <PreviewScreen
        eventPlan={eventPlan}
        keepSections={keepSections}
        onToggleSection={toggleSection}
        onProceed={proceedToEditor}
        onBack={() => setStep('concepts')}
      />
    );
  }


  return null;
};

export default EventQuestionaire;
