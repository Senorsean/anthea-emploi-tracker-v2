import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string
  variant?: "default" | "thermometer"
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, indicatorClassName, variant = "default", ...props }, ref) => {
  if (variant === "thermometer") {
    return (
      <div className={cn("relative h-6 w-full", className)}>
        {/* Thermometer background */}
        <div className="h-full w-full rounded-full bg-gray-200 border-2 border-gray-300 relative overflow-hidden">
          {/* Gradient fill */}
          <div 
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${value || 0}%`,
              background: `linear-gradient(to right, 
                hsl(0, 85%, 60%) 0%, 
                hsl(30, 85%, 60%) 50%, 
                hsl(120, 85%, 60%) 100%)`
            }}
          />
        </div>
        
        {/* Cursor indicator */}
        <div 
          className="absolute top-0 h-full w-1 bg-gray-800 rounded-full transition-all duration-500 ease-out"
          style={{ 
            left: `calc(${value || 0}% - 2px)`,
            boxShadow: '0 0 4px rgba(0,0,0,0.3)'
          }}
        />
        
        {/* Percentage text */}
        <div className="absolute -bottom-6 left-0 right-0 text-center text-sm font-medium text-gray-700">
          {Math.round(value || 0)}%
        </div>
      </div>
    )
  }

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 bg-primary transition-all",
          indicatorClassName
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
