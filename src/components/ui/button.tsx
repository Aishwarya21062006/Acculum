import * as React from "react"
import { cn } from "@/lib/utils"

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' | 'ghost' | 'gradient', size?: 'sm' | 'md' | 'lg' }>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
          {
            'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm': variant === 'default',
            'border-2 border-indigo-200 bg-transparent text-indigo-700 hover:bg-indigo-50': variant === 'outline',
            'hover:bg-indigo-100 text-indigo-700': variant === 'ghost',
            'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-lg': variant === 'gradient',
            'h-9 px-4 text-xs': size === 'sm',
            'h-11 px-6 text-sm': size === 'md',
            'h-14 px-8 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
