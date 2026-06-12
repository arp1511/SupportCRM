import React from "react";

export const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-violet-500/20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 animate-spin"></div>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium animate-pulse">
        Retrieving support data...
      </p>
    </div>
  );
};

export const SkeletonCard = () => {
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900 space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
        <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
      </div>
      <div className="space-y-2">
        <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
        <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
        <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
      </div>
    </div>
  );
};

export const SkeletonDashboard = () => {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="h-8 w-12 bg-slate-200 dark:bg-slate-800 rounded"></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-[400px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl"></div>
        <div className="h-[400px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl"></div>
      </div>
    </div>
  );
};
