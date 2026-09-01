import React from 'react';

export const PageLoader = () => (
  <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-900 border-t-transparent" />
      <span className="text-sm font-medium text-slate-500">Loading module...</span>
    </div>
  </div>
);
