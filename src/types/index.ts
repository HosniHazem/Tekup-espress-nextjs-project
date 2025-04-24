export type User = {
  _id: string;
  name: string;
  email: string;
  role: "user" | "agent" | "admin";
  createdAt: string;
};

export type Ticket = {
  _id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  assignedToId?: string;
  assignedTo?: User;
  comments: Comment[];
};

export type Comment = {
  _id: string;
  content: string;
  createdAt: string;
  userId: string;
  userName: string;
  isStaff: boolean;
};

export type TicketFilters = {
  status?: string;
  priority?: string;
  category?: string;
  searchQuery?: string;
};

export type DashboardMetrics = {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  averageResolutionTime: number;
};

export type TimelineData = {
  date: string;
  open: number;
  resolved: number;
};
