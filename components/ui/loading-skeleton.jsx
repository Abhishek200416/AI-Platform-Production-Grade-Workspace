'use client'

import { cn } from '@/lib/utils'

export function LoadingSkeleton({ className, children, ...props }) {
  return (
    <div
      className={cn("animate-pulse bg-muted rounded", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function TextSkeleton({ className, lines = 1 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <LoadingSkeleton
          key={i}
          className={cn("h-4", i === lines - 1 ? "w-3/4" : "w-full", className)}
        />
      ))}
    </div>
  )
}

export function CardSkeleton({ className }) {
  return (
    <div className={cn("border rounded-lg p-6", className)}>
      <div className="space-y-4">
        <LoadingSkeleton className="h-6 w-1/3" />
        <TextSkeleton lines={2} />
        <div className="flex gap-2">
          <LoadingSkeleton className="h-8 w-16" />
          <LoadingSkeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5, cols = 4, className }) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-6 w-full" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, colIndex) => (
            <LoadingSkeleton key={colIndex} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  )
}