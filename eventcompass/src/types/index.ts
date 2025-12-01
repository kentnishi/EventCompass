export type EventSummary = {
    id: number;
    title: string;
    startTime: string; // ISO
};


export type PreferencesPayload = {
    popularDays: { day: string; count: number }[];
    popularTimes: { time: string; score: number }[];
    vendors: { name: string; rating: number }[];
    themes: string[];
};


export type LastEventPayload = {
    event: {
    id: number;
    title: string;
    when: string;
    where: string;
    };
    stats: { total: number; attended: number; walkins: number; noshow: number; pct: number };
    feedback: { pro: string; con: string };
};

export interface Activity {
    id: string;
    name: string;
    description: string;
  }
  
  export interface ScheduleItem {
    id: string;
    time: string;
    duration: string;
    activityId: string | null;
    notes: string;
  }
  
  export interface ShoppingItem {
    id: string;
    item: string;
    quantity: string;
    category: string;
    linkedTo: string | null;
    purchased: boolean;
  }
  
  export interface Task {
    id: string;
    task: string;
    assignedTo: string;
    deadline: string;
    status: 'pending' | 'in-progress' | 'completed';
    linkedTo: string | null;
  }
  
  export interface BudgetItem {
    id: string;
    category: string;
    estimated: number;
    actual: number;
  }
  
  export interface EventPlan {
    id: string;
    userId: string;
    name: string;
    description: string;
    organization: string;
    date: string;
    attendance: number;
    goals: string[];
    status: EventStatus;
    activities: Activity[];
    schedule: ScheduleItem[];
    shopping: ShoppingItem[];
    tasks: Task[];
    budget: BudgetItem[];
    createdAt: Date;
    updatedAt: Date;
  }
  
  export type EventStatus = 'planning'