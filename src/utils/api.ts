import axios from "axios";
import { Ticket, User } from "../types"; // Ensure User type is defined

// Create an axios instance
export const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API functions
export const authAPI = {
  login: async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    return data;
  },

  register: async (name: string, email: string, password: string) => {
    const { data } = await api.post("/auth/register", {
      name,
      email,
      password,
    });
    return data;
  },

  getCurrentUser: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  },
};

// Tickets API functions
export const ticketsAPI = {
  getAll: async (filters = {}) => {
    const { data } = await api.get("/tickets", { params: filters });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/tickets/${id}`);
    return data;
  },

  create: async (
    ticketData: Partial<
      Omit<Ticket, "id" | "createdAt" | "updatedAt" | "comments">
    >
  ) => {
    const { data } = await api.post("/tickets", ticketData);
    return data;
  },

  update: async (id: string, ticketData: Partial<Ticket>) => {
    const { data } = await api.patch(`/tickets/${id}`, ticketData);
    return data;
  },

  addComment: async (ticketId: string, content: string) => {
    const { data } = await api.post(`/tickets/${ticketId}/comments`, {
      content,
    });
    return data;
  },

  assign: async (ticketId: string, agentId: string) => {
    const { data } = await api.patch(`/tickets/${ticketId}/assign`, {
      agentId,
    });
    return data;
  },
};

// Users API functions
export const usersAPI = {
  // Get all users [admin]
  getAllUsers: async () => {
    const { data } = await api.get("/users");
    return data;
  },

  // Get user by ID [admin]
  getUserById: async (id: string) => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  // Get all agents [admin]
  getAllAgents: async () => {
    const { data } = await api.get("/users/agents");
    return data;
  },

  // Edit user [user can update their info]
  editUser: async (userData: Partial<User>) => {
    const { data } = await api.patch("/users/me", userData);
    return data;
  },

  // Delete user [admin]
  deleteUser: async (id: string) => {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },

  // Create user [admin]
  createUser: async (userData: Partial<User>) => {
    const { data } = await api.post("/users/create", userData);
    return data;
  },
};

// Analytics API functions
export const analyticsAPI = {
  getDashboardMetrics: async () => {
    const { data } = await api.get("/tickets", { params: { analytics: true } });

    // Process the data to get metrics
    const totalTickets = data.length;
    const openTickets = data.filter((t: Ticket) => t.status === "open").length;
    const resolvedTickets = data.filter(
      (t: Ticket) => t.status === "resolved"
    ).length;

    // Calculate average resolution time
    const resolvedTicketsData = data.filter(
      (t: Ticket) => t.status === "resolved"
    );
    const totalResolutionTime = resolvedTicketsData.reduce(
      (acc: number, ticket: Ticket) => {
        const created = new Date(ticket.createdAt);
        const updated = new Date(ticket.updatedAt);
        return acc + (updated.getTime() - created.getTime()) / (1000 * 60 * 60); // Convert to hours
      },
      0
    );

    const averageResolutionTime =
      resolvedTicketsData.length > 0
        ? Math.round(totalResolutionTime / resolvedTicketsData.length)
        : 0;

    return {
      totalTickets,
      openTickets,
      resolvedTickets,
      averageResolutionTime,
    };
  },

  getTimelineData: async () => {
    const { data } = await api.get("/tickets");

    // Process the data to get timeline information
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split("T")[0];
    }).reverse();

    return last7Days.map((date) => {
      const dayTickets = data.filter((t: Ticket) =>
        t.createdAt.startsWith(date)
      );

      return {
        date,
        open: dayTickets.filter((t: Ticket) => t.status === "open").length,
        resolved: dayTickets.filter((t: Ticket) => t.status === "resolved")
          .length,
      };
    });
  },
};
