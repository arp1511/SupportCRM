import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ticketsApi } from "../api/client";
import { SkeletonCard } from "../components/LoadingSpinner";
import ErrorDisplay from "../components/ErrorDisplay";
import EmptyState from "../components/EmptyState";
import { 
  Search, 
  Calendar, 
  User, 
  SearchSlash, 
  LayoutList, 
  Kanban, 
  ChevronRight, 
  ChevronLeft,
  ArrowRight
} from "lucide-react";

const TicketsList = () => {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'board'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      // In Board view we retrieve all to distribute them across columns, so ignore filter status
      if (viewMode === "list" && statusFilter !== "ALL") {
        params.status = statusFilter;
      }
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch;
      }

      const data = await ticketsApi.getTickets(params);
      setTickets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, debouncedSearch, viewMode]);

  const handleMoveStatus = async (ticketId, currentStatus, direction) => {
    const statuses = ["Open", "In Progress", "Closed"];
    const currentIndex = statuses.indexOf(currentStatus);
    const newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    
    if (newIndex >= 0 && newIndex < statuses.length) {
      const newStatus = statuses[newIndex];
      try {
        await ticketsApi.updateTicket(ticketId, { 
          status: newStatus,
          note_text: `Pipeline update: Transferred to ${newStatus}`
        });
        // Refresh items list
        const updated = tickets.map(t => t.id === ticketId || t.ticket_id === ticketId ? { ...t, status: newStatus } : t);
        setTickets(updated);
        fetchTickets();
      } catch (err) {
        console.error("Failed to update status in pipeline:", err);
      }
    }
  };

  const filters = [
    { label: "All Tickets", value: "ALL" },
    { label: "Open", value: "Open" },
    { label: "In Progress", value: "In Progress" },
    { label: "Closed", value: "Closed" },
  ];

  const boardColumns = [
    { id: "Open", title: "Open Requests", headerColor: "text-amber-500", dotColor: "bg-amber-500", bgColor: "bg-amber-500/[0.02] dark:bg-amber-500/[0.01]" },
    { id: "In Progress", title: "In Progress", headerColor: "text-purple-500", dotColor: "bg-purple-500", bgColor: "bg-purple-500/[0.02] dark:bg-purple-500/[0.01]" },
    { id: "Closed", title: "Resolved", headerColor: "text-emerald-500", dotColor: "bg-emerald-500", bgColor: "bg-emerald-500/[0.02] dark:bg-emerald-500/[0.01]" }
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white my-0">
            Support Pipeline
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-semibold mt-2">
            Browse and manage all customer support inquiries.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 border-2.5 border-slate-900 dark:border-white rounded-xl shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#fff]">
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-black rounded-lg transition-all cursor-pointer ${
              viewMode === "list"
                ? "bg-violet-600 text-white border-2 border-slate-900 dark:border-white shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#fff]"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 border-2 border-transparent"
            }`}
          >
            <LayoutList className="w-4 h-4" />
            List
          </button>
          <button
            onClick={() => setViewMode("board")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-black rounded-lg transition-all cursor-pointer ${
              viewMode === "board"
                ? "bg-violet-600 text-white border-2 border-slate-900 dark:border-white shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#fff]"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 border-2 border-transparent"
            }`}
          >
            <Kanban className="w-4 h-4" />
            Pipeline Board
          </button>
        </div>
      </div>

      {/* Filters & Search Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Status Filters (Only visible in List view) */}
        {viewMode === "list" ? (
          <div className="flex flex-wrap gap-2.5 p-1.5 bg-white dark:bg-slate-900 border-2.5 border-slate-900 dark:border-white rounded-xl max-w-max shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#fff]">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-5 py-2 text-base font-black rounded-lg transition-all cursor-pointer border-2 ${
                  statusFilter === filter.value
                    ? "bg-violet-600 text-white border-slate-900 dark:border-white shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#fff]"
                    : "bg-transparent text-slate-600 dark:text-slate-400 border-transparent hover:border-slate-900 dark:hover:border-white hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-base text-slate-800 dark:text-slate-200 font-black flex items-center gap-2 bg-violet-50 dark:bg-slate-900 px-4 py-2.5 rounded-lg border-2 border-slate-900 dark:border-white shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#fff]">
            <Kanban className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            <span>Interactive Pipeline Mode</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative w-full lg:max-w-md">
          <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 dark:text-slate-400 z-10">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Search name, email, subject, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="neo-input neo-input-icon text-base font-bold"
          />
        </div>
      </div>

      {/* Loading & Empty states */}
      {loading ? (
        viewMode === "list" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-6 w-28 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                <SkeletonCard />
              </div>
            ))}
          </div>
        )
      ) : error ? (
        <ErrorDisplay message={error} onRetry={fetchTickets} />
      ) : tickets.length === 0 ? (
        debouncedSearch.trim() ? (
          <div className="flex flex-col items-center justify-center p-16 text-center max-w-md mx-auto min-h-[350px] gap-5 neo-card">
            <div className="p-5 bg-violet-50 dark:bg-slate-900 border-2 border-slate-900 dark:border-white text-slate-600 dark:text-slate-400 rounded-full shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#fff]">
              <SearchSlash className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-950 dark:text-white">No search results</h3>
              <p className="text-base text-slate-600 dark:text-slate-400 font-semibold">
                We couldn't find any tickets matching "{debouncedSearch}". Try updating search terms.
              </p>
            </div>
            <button
              onClick={() => setSearch("")}
              className="text-base font-black text-violet-600 dark:text-violet-400 hover:text-violet-750 underline decoration-2 decoration-violet-500/30 hover:decoration-violet-500 cursor-pointer"
            >
              Clear search query
            </button>
          </div>
        ) : (
          <EmptyState />
        )
      ) : viewMode === "list" ? (
        /* List Mode View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {tickets.map((ticket) => (
            <Link
              key={ticket.ticket_id}
              to={`/tickets/${ticket.ticket_id}`}
              className="group neo-card-interactive p-8 flex flex-col justify-between"
            >
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-black text-slate-450 dark:text-slate-500">
                      {ticket.ticket_id}
                    </span>
                    {ticket.category && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-black uppercase border-1.5 border-slate-900 dark:border-white bg-violet-100 text-violet-900">
                        {ticket.category}
                      </span>
                    )}
                  </div>

                  <span
                    className={`inline-flex items-center px-3.5 py-1 rounded-full text-xs font-black uppercase border-2 border-slate-900 dark:border-white shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#fff] ${
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

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-950 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-1 my-0">
                    {ticket.subject}
                  </h3>
                  <p className="text-base text-slate-600 dark:text-slate-400 font-medium line-clamp-2 leading-relaxed">
                    {ticket.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-5 border-t-2 border-slate-900 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-2 font-black text-slate-800 dark:text-slate-200">
                  <User className="w-4.5 h-4.5 text-slate-500" />
                  {ticket.customer_name}
                </span>
                <span className="flex items-center gap-2 font-bold">
                  <Calendar className="w-4.5 h-4.5 text-slate-500" />
                  {new Date(ticket.created_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* Board/Pipeline Mode View (Frappe CRM style) */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {boardColumns.map((col) => {
            const colTickets = tickets.filter(t => t.status === col.id);
            return (
              <div 
                key={col.id} 
                className="flex flex-col border-2.5 border-slate-900 dark:border-white bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#fff]"
              >
                {/* Column Title */}
                <div className="px-6 py-5 border-b-2.5 border-slate-900 dark:border-slate-800 flex items-center justify-between bg-violet-50 dark:bg-slate-950">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-3.5 h-3.5 rounded-full border-1.5 border-slate-900 dark:border-white ${col.dotColor}`}></span>
                    <h3 className="text-base font-black text-slate-900 dark:text-white my-0">
                      {col.title}
                    </h3>
                  </div>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded border-1.5 border-slate-900 dark:border-white bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-[1.5px_1.5px_0px_0px_#0f172a] dark:shadow-[1.5px_1.5px_0px_0px_#fff]">
                    {colTickets.length}
                  </span>
                </div>

                {/* Column Body Cards */}
                <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto bg-slate-50 dark:bg-slate-950/40">
                  {colTickets.length === 0 ? (
                    <div className="py-12 text-center border-2 border-dashed border-slate-900 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400 my-0">No tickets in this state</p>
                    </div>
                  ) : (
                    colTickets.map((ticket) => (
                      <div
                        key={ticket.ticket_id}
                        className="group relative bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-white hover:border-slate-900 rounded-xl p-5 flex flex-col justify-between shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#fff] space-y-4 hover:translate-y-[-2px] transition-all hover:shadow-[4px_4px_0px_0px_#0f172a] dark:hover:shadow-[4px_4px_0px_0px_#fff]"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-black text-slate-400 dark:text-slate-500">
                                {ticket.ticket_id}
                              </span>
                              {ticket.category && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase border border-slate-900 dark:border-white bg-violet-100 text-violet-900">
                                  {ticket.category}
                                </span>
                              )}
                            </div>

                            {/* Directional Action Buttons */}
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              {col.id !== "Open" && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleMoveStatus(ticket.ticket_id, ticket.status, "prev");
                                  }}
                                  className="p-1.5 rounded bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition-colors border-2 border-slate-900 dark:border-white shadow-[1px_1px_0px_0px_#000] cursor-pointer"
                                  title="Move to previous column"
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {col.id !== "Closed" && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleMoveStatus(ticket.ticket_id, ticket.status, "next");
                                  }}
                                  className="p-1.5 rounded bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition-colors border-2 border-slate-900 dark:border-white shadow-[1px_1px_0px_0px_#000] cursor-pointer"
                                  title="Move to next column"
                                >
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                          
                          <Link to={`/tickets/${ticket.ticket_id}`}>
                            <h4 className="text-base font-black text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-1 my-0">
                              {ticket.subject}
                            </h4>
                          </Link>
                          
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {ticket.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t-2 border-slate-900 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1 font-black text-slate-800 dark:text-slate-200">
                            <User className="w-3.5 h-3.5" />
                            {ticket.customer_name.split(" ")[0]}
                          </span>
                          <span className="flex items-center gap-1 font-semibold">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TicketsList;
