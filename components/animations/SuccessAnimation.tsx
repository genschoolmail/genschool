'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface SuccessAnimationProps {
    type?: ToastType;
    message: string;
    show: boolean;
}

const icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
};

const colors = {
    success: 'bg-emerald-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-amber-500 text-white',
    info: 'bg-blue-500 text-white',
};

export function SuccessAnimation({ type = 'success', message, show }: SuccessAnimationProps) {
    const Icon = icons[type];

    if (!show) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl ${colors[type]}`}
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            >
                <Icon className="w-6 h-6" />
            </motion.div>
            <p className="font-semibold">{message}</p>
        </motion.div>
    );
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    return (
        <motion.div
            className={`${sizeClasses[size]} border-4 border-slate-200 dark:border-slate-700 border-t-indigo-600 rounded-full`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
    );
}

export function PulseAnimation({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            animate={{
                scale: [1, 1.05, 1],
            }}
            transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
        >
            {children}
        </motion.div>
    );
}

export function ShakeAnimation({ children, trigger }: { children: React.ReactNode; trigger: boolean }) {
    return (
        <motion.div
            animate={trigger ? {
                x: [0, -10, 10, -10, 10, 0],
            } : {}}
            transition={{ duration: 0.5 }}
        >
            {children}
        </motion.div>
    );
}

export function BounceIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                delay,
                type: 'spring',
                stiffness: 260,
                damping: 20,
            }}
        >
            {children}
        </motion.div>
    );
}
