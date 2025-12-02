"use client";

import { Activity, ScheduleItem, Task, BudgetItem, ShoppingItem } from "@/types/eventPlan";
const placeholder_name = `TEST EVENT ${new Date().toISOString()}`;

export const PLACEHOLDER_EVENT_BASICS = {
    name: "RANDOM NAME",
    description: "An intimate evening where students write heartfelt letters to nursing home residents while learning about Alzheimer's disease and memory care.",
    attendees: 60,
    start_date: "2023-10-05", // ISO date string (e.g., "2023-10-05")
    start_time: "9:00 AM", // Time string (e.g., "09:00 AM")
    end_date: "2023-10-05", // ISO date string (e.g., "2023-10-06")
    end_time: "10:00 AM", // Time string (e.g., "05:00 PM")
    budget: 500, // Total budget
    location: "Thwing Atrium",
    registration_required: true,
    event_type: "Social",
    keywords: ["Community", "Awareness", "Social"]
}


  // Function to generate placeholder activities with dynamic input
export const generatePlaceholderActivities = (eventId: string): Activity[] => [
    {
      id: 11,
      event_id: eventId, // Dynamically set event_id
      name: "Library Orientation",
      description: "Brief introduction to library resources and services",
      notes: "Meet at library entrance. 30-minute session covering catalog system, study spaces, and research help.",
      staffing_needs: [
        { id: 1, count: 1, responsibility: "Librarian presenter" },
      ],
    },
    {
      id: 12,
      event_id: eventId, // Dynamically set event_id
      name: "ID Card Distribution",
      description: "Students receive their official university ID cards",
      notes: "Photo station set up. Students must bring photo ID. Cards printed on-site.",
      staffing_needs: [
        { id: 1, count: 2, responsibility: "Card office staff" },
        { id: 2, count: 1, responsibility: "Photo technician" },
      ],
    },
    {
      id: 13,
      event_id: eventId, // Dynamically set event_id
      name: "Campus Tour",
      description: "Guided tour of the campus highlighting key buildings and facilities",
      notes: "Tour groups will depart every 15 minutes from the main entrance.",
      staffing_needs: [
        { id: 1, count: 3, responsibility: "Tour guides" },
      ],
    },
];

export const generatePlaceholderScheduleItems = (eventId: string, activities: Activity[]): ScheduleItem[] => [
    // Friday, December 14, 2024 - Main Event Day
    {
        start_date: "2024-12-14",
        event_id: eventId,
        end_date: null,
        start_time: "18:00",
        end_time: "19:00",
        activity_id: activities[0]?.id ?? null,
        location: "Grand Ballroom Foyer",
        notes: "Wine, beer, and light appetizers. Setup starts at 5:30 PM.",
    },
    {
        start_date: "2024-12-14",
        event_id: eventId,
        end_date: null,
        start_time: "18:30",
        end_time: "19:00",
        activity_id: activities[1].id ?? null,
        location: "Main Entrance",
        notes: "Have name badges and programs ready",
    },
    // Multi-day activity spanning overnight
    {
        start_date: "2024-12-14",
        end_date: "2024-12-15",
        event_id: eventId,
        start_time: "23:00",
        end_time: "02:00",
        activity_id: activities[2].id ?? null,
        location: "Main Hall",
        notes: "Continues past midnight into Saturday. Cleanup crew scheduled.",
    },
];
      
export const generatePlaceholderTasks = (eventId: string, activities: Activity[]): Task[] => [
    // Placeholder Tasks Data
    {
      event_id: eventId,
      activity_id: activities[0].id ?? null,
      title: "Coordinate with photographer",
      description: "Book professional photographer for cocktail hour. Need someone experienced with event photography and comfortable working in dimly lit environments.",
      status: "in_progress" as const,
      assignee_name: "Emily Lee",
      assignee_email: "emily.lee@example.com",
      due_date: "2024-12-05T10:20:00Z",
      priority: "medium" as const,
      notes: "Nov 25: Contacted three photographers. Waiting on quotes from two of them. Sarah Photography responded with $800 quote.",
      completed_at: null,
    },    
    {
      event_id: eventId,
      activity_id: null,
      title: "Send invitations to scholarship recipients",
      description: "Send formal invitations to all 15 scholarship recipients and their families (2 guests each). Include RSVP deadline of Nov 15 and dietary restriction form.",
      status: "done" as const,
      assignee_name: "Sarah Miller",
      assignee_email: "sarah.m@example.com",
      due_date: "2024-11-10T10:20:00Z",
      priority: "high" as const,
      notes: "Sent via email on Nov 8. All 15 recipients confirmed attendance. 12 vegetarian, 3 gluten-free requests received.",
      completed_at: "2024-11-08T10:20:00Z",
    },
    {
      event_id: eventId,
      activity_id: activities[1].id ?? null,
      title: "Finalize program booklet",
      description: "Design and finalize program booklet with event schedule, scholarship recipient bios, donor recognition, and speaker information. Need 210 copies printed.",
      status: "blocked" as const,
      assignee_name: "John Davis",
      assignee_email: "john.davis@example.com",
      due_date: "2024-11-30T10:20:00Z",
      priority: "high" as const,
      notes: "Nov 26: Design is 90% complete. BLOCKED: Still waiting on keynote speaker bio and headshot. Can't finalize until we have this.",
      completed_at: null,
    },
  ];
  
export const generatePlaceholderBudgetItems = (eventId: string,): BudgetItem[] => [
    {
        event_id: eventId,
        category: "Catering",
        allocated: 3000,
        description: "Initial quote received from Gourmet Catering for $3200. Negotiating for a better price.",
        spent: 0
    },
    {
        event_id: eventId,
        category: "Venue Rental",
        allocated: 3000,
        description: "Deposit of $500 paid. Remaining balance due one week before event.",
        spent: 0
    },
    {
        event_id: eventId,
        category: "Photography",
        allocated: 800,
        description: "Waiting on final quote from preferred photographer.",
        spent: 0
    }
];
  
export const generatePlaceholderShoppingItems = (eventId: string, activities: Activity[], budgetItems: BudgetItem[]): ShoppingItem[] => [
    {
        event_id: eventId,
        item: "Champagne Bottles",
        vendor: "Fine Wines Co.",
        unit_cost: 10.99,
        quantity: 10,
        notes: "Must be sparkling",
        activity_id: activities[0].id ?? null,
        link: "https://www.walgreens.com/store/c/cooks-california-champagne-brut-white-sparkling-wine/ID=prod6084901-product",
        budget_id: budgetItems[0]?.id ?? null, // Linked budget item ID
        status: 'pending',
    },
    {
        event_id: eventId,
        item: "Appetizer Platters",
        vendor: "Gourmet Catering Supplies",
        unit_cost: 50.14,
        quantity: 4,
        notes: "Vegetarian options included",
        activity_id: activities[1].id ?? null,
        link: "https://www.gourmetcateringsupplies.com/appetizer-platters",
        budget_id: budgetItems[0]?.id ?? null, // Linked budget item ID
        status: 'ordered',
    }
];