"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Tabs = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { defaultValue?: string; value?: string; onValueChange?: (value: string) => void }
>(({ className, defaultValue, value, onValueChange, ...props }, ref) => {
    const [activeTab, setActiveTab] = React.useState(value || defaultValue)

    React.useEffect(() => {
        if (value !== undefined) {
            setActiveTab(value)
        }
    }, [value])

    const handleValueChange = (newValue: string) => {
        if (value === undefined) {
            setActiveTab(newValue)
        }
        onValueChange?.(newValue)
    }

    return (
        <div
            ref={ref}
            className={cn("", className)}
            data-state={activeTab}
            {...props}
        // Simple context provider hack using alignment of children
        >
            {React.Children.map(props.children, child => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child as any, { activeTab, setActiveTab: handleValueChange })
                }
                return child
            })}
        </div>
    )
})
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { activeTab?: string; setActiveTab?: (v: string) => void }
>(({ className, activeTab, setActiveTab, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
            className
        )}
        {...props}
    >
        {React.Children.map(props.children, child => {
            if (React.isValidElement(child)) {
                return React.cloneElement(child as any, { activeTab, setActiveTab })
            }
            return child
        })}
    </div>
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string; activeTab?: string; setActiveTab?: (v: string) => void }
>(({ className, value, activeTab, setActiveTab, ...props }, ref) => (
    <button
        ref={ref}
        className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300",
            activeTab === value
                ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-slate-50"
                : "hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-50",
            className
        )}
        onClick={() => setActiveTab?.(value)}
        {...props}
    />
))
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value: string; activeTab?: string }
>(({ className, value, activeTab, ...props }, ref) => {
    if (value !== activeTab) return null
    return (
        <div
            ref={ref}
            className={cn(
                "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300",
                className
            )}
            {...props}
        />
    )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
