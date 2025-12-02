"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from 'react';
import StartScreen from './questionaire/StartScreen';
import IntakeForm from './questionaire/IntakeForm';
import ConceptsScreen from './questionaire/ConceptsScreen';
import PreviewScreen from './questionaire/PreviewScreen';

import { 
  PLACEHOLDER_EVENT_BASICS, 
  generatePlaceholderActivities, 
  generatePlaceholderScheduleItems, 
  generatePlaceholderTasks, 
  generatePlaceholderBudgetItems, 
  generatePlaceholderShoppingItems, 
  PLACEHOLDER_CONCEPTS
} from "@/app/utils/placeholderData";

import { IntakeFormData, Concept } from '@/types/eventPlan';

import { generateConceptsWithRetry } from "@/app/utils/conceptsGeneration";


// Main App Component
const EventQuestionaire = () => {
  const [step, setStep] = useState('start');
  const [selectedPath, setSelectedPath] = useState("");
  const [formData, setFormData] = useState({});
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [intakeFormData, setIntakeFormData] = useState<IntakeFormData>({
    organizationName: '',
    organizationMission: '',
    budgetRange: '',
    totalBudget: 0,
    expectedAttendance: 0,
    locationType: 'on-campus',
    venue: '',
    startDate: '',
    endDate: '',  // Optional for multi-day events
    
    // No-idea specific
    eventGoals: [],
    eventVibe: [],
    constraints: '',
    
    // Rough-idea specific
    eventType: '',
    roughIdea: '',
    duration: '',
    additionalContext: '',
    
    // Solid-idea specific
    eventName: '',
    eventDescription: '',
    keyActivities: '',
    startTime: '',
    endTime: '',
    specialRequirements: ''
  });
  const [selectedConcept, setSelectedConcept] = useState<Concept>(
    PLACEHOLDER_CONCEPTS[0]
  );
  const [isGenerating, setIsGenerating] = useState(false); // For concepts CHANGE TO isGeneratingConcepts
  const [customizations, setCustomizations] = useState({
      includeActivities: true,
      includeSchedule: true,
      includeShopping: true,
      includeTasks: true,
      includeBudget: true,
    });
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

  const paths = ["no-idea", "rough-idea", "solid-idea"];


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

  

  const handleStartPath = (path: string) => {
    setSelectedPath(path);
    setStep('intake');
  };

  const handleIntakeSubmit = async () => {
    if (!selectedPath) return;

      // Only generate concepts if the path is no idea or rough ideas
      if (selectedPath === 'no-idea' || selectedPath === 'rough-idea') {
        
        // 2. Show loading state
        setIsGenerating(true);
      
        try {
          // 3. Generate concepts (takes 10-20 seconds)
          const result = await generateConceptsWithRetry(intakeFormData, selectedPath);
      
          if (result.success && result.concepts) {
            // 4. Set concepts (loading will automatically hide)
            setConcepts(result.concepts);
            
          } else {
            // Handle error - go back to intake
            alert(`Failed to generate concepts: ${result.error}`);
            setStep('intake');
          }
        } catch (error) {
          console.error('Error:', error);
          alert('An error occurred. Please try again.');
          setStep('intake');
        } finally {
          // 5. Hide loading state
          setIsGenerating(false);
          setStep('concepts');
        }
      } else {
        // if solid-idea, head straight to event plan customization
        setStep('preview');
      }
  };

  const handleConceptSelect = (concept: Concept) => {
    setSelectedConcept(concept);
  };

  useEffect(() => {
    console.log("Selected Concept:", selectedConcept);
  }, [selectedConcept]);

  const handleConceptsSubmit = () => {
    setStep('preview');
  };

  const handleCreatePlan = () => {
    const plan = generateDetailedPlan();
    setEventPlan(plan);
    setStep('preview');
  };

  const toggleSection = (section) => {
    setKeepSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleGenerateClick = () => {
    proceedToEditor();
  }

  const proceedToEditor = async () => {
    try {

      console.log("Intake Form Data:", intakeFormData);
      console.log("Selected Concept:", selectedConcept);
      console.log("Customizations:", customizations);
      // Step 1: Generate the event plan using AI
      const generateResponse = await fetch("/api/event-gen/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intakeFormData,
          selectedConcept, // Will be undefined for solid-idea path
          customizations,
        }),
      });
  
      if (!generateResponse.ok) {
        const errorText = await generateResponse.text();
        console.error("Failed to generate plan:", errorText);
        throw new Error(`Failed to generate plan: ${errorText}`);
      }
  
      const { eventPlan } = await generateResponse.json();
      console.log("Generated event plan:", eventPlan);
  
      // Step 2: Create the event basics in the database
      const eventResponse = await fetch("/api/event-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventPlan.event_basics),
      });
  
      if (!eventResponse.ok) {
        const errorText = await eventResponse.text();
        console.error("Failed to create event:", errorText);
        throw new Error(`Failed to create event: ${errorText}`);
      }
      
      const { event } = await eventResponse.json();
      const eventId = event.id;
      console.log("Event created with ID:", eventId);
  
      // Mappings to track temp_id -> database_id relationships
      const activityIdMap = new Map<string, number>();
      const budgetIdMap = new Map<string, number>();
  
      // Step 3: Create activities (if included)
      if (customizations.includeActivities && eventPlan.activities.length > 0) {
        // Prepare activities for database insertion (remove temp_id, add event_id)
        const activitiesToInsert = eventPlan.activities.map((activity: any) => ({
          event_id: eventId,
          name: activity.name,
          description: activity.description,
          notes: activity.notes || "",
          staffing_needs: activity.staffing_needs || [],
        }));
  
        const activitiesResponse = await fetch(`/api/event-plans/${eventId}/activities`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(activitiesToInsert),
        });
  
        if (!activitiesResponse.ok) {
          const errorText = await activitiesResponse.text();
          console.error("Failed to add activities:", errorText);
          throw new Error(`Failed to add activities: ${errorText}`);
        }
  
        const insertedActivities = await activitiesResponse.json();
        console.log("Activities added:", insertedActivities);
  
        // Build mapping from temp_id to actual database ID
        eventPlan.activities.forEach((activity: any, index: number) => {
          activityIdMap.set(activity.temp_id, insertedActivities[index].id);
        });
      }
  
      // Step 4: Create budget items (if included)
      if (customizations.includeBudget && eventPlan.budget_items.length > 0) {
        const budgetItemsToInsert = eventPlan.budget_items.map((item: any) => ({
          event_id: eventId,
          category: item.category,
          allocated: item.allocated,
          description: item.description,
          spent: item.spent,
        }));
  
        const budgetResponse = await fetch(`/api/event-plans/${eventId}/budget`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(budgetItemsToInsert),
        });
  
        if (!budgetResponse.ok) {
          const errorText = await budgetResponse.text();
          console.error("Failed to add budget items:", errorText);
          throw new Error(`Failed to add budget items: ${errorText}`);
        }
  
        const insertedBudgetItems = await budgetResponse.json();
        console.log("Budget items added:", insertedBudgetItems);
  
        // Build mapping from temp_id to actual database ID
        eventPlan.budget_items.forEach((item: any, index: number) => {
          budgetIdMap.set(item.temp_id, insertedBudgetItems[index].id);
        });
      }
  
      // Step 5: Create schedule items (if included)
      if (customizations.includeSchedule && eventPlan.schedule_items.length > 0) {
        const scheduleItemsToInsert = eventPlan.schedule_items.map((item: any) => ({
          event_id: eventId,
          activity_id: item.activity_temp_id ? activityIdMap.get(item.activity_temp_id) || null : null,
          start_date: item.start_date,
          end_date: item.end_date,
          start_time: item.start_time,
          end_time: item.end_time,
          location: item.location,
          notes: item.notes,
        }));
  
        const scheduleResponse = await fetch(`/api/event-plans/${eventId}/schedule`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(scheduleItemsToInsert),
        });
  
        if (!scheduleResponse.ok) {
          const errorText = await scheduleResponse.text();
          console.error("Failed to add schedule:", errorText);
          throw new Error(`Failed to add schedule: ${errorText}`);
        }
  
        const schedule = await scheduleResponse.json();
        console.log("Schedule added:", schedule);
      }
  
      // Step 6: Create tasks (if included)
      if (customizations.includeTasks && eventPlan.tasks.length > 0) {
        const tasksToInsert = eventPlan.tasks.map((task: any) => ({
          event_id: eventId,
          activity_id: task.activity_temp_id ? activityIdMap.get(task.activity_temp_id) || null : null,
          title: task.title,
          description: task.description,
          status: task.status,
          assignee_name: task.assignee_name,
          assignee_email: task.assignee_email,
          due_date: task.due_date,
          priority: task.priority,
          notes: task.notes,
        }));
  
        const tasksResponse = await fetch(`/api/event-plans/${eventId}/tasks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(tasksToInsert),
        });
  
        if (!tasksResponse.ok) {
          const errorText = await tasksResponse.text();
          console.error("Failed to add tasks:", errorText);
          throw new Error(`Failed to add tasks: ${errorText}`);
        }
  
        const tasks = await tasksResponse.json();
        console.log("Tasks added:", tasks);
      }
  
      // Step 7: Create shopping items (if included)
      if (customizations.includeShopping && eventPlan.shopping_items.length > 0) {
        const shoppingItemsToInsert = eventPlan.shopping_items.map((item: any) => ({
          event_id: eventId,
          item: item.item,
          vendor: item.vendor,
          unit_cost: item.unit_cost,
          quantity: item.quantity,
          notes: item.notes,
          activity_id: item.activity_temp_id ? activityIdMap.get(item.activity_temp_id) || null : null,
          budget_id: item.budget_temp_id ? budgetIdMap.get(item.budget_temp_id) || null : null,
          link: item.link,
          status: item.status,
        }));
  
        const shoppingResponse = await fetch(`/api/event-plans/${eventId}/shopping`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(shoppingItemsToInsert),
        });
  
        if (!shoppingResponse.ok) {
          const errorText = await shoppingResponse.text();
          console.error("Failed to add shopping items:", errorText);
          throw new Error(`Failed to add shopping items: ${errorText}`);
        }
  
        const shopping = await shoppingResponse.json();
        console.log("Shopping items added:", shopping);
      }
  
      // Step 8: Navigate to the event editor page
      router.push(`/event-plans/${eventId}`);
    } catch (error) {
      console.error("Error creating event:", error);
      alert("An error occurred while creating the event. Please try again.");
    }
  };


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
        formData={intakeFormData}
        setFormData={setIntakeFormData}
        isLoading={isGenerating}
      />
    );
  }

  if (step === 'concepts') {
    return (
      <ConceptsScreen
        selectedPath={selectedPath}
        concepts={concepts}
        selectedConcept={selectedConcept}
        onSelectConcept={handleConceptSelect}
        onCreatePlan={handleCreatePlan}
        onBack={() => setStep('intake')}
        handleSubmit={handleConceptsSubmit}
      />
    );
  }

  if (step === 'preview' && selectedConcept) {
    return (
      <PreviewScreen
        selectedConcept={selectedConcept}
        customizations={customizations}
        setCustomizations={setCustomizations}
        onBack={() => setStep('concepts')}
        onGenerate={handleGenerateClick}
      />
    );
  }


  return null;
};

export default EventQuestionaire;
