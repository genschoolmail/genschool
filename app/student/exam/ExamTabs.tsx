'use client';

import React, { useState } from 'react';
import { FileText, Award, ClipboardList } from 'lucide-react';

interface ExamTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export default function ExamTabs({ activeTab, onTabChange }: ExamTabsProps) {
    const tabs = [
        { id: 'admit-cards', label: 'Admit Cards', icon: FileText },
        { id: 'results', label: 'Results', icon: Award },
        { id: 'marksheet', label: 'Marksheet', icon: ClipboardList },
    ];

    return (
        <div className="flex bg-white dark:bg-slate-800 rounded-xl p-1 shadow-sm border border-slate-200 dark:border-slate-700">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all ${isActive
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                    >
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
