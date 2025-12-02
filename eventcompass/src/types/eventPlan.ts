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
    event_type: string | null;
}

// Define smaller types for each subsection
export interface Activity {
    id?: number;
    event_id: string;
    name: string;
    description: string;
    notes?: string;
    staffing_needs?: StaffingNeed[];
    // created_at: string;
    // schedule_item_ids: number[] | null; // Array of linked schedule item IDs
    // shopping_item_ids: number[] | null; // Array of linked shopping item IDs
}

export interface StaffingNeed {
    id: number;
    count: number | null;
    responsibility: string;
  }

export interface ScheduleItem {
    event_id: string;
    activity_id: number | null; // Linked activity ID or null
    start_date: string;
    end_date: string | null;
    start_time: string;
    end_time: string;
    location: string;
    notes: string;
}

export interface ShoppingItem {
    id?: number;
    event_id: string;
    item: string;
    vendor: string;
    unit_cost: number;
    quantity: number;
    notes: string;
    activity_id: number | null; // Linked activity ID or null
    link: string;
    budget_id: number | null; // Linked budget item ID
    status: 'pending' | 'ordered' | 'received' | 'cancelled';
}

export interface Task {
    id?: number;
    event_id: string;
    activity_id: number | null;
    title: string;
    description: string;
    status: 'todo' | 'in_progress' | 'blocked' | 'done';
    assignee_name: string;
    assignee_email: string;
    due_date: string | null;
    priority: 'low' | 'medium' | 'high';
    notes: string;
    completed_at?: string | null;
}

export interface BudgetItem {
    id?: number;
    event_id: string;
    category: string; // Budget category (e.g., "Food & Beverages") -> linked to shopping
    allocated: number; // Allocated budget
    description: string; // Description of the budget category
    spent: number; // Amount spent per category
}