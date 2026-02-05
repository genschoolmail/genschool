'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
    '08:00 - 08:45',
    '08:45 - 09:30',
    '09:30 - 10:15',
    '10:15 - 10:30', // Break
    '10:30 - 11:15',
    '11:15 - 12:00',
    '12:00 - 12:45',
    '12:45 - 01:30', // Lunch
    '01:30 - 02:15',
    '02:15 - 03:00',
];

const SUBJECT_COLORS = {
    Mathematics: 'bg-blue-500',
    English: 'bg-purple-500',
    Science: 'bg-green-500',
    'Social Studies': 'bg-orange-500',
    Hindi: 'bg-pink-500',
    'Computer Science': 'bg-indigo-500',
    'Physical Education': 'bg-emerald-500',
    Break: 'bg-slate-300',
    Lunch: 'bg-amber-500',
};

// Sample data
const SAMPLE_TIMETABLE = {
    Monday: [
        { subject: 'Mathematics', teacher: 'Mr. Sharma', room: '101' },
        { subject: 'English', teacher: 'Ms. Verma', room: '203' },
        { subject: 'Science', teacher: 'Dr. Kumar', room: '305' },
        { subject: 'Break', teacher: '', room: '' },
        { subject: 'Hindi', teacher: 'Mrs. Gupta', room: '201' },
        { subject: 'Social Studies', teacher: 'Mr. Singh', room: '102' },
        { subject: 'Computer Science', teacher: 'Ms. Patel', room: 'Lab 1' },
        { subject: 'Lunch', teacher: '', room: '' },
        { subject: 'Physical Education', teacher: 'Mr. Rao', room: 'Ground' },
        { subject: 'Mathematics', teacher: 'Mr. Sharma', room: '101' },
    ],
    // ... other days similar
};

export default function TimetablePrototype() {
    const [selectedDay, setSelectedDay] = useState(0);
    const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');

    const currentDaySchedule = SAMPLE_TIMETABLE.Monday; // For demo

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-6">
            {/* Header */}
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/admin/academics" className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                            Class Timetable
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Visual timeline view • Mobile optimized
                        </p>
                    </div>
                </div>

                {/* View Mode Toggle */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setViewMode('timeline')}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'timeline'
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                    >
                        📊 Timeline View
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'list'
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                    >
                        📋 List View
                    </button>
                </div>

                {/* Day Selector - Horizontal Scroll */}
                <div className="mb-6">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSelectedDay(Math.max(0, selectedDay - 1))}
                            className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                            disabled={selectedDay === 0}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="flex-1 overflow-x-auto scrollbar-hide">
                            <div className="flex gap-2 pb-2">
                                {DAYS.map((day, index) => (
                                    <button
                                        key={day}
                                        onClick={() => setSelectedDay(index)}
                                        className={`flex-shrink-0 px-6 py-3 rounded-xl font-semibold transition-all ${selectedDay === index
                                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:shadow-md'
                                            }`}
                                    >
                                        <div className="text-xs opacity-75 mb-1">
                                            {day.substring(0, 3)}
                                        </div>
                                        <div className="text-sm font-bold">
                                            {index === new Date().getDay() - 1 ? 'Today' : day.substring(0, 3)}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedDay(Math.min(DAYS.length - 1, selectedDay + 1))}
                            className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                            disabled={selectedDay === DAYS.length - 1}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Timeline View */}
                {viewMode === 'timeline' && (
                    <div className="space-y-3">
                        {currentDaySchedule.map((item, index) => {
                            const isBreak = item.subject === 'Break' || item.subject === 'Lunch';
                            const color = SUBJECT_COLORS[item.subject as keyof typeof SUBJECT_COLORS] || 'bg-slate-500';

                            return (
                                <div
                                    key={index}
                                    className={`relative overflow-hidden rounded-2xl transition-all hover:scale-[1.02] ${isBreak
                                            ? 'bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600'
                                            : 'bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl'
                                        }`}
                                >
                                    {/* Color Bar */}
                                    {!isBreak && (
                                        <div className={`absolute left-0 top-0 bottom-0 w-2 ${color}`} />
                                    )}

                                    <div className="p-4 pl-6">
                                        <div className="flex items-start justify-between gap-4">
                                            {/* Main Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                        {TIME_SLOTS[index]}
                                                    </span>
                                                </div>

                                                <h3 className={`text-lg font-bold mb-1 ${isBreak
                                                        ? 'text-slate-500 dark:text-slate-400'
                                                        : 'text-slate-800 dark:text-white'
                                                    }`}>
                                                    {item.subject}
                                                </h3>

                                                {!isBreak && (
                                                    <div className="flex flex-wrap gap-3 mt-2">
                                                        <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                                                            <User className="w-4 h-4" />
                                                            <span>{item.teacher}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                                                            <MapPin className="w-4 h-4" />
                                                            <span>Room {item.room}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Subject Icon/Badge */}
                                            {!isBreak && (
                                                <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${color} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                                                    {item.subject.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
                        <div className="divide-y divide-slate-200 dark:divide-slate-700">
                            {currentDaySchedule.map((item, index) => {
                                const isBreak = item.subject === 'Break' || item.subject === 'Lunch';
                                const color = SUBJECT_COLORS[item.subject as keyof typeof SUBJECT_COLORS] || 'bg-slate-500';

                                return (
                                    <div
                                        key={index}
                                        className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${isBreak ? 'bg-slate-50 dark:bg-slate-800/50' : ''
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-1 h-12 rounded-full ${color} flex-shrink-0`} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <h4 className="font-semibold text-slate-800 dark:text-white truncate">
                                                        {item.subject}
                                                    </h4>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                                                        {TIME_SLOTS[index].split(' - ')[0]}
                                                    </span>
                                                </div>
                                                {!isBreak && (
                                                    <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                                                        <span>👨‍🏫 {item.teacher}</span>
                                                        <span>📍 {item.room}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Prototype Badge */}
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white text-center">
                    <p className="font-bold text-lg mb-1">✨ Prototype Demo</p>
                    <p className="text-sm opacity-90">
                        Mobile-optimized timeline view • Swipe navigation • Visual design
                    </p>
                </div>
            </div>
        </div>
    );
}
