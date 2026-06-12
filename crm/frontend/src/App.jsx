import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import TicketsList from "./pages/TicketsList";
import CreateTicket from "./pages/CreateTicket";
import TicketDetails from "./pages/TicketDetails";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Route guard for authenticated users
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Route guard for Admin/Support Agent users
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/tickets" replace />;
  }

  return children;
};

// Conditional landing page based on authentication and role
const HomeRedirect = () => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return isAdmin ? <Dashboard /> : <Navigate to="/tickets" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
              {/* Sidebar/Navigation */}
              <Navbar />

              {/* Main Content Area */}
              <div className="flex-1 md:pl-64 min-w-0 flex flex-col">
                <main className="flex-1 max-w-[1550px] w-full mx-auto px-6 sm:px-8 lg:px-12 py-8 mb-16 md:mb-0">
                  <Routes>
                    {/* Guest Authentication Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    {/* Root landing redirection */}
                    <Route path="/" element={<HomeRedirect />} />

                    {/* Protected Common Routes */}
                    <Route
                      path="/tickets"
                      element={
                        <ProtectedRoute>
                          <TicketsList />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/tickets/:ticketId"
                      element={
                        <ProtectedRoute>
                          <TicketDetails />
                        </ProtectedRoute>
                      }
                    />

                    {/* Public route for submitting guest or customer support tickets */}
                    <Route path="/tickets/create" element={<CreateTicket />} />

                    {/* Fallback redirection */}
                    <Route path="*" element={<HomeRedirect />} />
                  </Routes>
                </main>
              </div>
            </div>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
