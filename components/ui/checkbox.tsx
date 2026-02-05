"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, onCheckedChange, onChange, ...props }, ref) => {
        const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            if (onChange) {
                onChange(event)
            }
            if (onCheckedChange) {
                onCheckedChange(event.target.checked)
            }
        }

        return (
            <div className="relative flex items-center justify-center">
                <input
                    type="checkbox"
                    className={cn(
                        "peer h-4 w-4 appearance-none rounded-sm border border-slate-900 shadow-sm outline-none ring-offset-white focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-slate-900 checked:text-slate-50 dark:border-slate-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300 dark:checked:bg-slate-50 dark:checked:text-slate-900",
                        className
                    )}
                    onChange={handleChange}
                    ref={ref}
                    {...props}
                />
                <Check className="pointer-events-none absolute h-3 w-3 text-white dark:text-slate-900 opacity-0 peer-checked:opacity-100" />
            </div>
        )
    }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
