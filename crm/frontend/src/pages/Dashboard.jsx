import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ticketsApi } from "../api/client";
import { SkeletonDashboard } from "../components/LoadingSpinner";
import ErrorDisplay from "../components/ErrorDisplay";
import { 
  Inbox, 
  Hourglass, 
  CheckCircle, 
  FileText, 
  StickyNote, 
  ArrowUpRight, 
  Plus,
  Clock
} from "lucide-react";

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sumData, ticketsData] = await Promise.all([
        ticketsApi.getDashboard(),
        ticketsApi.getTickets()
      ]);
      setSummary(sumData);
      setRecentTickets(ticketsData.slice(0, 5)); // Keep top 5 latest
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <SkeletonDashboard />;
  if (error) return <ErrorDisplay message={error} onRetry={fetchDashboardData} />;

  const statCards = [
    { label: "Total Tickets", value: summary.total_tickets, icon: Inbox, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
    { label: "Open Tickets", value: summary.open_tickets, icon: Hourglass, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
    { label: "In Progress", value: summary.in_progress_tickets, icon: Clock, color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
    { label: "Closed", value: summary.closed_tickets, icon: CheckCircle, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
    { label: "Internal Notes", value: summary.total_notes, icon: StickyNote, color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white my-0">
            Operations Center
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-semibold mt-2">
            Real-time activity summary for support inquiries.
          </p>
        </div>
        <Link
          to="/tickets/create"
          className="neo-btn-primary h-12 text-base font-black"
        >
          <Plus className="w-5 h-5" />
          New Ticket
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={i} 
              className="neo-card-interactive p-6 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-black text-slate-700 dark:text-slate-300">{stat.label}</span>
                <span className={`p-2.5 rounded-xl border-2 border-slate-900 dark:border-white shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#fff] ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-6">
                <span className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-none">
                  {stat.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Tickets List */}
        <div className="lg:col-span-2 neo-card p-8 space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white my-0">Recent Tickets</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">Most recently created service inquiries.</p>
            </div>
            <Link 
              to="/tickets" 
              className="flex items-center gap-1 text-base font-black text-violet-600 dark:text-violet-400 hover:text-violet-750 dark:hover:text-violet-300 transition-colors underline decoration-2 decoration-violet-500/20 hover:decoration-violet-500"
            >
              View all
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>

          {recentTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-900 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20">
              <p className="text-base text-slate-500 dark:text-slate-400 font-bold">No tickets found</p>
              <Link to="/tickets/create" className="text-sm font-black text-violet-600 dark:text-violet-400 hover:underline mt-2">
                Create one now
              </Link>
            </div>
          ) : (
            <div className="divide-y-2 divide-slate-900 dark:divide-slate-800">
              {recentTickets.map((ticket) => (
                <Link
                  key={ticket.ticket_id}
                  to={`/tickets/${ticket.ticket_id}`}
                  className="flex items-center justify-between py-5 first:pt-0 last:pb-0 hover:bg-violet-50/50 dark:hover:bg-slate-950/20 px-3 rounded-xl transition-colors group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono font-black text-slate-400 dark:text-slate-500">{ticket.ticket_id}</span>
                      <span className="text-base lg:text-lg font-black text-slate-950 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                        {ticket.subject}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-550 dark:text-slate-400 font-semibold">
                      <span className="font-extrabold">{ticket.customer_name}</span>
                      <span>•</span>
                      <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div>
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-black uppercase border-2 border-slate-900 dark:border-white shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#fff] ${
                        ticket.status === "Open"
                          ? "bg-amber-100 text-amber-900"
                          : ticket.status === "In Progress"
                          ? "bg-purple-100 text-purple-900"
                          : "bg-emerald-100 text-emerald-900"
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Tips or Overview Box */}
        <div className="neo-card p-8 space-y-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white my-0">Getting Started</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">Quick operational hints.</p>
          </div>
          
          <div className="space-y-6 text-base leading-relaxed text-slate-700 dark:text-slate-300">
            <div className="p-5 bg-amber-50 dark:bg-amber-950/20 border-2 border-slate-900 dark:border-white rounded-xl shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#fff]">
              <span className="font-black text-slate-950 dark:text-white block text-base mb-2">Status Workflows</span>
              <span className="font-medium">Transition tickets from <b>Open</b> to <b>In Progress</b> once assignment begins, then mark them <b>Closed</b> with a resolution note.</span>
            </div>
            
            <div className="p-5 bg-violet-50 dark:bg-violet-950/20 border-2 border-slate-900 dark:border-white rounded-xl shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#fff]">
              <span className="font-black text-slate-950 dark:text-white block text-base mb-2">Internal Collaboration</span>
              <span className="font-medium">Use internal notes in the detail view to coordinate ticket progress. Notes remain associated with history.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
