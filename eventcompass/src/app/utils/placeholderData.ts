import { Activity, ScheduleItem, Task } from "@/types/eventPlan";
const placeholder_name = `TEST EVENT ${new Date().toISOString()}`;

export const PLACEHOLDER_EVENT_PLAN = {
    name: placeholder_name,
    org: "Alzheimer's Awareness Group",
    description: "An intimate evening where students write heartfelt letters to nursing home residents while learning about Alzheimer's disease and memory care.",
    goals: ["Awareness/education", "Community bonding"],
    attendance: 60,
    location: "Thwing Atrium",
    start_date: new Date().toISOString().split("T")[0], // Current date in YYYY-MM-DD format
    end_date: new Date(new Date().setDate(new Date().getDate() + 1)) // Next day in YYYY-MM-DD format
      .toISOString()
      .split("T")[0],
    start_time: "09:00 AM", // Default start time
    end_time: "05:00 PM", // Default end time
    committee: null,
    budget: 500,
    keywords: ["alzheimer's", "awareness", "community", "letters"],
    activities: [
      { 
        name: "Check-in & Welcome", 
        description: "Greet attendees, distribute writing materials and name tags" 
      },
      { 
        name: "Educational Introduction", 
        description: "Guest speaker shares about Alzheimer's disease and the impact of letters on residents" 
      },
      { 
        name: "Letter Writing Session", 
        description: "Guided letter writing with prompts and examples provided at each table" 
      },
      { 
        name: "Reflection & Sharing", 
        description: "Optional sharing at reflection board with light refreshments" 
      },
      { 
        name: "Wrap-up & Clean-up", 
        description: "Collect letters, thank attendees, and coordinate cleanup" 
      }
    ],
    schedule: [
      { time: "6:00 PM", duration: 15, activityId: null, notes: "" },
      { time: "6:15 PM", duration: 20, activityId: null, notes: "" },
      { time: "6:35 PM", duration: 45, activityId: null, notes: "" },
      { time: "7:20 PM", duration: 20, activityId: null, notes: "" },
      { time: "7:40 PM", duration: 20, activityId: null, notes: "" }
    ],
    shopping: [
      { 
        item: "Stationery sets", 
        quantity: 60, 
        group: "Materials", 
        linkedTo: null, 
        purchased: false 
      },
      { 
        item: "Writing prompts cards", 
        quantity: 60, 
        group: "Materials", 
        linkedTo: null, 
        purchased: false 
      },
      { 
        item: "Tea & Coffee", 
        quantity: 60, 
        group: "Food", 
        linkedTo: null,
        purchased: false 
      },
      { 
        item: "Cookies", 
        quantity: 5, 
        group: "Food", 
        linkedTo: null, 
        purchased: false 
      },
      { 
        item: "Display boards", 
        quantity: 2, 
        group: "Equipment", 
        linkedTo: null, 
        purchased: false 
      },
      { 
        item: "Name tags", 
        quantity: 60, 
        group: "Materials", 
        linkedTo: null, 
        purchased: false 
      },
      { 
        item: "Envelopes", 
        quantity: 60, 
        group: "Materials", 
        linkedTo: null, 
        purchased: false 
      }
    ],
    tasks: [
      { 
        task: "Book guest speaker", 
        assignedTo: "", 
        deadline: "2025-10-03", 
        status: "pending", 
        linkedTo: null
      },
      { 
        task: "Order stationery supplies", 
        assignedTo: "", 
        deadline: "2025-10-03", 
        status: "pending", 
        linkedTo: null
      },
      { 
        task: "Create letter writing prompts", 
        assignedTo: "", 
        deadline: "2025-10-03", 
        status: "pending", 
        linkedTo: null
      },
      { 
        task: "Set up reflection board", 
        assignedTo: "", 
        deadline: "2025-10-03", 
        status: "pending", 
        linkedTo: null
      },
      { 
        task: "Coordinate with nursing home", 
        assignedTo: "", 
        deadline: "2025-10-03", 
        status: "pending", 
        linkedTo: null 
      },
      { 
        task: "Reserve venue", 
        assignedTo: "", 
        deadline: "2025-10-03", 
        status: "pending", 
        linkedTo: null 
      },
      { 
        task: "Purchase refreshments", 
        assignedTo: "", 
        deadline: "2025-10-03", 
        status: "pending", 
        linkedTo: null
      }
    ],
    budget_items: [
      { category: "Food & Beverages", estimated: 200, actual: 0 },
      { category: "Stationery & Materials", estimated: 150, actual: 0 },
      { category: "Guest Speaker", estimated: 0, actual: 0 },
      { category: "Decorations", estimated: 75, actual: 0 },
      { category: "Printing & Signage", estimated: 50, actual: 0 },
      { category: "Miscellaneous", estimated: 25, actual: 0 }
    ]
  };

  export const PLACEHOLDER_EVENT_BASICS = {
    name: "Memory Lane Letter Writing Night",
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
        activity_id: activities[0].id,
        location: "Grand Ballroom Foyer",
        notes: "Wine, beer, and light appetizers. Setup starts at 5:30 PM.",
    },
    {
        start_date: "2024-12-14",
        event_id: eventId,
        end_date: null,
        start_time: "18:30",
        end_time: "19:00",
        activity_id: activities[1].id,
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
        activity_id: activities[2].id,
        location: "Main Hall",
        notes: "Continues past midnight into Saturday. Cleanup crew scheduled.",
    },
];
      
export const generatePlaceholderTasks = (eventId: string, activities: Activity[]): Task[] => [
    // Placeholder Tasks Data
    {
      event_id: eventId,
      activity_id: activities[0].id,
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
      activity_id: activities[1].id,
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
  
  // Example usage in a component:
  /*
  const ExampleComponent = () => {
    const [tasks, setTasks] = useState<Task[]>(placeholderTasks);
    const [activities] = useState<Activity[]>(placeholderActivities);
    
    const addTask = () => {
      const newTask: Task = {
        event_id: "evt_123",
        activity_id: null,
        title: "",
        description: "",
        status: "todo",
        assignee_name: "",
        assignee_email: "",
        due_date: null,
        priority: "medium",
        notes: "",
        completed_at: null,
      };
      setTasks([...tasks, newTask]);
    };
  
    const updateTask = (index: number, field: string, value: any) => {
      const updated = [...tasks];
      updated[index] = { ...updated[index], [field]: value };
      
      // Auto-set completed_at when status changes to done
      if (field === "status" && value === "done" && !updated[index].completed_at) {
        updated[index].completed_at = new Date().toISOString();
      } else if (field === "status" && value !== "done") {
        updated[index].completed_at = null;
      }
      
      setTasks(updated);
    };
  
    const deleteTask = (index: number) => {
      setTasks(tasks.filter((_, i) => i !== index));
    };
  
    return (
      <TasksTab
        tasks={tasks}
        activities={activities}
        isReadOnly={false}
        addTask={addTask}
        updateTask={updateTask}
        deleteTask={deleteTask}
      />
    );
  };
  */
  