"use client"

import * as React from "react"

interface DialogContextValue {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue | undefined>(undefined)

export function Dialog({ children, open, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) {
    const [internalOpen, setInternalOpen] = React.useState(false)
    const isControlled = open !== undefined
    const actualOpen = isControlled ? open : internalOpen
    const handleOpenChange = isControlled ? onOpenChange! : setInternalOpen

    return (
        <DialogContext.Provider value={{ open: actualOpen, onOpenChange: handleOpenChange }}>
            {children}
        </DialogContext.Provider>
    )
}

export function DialogTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
    const context = React.useContext(DialogContext)

    return (
        <div onClick={() => context?.onOpenChange(true)}>
            {children}
        </div>
    )
}

export function DialogContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    const context = React.useContext(DialogContext)

    if (!context?.open) return null

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={() => context.onOpenChange(false)}>
            <div className={`bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 border rounded-lg shadow-lg p-6 max-w-lg w-full m-4 ${className}`} onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    )
}

export function DialogHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`}>{children}</div>
}

export function DialogTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h2>
}

export function DialogDescription({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
}

export function DialogFooter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`}>{children}</div>
}
