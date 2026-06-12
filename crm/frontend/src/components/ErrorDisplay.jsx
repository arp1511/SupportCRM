import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

const ErrorDisplay = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto min-h-[300px] gap-6">
      <div className="p-4 bg-rose-500/10 dark:bg-rose-500/20 text-rose-500 dark:text-rose-400 rounded-full animate-bounce">
        <AlertCircle className="w-10 h-10" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Something went wrong
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed break-words">
          {message || "We encountered an error while loading the requested page."}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorDisplay;
