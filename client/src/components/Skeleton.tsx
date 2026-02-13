import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const SkeletonLine: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`skeleton h-4 w-full rounded-lg ${className}`} />
);

export const SkeletonCircle: React.FC<SkeletonProps & { size?: string }> = ({
  className = '',
  size = 'w-28 h-28',
}) => (
  <div className={`skeleton rounded-full ${size} ${className}`} />
);

export const SkeletonCard: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`bg-navy-800 rounded-2xl border border-navy-700 p-6 ${className}`}>
    <SkeletonLine className="w-1/3 mb-4" />
    <SkeletonLine className="w-full mb-2" />
    <SkeletonLine className="w-2/3" />
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-navy-800 rounded-2xl border border-navy-700 p-6 flex flex-col items-center justify-center">
        <SkeletonLine className="w-20 mb-4" />
        <SkeletonCircle />
        <SkeletonLine className="w-16 mt-4" />
      </div>
      <div className="md:col-span-2 grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-navy-800 rounded-2xl border border-navy-700 p-4 flex flex-col items-center justify-center">
            <div className="skeleton w-8 h-8 rounded-full mb-2" />
            <SkeletonLine className="w-12 mb-1" />
            <SkeletonLine className="w-16 h-3" />
          </div>
        ))}
      </div>
    </div>

    <div className="bg-navy-800 rounded-2xl border border-navy-700 p-6 mb-6">
      <SkeletonLine className="w-24 mb-4" />
      <div className="flex items-end justify-between gap-2 h-36">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="skeleton w-8 rounded-t-lg" style={{ height: `${30 + Math.random() * 50}%` }} />
            <SkeletonLine className="w-6 h-3" />
          </div>
        ))}
      </div>
    </div>

    <div className="bg-navy-800 rounded-2xl border border-navy-700 p-6 mb-6">
      <SkeletonLine className="w-32 mb-4" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 mb-3">
          <div className="skeleton w-6 h-6 rounded-full flex-shrink-0" />
          <SkeletonLine className="flex-1" />
        </div>
      ))}
    </div>
  </div>
);

export const ReportSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="bg-navy-800 rounded-2xl border border-navy-700 p-6 mb-4 flex flex-col items-center">
      <SkeletonLine className="w-24 mb-4" />
      <SkeletonCircle size="w-32 h-32" />
      <SkeletonLine className="w-16 mt-4" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-navy-800 rounded-xl border border-navy-700 p-4 flex flex-col items-center">
          <div className="skeleton w-6 h-6 rounded-full mb-2" />
          <SkeletonLine className="w-10 mb-1" />
          <SkeletonLine className="w-14 h-3" />
        </div>
      ))}
    </div>
    {[...Array(3)].map((_, i) => (
      <SkeletonCard key={i} className="mb-4" />
    ))}
  </div>
);

export const AnalyzingLoader: React.FC<{ message?: string }> = ({
  message = 'Analyzing your sleep patterns...',
}) => (
  <div className="flex flex-col items-center py-16">
    <div className="relative mb-6">
      <div className="w-16 h-16 rounded-full border-2 border-navy-600 border-t-brand-400 animate-spin" />
      <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-b-brand-400/30 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
    </div>
    <p className="text-slate-300 text-sm font-medium">{message}</p>
    <p className="text-slate-500 text-xs mt-1">This may take a few seconds</p>
  </div>
);
