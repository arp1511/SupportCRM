import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor to automatically attach JWT token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to format errors uniformly
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = "An unexpected error occurred.";
    if (error.response) {
      // The server responded with a status code outside the 2xx range
      errorMessage = error.response.data?.error || error.response.data?.message || errorMessage;
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = "Server is unreachable. Please check if the backend is running.";
    } else {
      // Something happened in setting up the request
      errorMessage = error.message;
    }
    return Promise.reject(new Error(errorMessage));
  }
);

export const ticketsApi = {
  getTickets: async (params = {}) => {
    // params can contain: status, search
    const response = await apiClient.get("/api/tickets", { params });
    return response.data;
  },
  getTicket: async (ticketId) => {
    const response = await apiClient.get(`/api/tickets/${ticketId}`);
    return response.data;
  },
  createTicket: async (ticketData) => {
    // ticketData: customer_name, customer_email, subject, description
    const response = await apiClient.post("/api/tickets", ticketData);
    return response.data;
  },
  updateTicket: async (ticketId, updateData) => {
    // updateData: status, note_text (optional)
    const response = await apiClient.put(`/api/tickets/${ticketId}`, updateData);
    return response.data;
  },
  addNote: async (ticketId, noteData) => {
    // noteData: note_text
    const response = await apiClient.post(`/api/tickets/${ticketId}/notes`, noteData);
    return response.data;
  },
  getDashboard: async () => {
    const response = await apiClient.get("/api/dashboard");
    return response.data;
  },
  aiCategorize: async (ticketId) => {
    const response = await apiClient.post(`/api/tickets/${ticketId}/ai-categorize`);
    return response.data;
  },
  aiSummarize: async (ticketId) => {
    const response = await apiClient.post(`/api/tickets/${ticketId}/ai-summarize`);
    return response.data;
  },
};

export const authApi = {
  signup: async (signupData) => {
    const response = await apiClient.post("/api/auth/signup", signupData);
    return response.data;
  },
  login: async (loginData) => {
    const response = await apiClient.post("/api/auth/login", loginData);
    return response.data;
  },
  getMe: async () => {
    const response = await apiClient.get("/api/auth/me");
    return response.data;
  },
};

export default apiClient;
