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
    createdAt: new Date().toISOString(),

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
  const [isCreatingPlan, setIsCreatingPlan] = useState(false); // For plan creation
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
      console.log("Intake Form Data: ", intakeFormData);

      try {
        // Generate concepts (takes 10-20 seconds)
        const result = await generateConceptsWithRetry(intakeFormData, selectedPath);

        if (result.success && result.concepts) {
          // Set concepts (loading will automatically hide)
          setConcepts(result.concepts);
          setSelectedConcept(result.concepts[0]); // by default, connect to first selectedConcept

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
    if (isCreatingPlan) return;
    setIsCreatingPlan(true);
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
          selectedConcept: selectedPath === 'solid-idea' ? undefined : selectedConcept, // Will be undefined for solid-idea path
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

      if (!eventId) {
        throw new Error("Event ID is missing from response");
      }

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
      console.log("Navigating to:", `/event-plans/${eventId}`);
      router.push(`/event-plans/${eventId}`);
    } catch (error) {
      console.error("Error creating event:", error);
      alert("An error occurred while creating the event. Please try again.");
      setIsCreatingPlan(false);
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
        isGenerating={isCreatingPlan}
      />
    );
  }


  return null;
};

export default EventQuestionaire;
