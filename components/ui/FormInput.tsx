import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    success?: boolean;
    icon?: React.ReactNode;
    helperText?: string;
}

const FormInput = forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, success, icon, helperText, ...props }, ref) => {
        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                            {icon}
                        </div>
                    )}
                    <input
                        type={type}
                        className={cn(
                            "flex h-12 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-base ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
                            icon && "pl-10",
                            error && "border-red-500 focus-visible:ring-red-500",
                            success && "border-emerald-500 focus-visible:ring-emerald-500",
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                    {error && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none animate-in fade-in zoom-in duration-200">
                            <AlertCircle className="h-5 w-5" />
                        </div>
                    )}
                    {success && !error && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none animate-in fade-in zoom-in duration-200">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                    )}
                </div>
                {error && (
                    <p className="text-sm text-red-500 animate-in slide-in-from-top-1 duration-200">
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);
FormInput.displayName = "FormInput";

export { FormInput };
