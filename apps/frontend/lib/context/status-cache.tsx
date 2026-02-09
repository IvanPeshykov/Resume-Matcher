'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { type SystemStatus } from '@/lib/api/config';

interface CachedStatus {
  status: SystemStatus | null;
  lastFetched: number | null;
  lastLlmCheck: number | null;
  isLoading: boolean;
  error: string | null;
}

interface StatusCacheContextValue {
  // Cached data
  status: SystemStatus | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;

  // Increment counters (for optimistic updates)
  incrementResumes: () => void;
  decrementResumes: () => void;
  incrementJobs: () => void;
  incrementImprovements: () => void;
  setHasMasterResume: (value: boolean) => void;
}

const StatusCacheContext = createContext<StatusCacheContextValue | null>(null);

export function StatusCacheProvider({ children }: { children: React.ReactNode }) {
  const [cache, setCache] = useState<CachedStatus>({
    status: null,
    lastFetched: null,
    lastLlmCheck: null,
    isLoading: true,
    error: null,
  });
  // Counter update methods (optimistic updates)
  const incrementResumes = useCallback(() => {
    setCache((prev) => {
      if (!prev.status) return prev;
      return {
        ...prev,
        status: {
          ...prev.status,
          database_stats: {
            ...prev.status.database_stats,
            total_resumes: prev.status.database_stats.total_resumes + 1,
          },
        },
      };
    });
  }, []);

  const decrementResumes = useCallback(() => {
    setCache((prev) => {
      if (!prev.status) return prev;
      return {
        ...prev,
        status: {
          ...prev.status,
          database_stats: {
            ...prev.status.database_stats,
            total_resumes: Math.max(0, prev.status.database_stats.total_resumes - 1),
          },
        },
      };
    });
  }, []);

  const incrementJobs = useCallback(() => {
    setCache((prev) => {
      if (!prev.status) return prev;
      return {
        ...prev,
        status: {
          ...prev.status,
          database_stats: {
            ...prev.status.database_stats,
            total_jobs: prev.status.database_stats.total_jobs + 1,
          },
        },
      };
    });
  }, []);

  const incrementImprovements = useCallback(() => {
    setCache((prev) => {
      if (!prev.status) return prev;
      return {
        ...prev,
        status: {
          ...prev.status,
          database_stats: {
            ...prev.status.database_stats,
            total_improvements: prev.status.database_stats.total_improvements + 1,
          },
        },
      };
    });
  }, []);

  const setHasMasterResume = useCallback((value: boolean) => {
    setCache((prev) => {
      if (!prev.status) return prev;
      return {
        ...prev,
        status: {
          ...prev.status,
          has_master_resume: value,
          database_stats: {
            ...prev.status.database_stats,
            has_master_resume: value,
          },
        },
      };
    });
  }, []);
  const value: StatusCacheContextValue = {
    status: cache.status,
    isLoading: cache.isLoading,
    error: cache.error,
    lastFetched: cache.lastFetched ? new Date(cache.lastFetched) : null,
    incrementResumes,
    decrementResumes,
    incrementJobs,
    incrementImprovements,
    setHasMasterResume,
  };

  return <StatusCacheContext.Provider value={value}>{children}</StatusCacheContext.Provider>;
}

export function useStatusCache() {
  const context = useContext(StatusCacheContext);
  if (!context) {
    throw new Error('useStatusCache must be used within a StatusCacheProvider');
  }
  return context;
}
