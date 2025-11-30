export interface EventPlan {
    id: string;
    
    event_basics: EventBasics;
    // Subsections of the event plan
    activities: Activity[];
    schedule_items: ScheduleItem[];
    shopping_items: ShoppingItem[];
    tasks: Task[];
    budget_items: BudgetItem[];
  }

  export interface EventBasics {
    name: string;
    description: string;
    keywords: string[]; // Array of keywords/tags
    attendees: number;
    start_date: string; // ISO date string (e.g., "2023-10-05")
    start_time: string; // Time string (e.g., "09:00 AM")
    end_date: string; // ISO date string (e.g., "2023-10-06")
    end_time: string; // Time string (e.g., "05:00 PM")
    budget: number; // Total budget
    location: string;
    registration_required: boolean;
    event_type: string;
  }
  
  // Define smaller types for each subsection
  export interface Activity {
    id: number;
    name: string;
    description: string;
  }
  
  export interface ScheduleItem {
    time: string; // Time string (e.g., "6:00 PM")
    duration: number; // Duration in minutes
    activityId: number | null; // ID of the linked activity
    notes: string;
  }
  
  export interface ShoppingItem {
    id: number;
    item: string;
    quantity: string; // Quantity as a string (e.g., "60", "5 boxes")
    category: string; // Category of the item (e.g., "Materials", "Food")
    linkedTo: string | null; // Linked activity ID or null
    purchased: boolean; // Whether the item has been purchased
  }
  
  export interface Task {
    id: number;
    task: string;
    assignedTo: string; // Name of the person assigned
    deadline: string; // Deadline as a string (e.g., "2025-11-25")
    status: string; // Status of the task (e.g., "pending", "completed")
    linkedTo: string | null; // Linked activity ID or null
  }
  
  export interface BudgetItem {
    category: string; // Budget category (e.g., "Food & Beverages")
    estimated: number; // Estimated cost
    actual: number; // Actual cost
  }