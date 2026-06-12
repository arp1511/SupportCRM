import React from "react";
import { Link } from "react-router-dom";
import { FolderOpen, Plus } from "lucide-react";

const EmptyState = ({
  title = "No tickets found",
  description = "Get started by creating a new customer support ticket to track progress.",
  actionLink = "/tickets/create",
  actionText = "Create Ticket",
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto min-h-[320px] gap-6">
      <div className="p-4 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 rounded-2xl">
        <FolderOpen className="w-10 h-10" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          {actionText}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
