'use client';

import { useState, useEffect, useRef } from 'react';

// Custom Select Component to control dropdown height
function CustomSelect({ value, options, onChange, className, width = 'w-auto' }: any) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`cursor-pointer select-none ${className} ${width}`}
            >
                {value}
            </div>

            {isOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto min-w-[3rem] scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-600">
                    {options.map((opt: string) => (
                        <div
                            key={opt}
                            onClick={() => {
                                onChange(opt);
                                setIsOpen(false);
                            }}
                            className={`px-3 py-1.5 text-center text-sm font-medium cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors ${value === opt ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50' : 'text-slate-700 dark:text-slate-300'
                                }`}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function TimePicker({ name, defaultValue, className }: { name: string, defaultValue?: string, className?: string }) {
    const [hour, setHour] = useState('09');
    const [minute, setMinute] = useState('00');
    const [amPm, setAmPm] = useState('AM');

    useEffect(() => {
        if (defaultValue) {
            const [h, m] = defaultValue.split(':');
            let hourVal = parseInt(h);
            const minuteVal = m;
            const amPmVal = hourVal >= 12 ? 'PM' : 'AM';

            hourVal = hourVal % 12;
            const hourStr = (hourVal === 0 ? 12 : hourVal).toString().padStart(2, '0');

            setHour(hourStr);
            setMinute(minuteVal);
            setAmPm(amPmVal);
        }
    }, [defaultValue]);

    const get24HTime = () => {
        let h = parseInt(hour);
        if (amPm === 'PM' && h !== 12) h += 12;
        if (amPm === 'AM' && h === 12) h = 0;
        return `${h.toString().padStart(2, '0')}:${minute}`;
    };

    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
    const meridiem = ['AM', 'PM'];

    return (
        <div className={`relative ${className}`}>
            <input type="hidden" name={name} value={get24HTime()} />

            <div className="flex items-center justify-center w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all shadow-sm">

                {/* Compact Container: "09:00 AM" */}
                <div className="flex items-center justify-center">
                    {/* Hour */}
                    <CustomSelect
                        value={hour}
                        options={hours}
                        onChange={setHour}
                        className="font-bold text-lg text-slate-700 dark:text-white text-center hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded p-0.5"
                        width="w-[1.6em]"
                    />

                    <span className="font-bold text-slate-400 select-none text-lg mx-0.5">:</span>

                    {/* Minute */}
                    <CustomSelect
                        value={minute}
                        options={minutes}
                        onChange={setMinute}
                        className="font-bold text-lg text-slate-700 dark:text-white text-center hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded p-0.5"
                        width="w-[1.6em]"
                    />

                    {/* AM/PM */}
                    <div className="ml-2">
                        <CustomSelect
                            value={amPm}
                            options={meridiem}
                            onChange={setAmPm}
                            className="font-bold text-indigo-600 dark:text-indigo-400 text-base text-center hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded p-1"
                            width="w-[2.5em]"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
