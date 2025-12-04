// app/api/event-gen/concepts/route.ts

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { IntakeFormData, Concept } from '@/types/eventPlan';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});



// Define the schema for structured outputs
const conceptSchema = {
  type: "object",
  properties: {
    concepts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string", description: "Catchy, memorable event name" },
          tagline: { type: "string", description: "One-line description capturing the essence" },
          goal: { type: "string", description: "Primary goal (e.g., 'Awareness + Community')" },
          description: { type: "string", description: "2-3 sentence detailed description" },
          budget: { type: "string", description: "Budget indicator ($, $$, $$$)" },
          estimatedBudget: { type: "string", description: "Budget range (e.g., '$400-500')" },
          duration: { type: "string", description: "Event duration (e.g., '2 hours')" },
          attendance: { type: "string", description: "Expected attendance (e.g., '50-75 people')" },
          venue: { type: "string", description: "Venue type/requirement" },
          vibe: { type: "string", description: "Event atmosphere/feeling" },
          elements: {
            type: "array",
            items: { type: "string" },
            description: "4-6 key elements or components"
          },
          preview: {
            type: "object",
            properties: {
              activities: {
                type: "array",
                items: { type: "string" },
                description: "4-5 main activities"
              },
              schedule: {
                type: "string",
                description: "Suggested time range (e.g., '6:00 PM - 8:00 PM')"
              },
              keyItems: {
                type: "array",
                items: { type: "string" },
                description: "3-4 essential shopping/supply items"
              },
              tasks: {
                type: "array",
                items: { type: "string" },
                description: "3-4 key preparation tasks"
              }
            },
            required: ["activities", "schedule", "keyItems", "tasks"],
            additionalProperties: false
          }
        },
        required: [
          "title", "tagline", "goal", "description", "budget", "estimatedBudget",
          "duration", "attendance", "venue", "vibe", "elements", "preview"
        ],
        additionalProperties: false
      }
    }
  },
  required: ["concepts"],
  additionalProperties: false
};

function buildPrompt(data: IntakeFormData, path: string): string {
  const dateRange = data.endDate 
    ? `${data.startDate} to ${data.endDate}` 
    : data.startDate || 'Flexible';

  if (path === 'no-idea') {
    return `You are an experienced campus event planner helping brainstorm creative event ideas.

ORGANIZATION:
- Name: ${data.organizationName}
- Mission: ${data.organizationMission || 'Not specified'}

EVENT REQUIREMENTS:
- Goals: ${data.eventGoals?.join(', ') || 'Not specified'}
- Desired Vibe: ${data.eventVibe?.join(', ') || 'Not specified'}
- Preferred Date: ${dateRange}
- Location: ${data.locationType} ${data.venue ? `(Preferred: ${data.venue})` : ''}
- Budget: ${data.budgetRange}
- Expected Attendance: ${data.expectedAttendance} people
- Constraints: ${data.constraints || 'None specified'}

Generate 3-5 creative, feasible event concepts for a campus environment. Each concept should:
- Be realistic and achievable within the budget
- Align with the organization's goals and desired vibe
- Consider accessibility and inclusivity
- Include specific, actionable elements

For each concept, provide:
- A catchy title that captures attention
- A compelling tagline
- Clear goal alignment (e.g., "Fundraising + Awareness")
- Detailed description (2-3 sentences)
- Budget indicators (use $ for under $500, $$ for $500-$1500, $$$ for $1500+)
- Estimated budget range that fits within the specified budget
- Realistic duration
- Expected attendance range
- Venue requirements
- Event vibe/atmosphere
- 4-6 key elements or components
- Preview with specific activities, schedule, key items, and tasks`;
  }

  if (path === 'rough-idea') {
    return `You are an experienced campus event planner helping refine a rough event concept.

ORGANIZATION:
- Name: ${data.organizationName}
- Mission: ${data.organizationMission || 'Not specified'}

ROUGH IDEA:
${data.roughIdea}

EVENT DETAILS:
- Event Type: ${data.eventType || 'Not specified'}
- Goals: ${data.eventGoals?.join(', ') || 'Not specified'}
- Date: ${dateRange}
- Duration: ${data.duration}
- Location: ${data.locationType} ${data.venue ? `at ${data.venue}` : ''}
- Budget: ${data.budgetRange}
- Expected Attendance: ${data.expectedAttendance} people
- Additional Context: ${data.additionalContext || 'None'}

Generate 2-3 refined variations of this concept, each taking a different approach or focus. Each variation should:
- Expand on the rough idea with specific details
- Provide a logical event flow
- Identify necessary resources
- Suggest interactive or engaging elements
- Consider practical logistics

For each concept, provide complete details including title, tagline, goals, description, budget, duration, attendance, venue, vibe, elements, and preview.`;
  }

  // solid-idea path
  return `You are an experienced campus event planner creating execution-ready concept variations.

ORGANIZATION:
- Name: ${data.organizationName}

EVENT OVERVIEW:
- Name: ${data.eventName}
- Description: ${data.eventDescription}
- Key Components: ${data.keyActivities}

LOGISTICS:
- Date: ${dateRange}
- Time: ${data.startTime} - ${data.endTime}
- Venue: ${data.venue} (${data.locationType})
- Budget: $${data.totalBudget}
- Expected Attendance: ${data.expectedAttendance} people
- Special Requirements: ${data.specialRequirements || 'None'}

Generate 2-3 polished concept variations that build on this solid foundation. Each should offer a different approach or enhancement while staying true to the core idea.

For each concept, provide complete details including title, tagline, goals, description, budget breakdown, duration, attendance, venue details, vibe, key elements, and comprehensive preview with activities, schedule, essential items, and preparation tasks.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { intakeFormData, path } = body as { 
      intakeFormData: IntakeFormData; 
      path: 'no-idea' | 'rough-idea' | 'solid-idea' 
    };

    if (!intakeFormData || !path) {
      return NextResponse.json(
        { error: 'Missing required fields: intakeFormData and path' },
        { status: 400 }
      );
    }

    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const prompt = buildPrompt(intakeFormData, path);

    // Use structured outputs to ensure valid Concept[] response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06", // Model that supports structured outputs
      messages: [
        {
          role: "system",
          content: "You are an expert campus event planner who creates detailed, creative, and feasible event concepts."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "event_concepts",
          strict: true,
          schema: conceptSchema
        }
      },
      temperature: 0.8, // Higher temperature for more creative concepts
    });

    const responseContent = completion.choices[0].message.content;
    
    if (!responseContent) {
      throw new Error('No response from OpenAI');
    }

    const parsedResponse = JSON.parse(responseContent);
    const concepts: Concept[] = parsedResponse.concepts;

    // Add IDs to concepts
    const conceptsWithIds = concepts.map((concept, index) => ({
      id: index + 1,
      ...concept
    }));

    return NextResponse.json({
      success: true,
      concepts: conceptsWithIds,
      path
    });

  } catch (error) {
    console.error('Error generating concepts:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate concepts',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}