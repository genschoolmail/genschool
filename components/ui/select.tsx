"use client"

import * as React from "react"

interface SelectContextValue {
    value: string
    label: string
    onValueChange: (value: string, label: string) => void
    open: boolean
    setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined)

export function Select({ children, name, onValueChange, value: controlledValue, defaultValue }: { children: React.ReactNode; name?: string; onValueChange?: (value: string) => void; value?: string; defaultValue?: string }) {
    const [value, setValue] = React.useState(controlledValue || defaultValue || "")
    const [label, setLabel] = React.useState("")
    const [open, setOpen] = React.useState(false)

    const actualValue = controlledValue !== undefined ? controlledValue : value
    const handleValueChange = (newValue: string, newLabel: string) => {
        setValue(newValue)
        setLabel(newLabel)
        onValueChange?.(newValue)
        setOpen(false)
    }

    return (
        <SelectContext.Provider value={{ value: actualValue, label, onValueChange: handleValueChange, open, setOpen }}>
            <div className="relative">
                {name && <input type="hidden" name={name} value={actualValue} />}
                {children}
            </div>
        </SelectContext.Provider>
    )
}

export function SelectTrigger({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    const context = React.useContext(SelectContext)

    return (
        <button
            type="button"
            className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            onClick={() => context?.setOpen(!context.open)}
        >
            {children}
        </button>
    )
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
    const context = React.useContext(SelectContext)
    // Show label if available, otherwise show placeholder
    const displayText = context?.label || placeholder
    return <span className="text-slate-900 dark:text-white truncate">{displayText}</span>
}

export function SelectContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    const context = React.useContext(SelectContext)

    if (!context?.open) return null

    return (
        <div className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-popover-foreground shadow-md ${className}`}>
            <div className="w-full p-1 max-h-[200px] overflow-y-auto">
                {children}
            </div>
        </div>
    )
}

export function SelectItem({ children, value }: { children: React.ReactNode; value: string }) {
    const context = React.useContext(SelectContext)

    // Get display text from children
    const getLabel = (): string => {
        if (typeof children === 'string') return children
        if (Array.isArray(children)) {
            return children.map(child => {
                if (typeof child === 'string') return child
                return ''
            }).join('')
        }
        return value
    }

    const handleClick = () => {
        const label = getLabel()
        context?.onValueChange(value, label)
    }

    return (
        <div
            className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 ${context?.value === value ? 'bg-slate-100 dark:bg-slate-700' : ''}`}
            onClick={handleClick}
        >
            {children}
        </div>
    )
}
