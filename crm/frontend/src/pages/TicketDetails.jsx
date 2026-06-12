import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ticketsApi } from "../api/client";
import { useToast } from "../context/ToastContext";
import { LoadingSpinner } from "../components/LoadingSpinner";
import ErrorDisplay from "../components/ErrorDisplay";
import { 
  User, 
  Mail, 
  Clock, 
  Calendar, 
  StickyNote, 
  ArrowLeft, 
  Loader2,
  CheckCircle,
  AlertTriangle,
  PlayCircle,
  Sparkles,
  Bot,
  Brain,
  History,
  Workflow
} from "lucide-react";

const TicketDetails = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [noteText, setNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // AI States
  const [aiCategory, setAiCategory] = useState(null);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Customer Profile History States
  const [customerTickets, setCustomerTickets] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ticketsApi.getTicket(ticketId);
      setTicket(data);
      
      // Fetch customer ticket history
      fetchCustomerHistory(data.customer_email);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerHistory = async (email) => {
    try {
      setLoadingHistory(true);
      const list = await ticketsApi.getTickets({ search: email });
      setCustomerTickets(list);
    } catch (err) {
      console.error("Failed to load customer history", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
    // Reset AI cache on ticket change
    setAiCategory(null);
    setAiSummary(null);
  }, [ticketId]);

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const updateData = { status: newStatus };
      
      // Auto-append status change note to the log
      updateData.note_text = `Status transitioned to "${newStatus}"`;

      await ticketsApi.updateTicket(ticketId, updateData);
      addToast(`Status updated to ${newStatus}`, "success");
      
      // Reload ticket data to fetch new notes/updates
      const updatedTicket = await ticketsApi.getTicket(ticketId);
      setTicket(updatedTicket);
    } catch (err) {
      addToast(err.message || "Failed to update status", "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    try {
      setAddingNote(true);
      const note = await ticketsApi.addNote(ticketId, { note_text: noteText.trim() });
      addToast("Note added successfully", "success");
      setTicket((prev) => ({
        ...prev,
        notes: [...prev.notes, note],
      }));
      setNoteText("");
    } catch (err) {
      addToast(err.message || "Failed to add note", "error");
    } finally {
      setAddingNote(false);
    }
  };

  // AI Function Triggers
  const triggerAICategorize = async () => {
    try {
      setLoadingCategory(true);
      const res = await ticketsApi.aiCategorize(ticketId);
      setAiCategory(res.category);
      addToast(`AI Classification: ${res.category}`, "info");
    } catch (err) {
      addToast(err.message || "AI Classification failed", "error");
    } finally {
      setLoadingCategory(false);
    }
  };

  const triggerAISummarize = async () => {
    try {
      setLoadingSummary(true);
      const res = await ticketsApi.aiSummarize(ticketId);
      setAiSummary(res);
      addToast("AI Analysis summary generated!", "info");
    } catch (err) {
      addToast(err.message || "AI Summarization failed", "error");
    } finally {
      setLoadingSummary(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} onRetry={fetchTicketDetails} />;
  if (!ticket) return <ErrorDisplay message="Ticket details could not be found." />;

  const statusOptions = [
    { value: "Open", label: "Open", icon: AlertTriangle, color: "text-amber-500 hover:bg-amber-500/10" },
    { value: "In Progress", label: "In Progress", icon: PlayCircle, color: "text-purple-500 hover:bg-purple-500/10" },
    { value: "Closed", label: "Closed", icon: CheckCircle, color: "text-emerald-500 hover:bg-emerald-500/10" },
  ];

  const activeCustomerTickets = customerTickets.filter(t => t.status !== "Closed");

  return (
    <div className="space-y-6 pb-16">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-black text-slate-700 dark:text-slate-350 hover:text-violet-600 dark:hover:text-violet-400 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Support Pipeline
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Ticket Detail & History Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info Card */}
          <div className="neo-card p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-start gap-4 flex-wrap">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-black text-slate-450 dark:text-slate-500">
                    {ticket.ticket_id}
                  </span>
                  {aiCategory && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase border-1.5 border-slate-900 dark:border-white bg-violet-100 text-violet-900">
                      <Sparkles className="w-3 h-3 animate-pulse" />
                      {aiCategory}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-black text-slate-950 dark:text-white my-0 leading-tight">
                  {ticket.subject}
                </h1>
              </div>
              
              <span
                className={`inline-flex items-center px-3 h-7 rounded-full text-xs font-black uppercase border-2 border-slate-900 dark:border-white shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#fff] ${
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

            {/* Description Block */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 block">
                Issue Description
              </span>
              <p className="text-base text-slate-700 dark:text-slate-350 leading-relaxed whitespace-pre-wrap bg-white dark:bg-slate-950/50 border-2 border-slate-900 dark:border-white rounded-xl p-4">
                {ticket.description}
              </p>
            </div>

            {/* AI Summary Section (Renders if available) */}
            {aiSummary && (
              <div className="p-5 bg-violet-50 dark:bg-slate-900 border-2.5 border-slate-900 dark:border-white rounded-xl space-y-4 shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#fff] animate-fadeIn">
                <div className="flex items-center gap-1.5 text-xs font-black text-violet-600 dark:text-violet-400">
                  <Bot className="w-4 h-4" />
                  <span>Gemini Insights Assistant</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed">
                  <div className="space-y-1 bg-white dark:bg-slate-950 p-3.5 rounded-lg border-2 border-slate-900 dark:border-white shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#fff]">
                    <span className="font-black text-slate-950 dark:text-white block uppercase tracking-wider text-[10px]">AI Summary</span>
                    <span className="text-slate-600 dark:text-slate-400 font-medium">{aiSummary.summary}</span>
                  </div>
                  
                  <div className="space-y-1 bg-white dark:bg-slate-950 p-3.5 rounded-lg border-2 border-slate-900 dark:border-white shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#fff]">
                    <span className="font-black text-slate-950 dark:text-white block uppercase tracking-wider text-[10px]">Root Cause</span>
                    <span className="text-slate-600 dark:text-slate-400 font-medium">{aiSummary.root_cause}</span>
                  </div>

                  <div className="space-y-1 bg-white dark:bg-slate-950 p-3.5 rounded-lg border-2 border-slate-900 dark:border-white shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#fff]">
                    <span className="font-black text-slate-950 dark:text-white block uppercase tracking-wider text-[10px]">Suggested Action</span>
                    <span className="text-slate-600 dark:text-slate-400 font-medium">{aiSummary.suggested_action}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Metadata Rows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t-2 border-slate-900 dark:border-slate-800 text-sm">
              <div className="space-y-2 text-slate-700 dark:text-slate-400">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 block">
                  Customer Information
                </span>
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-200">
                  <User className="w-4 h-4 text-slate-500" />
                  <span>{ticket.customer_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <a href={`mailto:${ticket.customer_email}`} className="text-violet-600 dark:text-violet-400 hover:text-violet-750 font-black underline">
                    {ticket.customer_email}
                  </a>
                </div>
              </div>

              <div className="space-y-2 text-slate-700 dark:text-slate-400">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 block">
                  Activity Timestamps
                </span>
                <div className="flex items-center gap-2 font-semibold text-slate-855 dark:text-slate-300">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>Created: {new Date(ticket.created_at).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 font-semibold text-slate-855 dark:text-slate-300">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Updated: {new Date(ticket.updated_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline / Activity Logs */}
          <div className="neo-card p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-black text-slate-955 dark:text-white my-0">
              Activity History & Notes
            </h2>

            {ticket.notes.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-4 italic text-center font-bold">
                No activity logs or internal notes recorded yet.
              </p>
            ) : (
              <div className="relative border-l-2.5 border-slate-900 dark:border-white pl-6 ml-2.5 space-y-6">
                {ticket.notes.map((note) => {
                  const isTransitionNote = note.note_text.startsWith('Status transitioned to "');
                  return (
                    <div key={note.id} className="relative group">
                      {/* Timeline dot */}
                      <span className={`absolute -left-[32.5px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 dark:border-white bg-white dark:bg-slate-950 ${
                        isTransitionNote ? "bg-violet-600!" : "bg-white dark:bg-slate-900"
                      }`}></span>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-black uppercase border px-2 py-0.5 rounded ${
                            isTransitionNote 
                              ? "bg-violet-50 text-violet-800 border-violet-200" 
                              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-900 dark:border-white"
                          }`}>
                            {isTransitionNote ? "SYSTEM LOGGER" : "AGENT NOTE"}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                            {new Date(note.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className={`text-sm leading-relaxed ${
                          isTransitionNote 
                            ? "text-slate-500 dark:text-slate-400 font-black italic" 
                            : "text-slate-800 dark:text-slate-200 font-medium whitespace-pre-wrap bg-white dark:bg-slate-950 p-3.5 rounded-xl border-2 border-slate-900 dark:border-white shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#fff]"
                        }`}>
                          {note.note_text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Sidebar Controls */}
        <div className="space-y-6">
          {/* Status Controls */}
          <div className="neo-card p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Manage Status
            </h3>
            
            <div className="flex flex-col gap-2">
              {statusOptions.map((opt) => {
                const Icon = opt.icon;
                const isCurrent = ticket.status === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleStatusChange(opt.value)}
                    disabled={isCurrent || updatingStatus}
                    className={`flex items-center gap-2.5 px-4 h-11 rounded-xl text-sm font-black border-2 transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-900 dark:border-white cursor-not-allowed opacity-100"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-900 dark:border-white hover:bg-slate-50 dark:hover:bg-slate-800 shadow-[1px_1px_0px_0px_#0f172a] dark:shadow-[1px_1px_0px_0px_#fff] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#0f172a] dark:hover:shadow-[3px_3px_0px_0px_#fff]"
                    } ${opt.color}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {opt.label}
                    {isCurrent && <span className="ml-auto text-[9px] uppercase font-black tracking-wider bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-1.5 py-0.5 rounded">Active</span>}
                  </button>
                );
              })}
            </div>
            
            {updatingStatus && (
              <div className="flex items-center gap-1.5 justify-center text-xs font-black text-slate-500 dark:text-slate-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Updating ticket status...
              </div>
            )}
          </div>

          {/* Frappe CRM Inspiration: AI Smart Panel */}
          <div className="bg-slate-950 dark:bg-slate-900 border-2.5 border-slate-900 dark:border-white text-white rounded-2xl p-6 space-y-4 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#fff]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-violet-600 text-white border-2 border-white rounded-lg">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black my-0 text-white">AI Copilot</h3>
                <span className="text-[10px] text-slate-400 font-bold">Powered by Gemini 2.5 Flash</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={triggerAICategorize}
                disabled={loadingCategory}
                className="flex items-center justify-center gap-2 px-4 h-11 rounded-xl text-xs font-black uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border-2 border-white/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {loadingCategory ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Analyzing Content...
                  </>
                ) : (
                  <>
                    <Brain className="w-3.5 h-3.5" />
                    Auto-Classify Category
                  </>
                )}
              </button>

              <button
                onClick={triggerAISummarize}
                disabled={loadingSummary}
                className="flex items-center justify-center gap-2 px-4 h-11 rounded-xl text-xs font-black uppercase tracking-wider bg-violet-650 hover:bg-violet-700 text-white border-2 border-white shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.25)] transition-all cursor-pointer disabled:opacity-50"
              >
                {loadingSummary ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Generating Insights...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Summary & Actions
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Customer Profile Side-panel */}
          <div className="neo-card p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Customer History Profile
            </h3>
            
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3 bg-violet-50 dark:bg-slate-950 p-3 rounded-xl border-2 border-slate-900 dark:border-white shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#fff]">
                <div className="w-10 h-10 rounded-full bg-violet-600 text-white border-2 border-slate-900 dark:border-white font-black text-sm flex items-center justify-center">
                  {ticket.customer_name.split(" ").map(n => n[0]).join("").toUpperCase()}
                </div>
                <div>
                  <span className="font-black text-slate-900 dark:text-white block">{ticket.customer_name}</span>
                  <span className="text-slate-500 dark:text-slate-450 font-bold">{ticket.customer_email}</span>
                </div>
              </div>

              {loadingHistory ? (
                <div className="flex items-center gap-1.5 text-slate-400 justify-center py-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Loading profile context...
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-3 bg-white dark:bg-slate-950 rounded-lg border-2 border-slate-900 dark:border-white shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#fff]">
                    <span className="block text-lg font-black text-slate-900 dark:text-white">
                      {customerTickets.length}
                    </span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-450 uppercase font-black">Total Tickets</span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-950 rounded-lg border-2 border-slate-900 dark:border-white shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#fff]">
                    <span className="block text-lg font-black text-violet-600 dark:text-violet-400">
                      {activeCustomerTickets.length}
                    </span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-450 uppercase font-black">Active Cases</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Add Note Form */}
          <div className="neo-card p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Add Agent Note
            </h3>
            
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                maxLength={5000}
                rows={4}
                placeholder="Type internal note details here..."
                className="neo-input text-base font-bold resize-none"
              />
              <button
                type="submit"
                disabled={addingNote || !noteText.trim()}
                className="neo-btn-primary w-full text-base font-black uppercase"
              >
                {addingNote ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <StickyNote className="w-5 h-5" />
                    Save Note
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
