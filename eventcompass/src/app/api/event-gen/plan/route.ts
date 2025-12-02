// app/api/generate-plan/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";


function parseBudget(budgetString: string): number | null {
    try {
      // Remove non-numeric characters except for the range separator (`-`)
      const cleanedBudget = budgetString.replace(/[^0-9\-]/g, "");
  
      // Check if it's a range (e.g., "1000-1200")
      if (cleanedBudget.includes("-")) {
        const [lower, upper] = cleanedBudget.split("-").map(Number);
  
        // Validate the numbers
        if (isNaN(lower) || isNaN(upper)) {
          console.error("Invalid budget range:", budgetString);
          return null;
        }
  
        // Return the average of the range
        return Math.round((lower + upper) / 2);
      }
  
      // If it's a single value, parse it as a number
      const parsedBudget = Number(cleanedBudget);
  
      // Validate the parsed number
      if (isNaN(parsedBudget)) {
        console.error("Invalid budget value:", budgetString);
        return null;
      }
  
      return parsedBudget;
    } catch (error) {
      console.error("Error parsing budget:", error, budgetString);
      return null;
    }
}

// Zod schemas for structured output
const StaffingNeedSchema = z.object({
  id: z.number(),
  count: z.number().nullable(),
  responsibility: z.string(),
});

const ActivitySchema = z.object({
  temp_id: z.string(), // Temporary ID for cross-referencing
  name: z.string(),
  description: z.string(),
  notes: z.string().nullable(),
  staffing_needs: z.array(StaffingNeedSchema).nullable(),
});

const ScheduleItemSchema = z.object({
  activity_temp_id: z.string().nullable(), // Reference to activity's temp_id
  start_date: z.string(),
  end_date: z.string().nullable(),
  start_time: z.string(),
  end_time: z.string(),
  location: z.string(),
  notes: z.string(),
});

const ShoppingItemSchema = z.object({
  item: z.string(),
  vendor: z.string(),
  unit_cost: z.number(),
  quantity: z.number(),
  notes: z.string(),
  activity_temp_id: z.string().nullable(),
  budget_temp_id: z.string().nullable(),
  link: z.string(),
  status: z.enum(['pending', 'ordered', 'received', 'cancelled']),
});

const TaskSchema = z.object({
  activity_temp_id: z.string().nullable(),
  title: z.string(),
  description: z.string(),
  status: z.enum(['todo', 'in_progress', 'blocked', 'done']),
  assignee_name: z.string(),
  assignee_email: z.string(),
  due_date: z.string().nullable(),
  priority: z.enum(['low', 'medium', 'high']),
  notes: z.string(),
});

const BudgetItemSchema = z.object({
  temp_id: z.string(), // Temporary ID for cross-referencing from shopping
  category: z.string(),
  allocated: z.number(),
  description: z.string(),
  spent: z.number(),
});

const EventBasicsSchema = z.object({
  name: z.string(),
  description: z.string(),
  keywords: z.array(z.string()),
  attendees: z.number(),
  start_date: z.string(),
  start_time: z.string(),
  end_date: z.string(),
  end_time: z.string(),
  budget: z.number(),
  location: z.string(),
  registration_required: z.boolean(),
  event_type: z.string().nullable(),
});

const EventPlanSchema = z.object({
  event_basics: EventBasicsSchema,
  activities: z.array(ActivitySchema),
  schedule_items: z.array(ScheduleItemSchema),
  shopping_items: z.array(ShoppingItemSchema),
  tasks: z.array(TaskSchema),
  budget_items: z.array(BudgetItemSchema),
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { intakeFormData, selectedConcept, customizations } = body;

    // Build the system prompt for the AI
    const systemPrompt = `You are an expert campus event planner. Generate comprehensive, realistic event plans that include:
- Detailed activities with clear descriptions and staffing needs
- A complete schedule with specific times and locations
- A realistic shopping list with vendors and pricing
- Actionable tasks with clear deadlines. Keep the assignee_name and assignee_email is empty strings.
- A detailed budget breakdown by category

Use temp_id fields (simple strings like "act1", "act2", "budget1", etc.) for activities and budget items so other sections can reference them.`;

    // Build the user prompt based on available data
    let userPrompt = "Generate a comprehensive event plan based on the following information:\n\n";
    
    // Add intake form data
    userPrompt += "=== INTAKE FORM ===\n";
    userPrompt += `Organization: ${intakeFormData.organizationName}\n`;
    if (intakeFormData.organizationMission) {
      userPrompt += `Mission: ${intakeFormData.organizationMission}\n`;
    }
    userPrompt += `Expected Attendance: ${intakeFormData.expectedAttendance}\n`;
    userPrompt += `Location Type: ${intakeFormData.locationType}\n`;
    if (intakeFormData.venue) {
      userPrompt += `Venue: ${intakeFormData.venue}\n`;
    }
    if (intakeFormData.startDate) {
      userPrompt += `Start Date: ${intakeFormData.startDate}\n`;
    }
    if (intakeFormData.endDate) {
      userPrompt += `End Date: ${intakeFormData.endDate}\n`;
    }
    if (intakeFormData.startTime) {
      userPrompt += `Start Time: ${intakeFormData.startTime}\n`;
    }
    if (intakeFormData.endTime) {
      userPrompt += `End Time: ${intakeFormData.endTime}\n`;
    }
    if (intakeFormData.totalBudget) {
      userPrompt += `Total Budget: $${intakeFormData.totalBudget}\n`;
    } else if (intakeFormData.budgetRange) {
      userPrompt += `Budget Range: ${intakeFormData.budgetRange}\n`;
    }

    // Add path-specific details
    if (intakeFormData.eventName && intakeFormData.eventDescription) {
      // Solid-idea path
      userPrompt += `\nEvent Name: ${intakeFormData.eventName}\n`;
      userPrompt += `Description: ${intakeFormData.eventDescription}\n`;
      if (intakeFormData.keyActivities) {
        userPrompt += `Key Activities: ${intakeFormData.keyActivities}\n`;
      }
      if (intakeFormData.specialRequirements) {
        userPrompt += `Special Requirements: ${intakeFormData.specialRequirements}\n`;
      }
    } else if (intakeFormData.eventType && intakeFormData.roughIdea) {
      // Rough-idea path
      userPrompt += `\nEvent Type: ${intakeFormData.eventType}\n`;
      userPrompt += `Rough Idea: ${intakeFormData.roughIdea}\n`;
      if (intakeFormData.duration) {
        userPrompt += `Duration: ${intakeFormData.duration}\n`;
      }
      if (intakeFormData.additionalContext) {
        userPrompt += `Additional Context: ${intakeFormData.additionalContext}\n`;
      }
    } else {
      // No-idea path
      if (intakeFormData.eventGoals) {
        userPrompt += `\nEvent Goals: ${intakeFormData.eventGoals.join(', ')}\n`;
      }
      if (intakeFormData.eventVibe) {
        userPrompt += `Event Vibe: ${intakeFormData.eventVibe.join(', ')}\n`;
      }
      if (intakeFormData.constraints) {
        userPrompt += `Constraints: ${intakeFormData.constraints}\n`;
      }
    }

    // Add concept if available (for no-idea and rough-idea paths)
    if (selectedConcept) {
      userPrompt += "\n=== SELECTED CONCEPT ===\n";
      userPrompt += `Title: ${selectedConcept.title}\n`;
      userPrompt += `Tagline: ${selectedConcept.tagline}\n`;
      userPrompt += `Goal: ${selectedConcept.goal}\n`;
      userPrompt += `Description: ${selectedConcept.description}\n`;
      userPrompt += `Budget: ${selectedConcept.budget}\n`;
      userPrompt += `Duration: ${selectedConcept.duration}\n`;
      userPrompt += `Attendance: ${selectedConcept.attendance}\n`;
      userPrompt += `Venue: ${selectedConcept.venue}\n`;
      userPrompt += `Vibe: ${selectedConcept.vibe}\n`;
      userPrompt += `Key Elements: ${selectedConcept.elements.join(', ')}\n`;

     
        // Parse the budget correctly
        const parsedBudget = parseBudget(selectedConcept.budget);
        if (parsedBudget !== null) {
          userPrompt += `Budget: ${parsedBudget}\n`;
        } else {
          console.error("Failed to parse budget:", selectedConcept.budget);
          userPrompt += `Budget: Invalid\n`;
        }
      
      
      if (selectedConcept.preview) {
        userPrompt += "\nPreview Activities:\n";
        selectedConcept.preview.activities.forEach((act: string) => {
          userPrompt += `- ${act}\n`;
        });
      }
    }

    // Add customization instructions
    userPrompt += "\n=== SECTIONS TO INCLUDE ===\n";
    userPrompt += `Activities: ${customizations.includeActivities ? 'YES' : 'NO (return empty array)'}\n`;
    userPrompt += `Schedule: ${customizations.includeSchedule ? 'YES' : 'NO (return empty array)'}\n`;
    userPrompt += `Shopping: ${customizations.includeShopping ? 'YES' : 'NO (return empty array)'}\n`;
    userPrompt += `Tasks: ${customizations.includeTasks ? 'YES' : 'NO (return empty array)'}\n`;
    userPrompt += `Budget: ${customizations.includeBudget ? 'YES' : 'NO (return empty array)'}\n`;

    userPrompt += "\n=== INSTRUCTIONS ===\n";
    userPrompt += "1. Create realistic, actionable event plans\n";
    userPrompt += "2. Use temp_id (e.g., 'act1', 'act2') for activities and budget items\n";
    userPrompt += "3. Link schedule items to activities using activity_temp_id\n";
    userPrompt += "4. Link shopping items to activities and budget using activity_temp_id and budget_temp_id\n";
    userPrompt += "5. Link tasks to activities using activity_temp_id\n";
    userPrompt += "6. Use realistic vendor names, prices, and staffing numbers. Keep the shopping item links to empty string. \n";
    userPrompt += "7. Create a comprehensive event timeline with specific times\n";
    userPrompt += "8. Ensure that the fields for link in shopping_items and assignee_name and assignee_email are empty strings for the users to fill out.\n";
    userPrompt += "9. Keep the venue location name as it is if it was ever provided.\n";
    userPrompt += "10. Quantity for shopping items must be greater than or equal to 1 (even if it is free, in which case the unit_cost is 0).\n";
    userPrompt += "11. For schedule items, make sure that end_date is an empty string if it is not a multi day range.\n";
    

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      response_format: zodResponseFormat(EventPlanSchema, "event_plan"),
    });

    if (!completion.choices[0].message.content) {
      throw new Error("Completion content is null or undefined");
    }
    const eventPlan = EventPlanSchema.parse(JSON.parse(completion.choices[0].message.content));

    if (!eventPlan) {
      throw new Error("Failed to parse event plan from OpenAI response");
    }

    return NextResponse.json({ eventPlan });
  } catch (error) {
    console.error("Error generating event plan:", error);
    return NextResponse.json(
      { error: "Failed to generate event plan", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}