import React from 'react';
import { Loader2, Music } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Loading...' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex items-center justify-center gap-2 text-muted-foreground">
      <Loader2 className={`${sizeClasses[size]} animate-spin`} />
      <span className="text-sm">{text}</span>
    </div>
  );
};

// Skeleton components for better loading UX
export const TrackSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="flex items-center space-x-4 p-4 border-b border-gray-800">
      <div className="rounded-full bg-gray-800 h-10 w-10"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-800 rounded w-3/4"></div>
        <div className="h-3 bg-gray-800 rounded w-1/2"></div>
      </div>
      <div className="h-4 bg-gray-800 rounded w-16"></div>
    </div>
  </div>
);

export const TrackListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="space-y-0">
    {Array.from({ length: count }).map((_, i) => (
      <TrackSkeleton key={i} />
    ))}
  </div>
);

export const SearchSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-6">
    <div className="flex items-center gap-4">
      <div className="h-12 bg-gray-800 rounded-full flex-1"></div>
      <div className="h-12 w-20 bg-gray-800 rounded-full"></div>
    </div>
    <TrackListSkeleton count={3} />
  </div>
);

// Full page loading with music theme
export const PageLoading: React.FC<{ message?: string }> = ({ 
  message = 'Loading your music...' 
}) => (
  <div className="min-h-screen bg-black text-white flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <Music className="h-16 w-16 text-blue-500 animate-pulse" />
      </div>
      <div className="space-y-2">
        <LoadingSpinner size="lg" text="" />
        <p className="text-lg font-medium">{message}</p>
        <p className="text-sm text-gray-400">Just a moment...</p>
      </div>
    </div>
  </div>
);

// Suspense fallback component
export const SuspenseFallback: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <LoadingSpinner text="Loading component..." />
  </div>
);