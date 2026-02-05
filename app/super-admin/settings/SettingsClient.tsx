'use client';

import React, { useState } from 'react';
import { Server, Mail, MessageSquare, MapPin, Database, Key } from 'lucide-react';
import SettingsForm from './SettingsForm';

interface Setting {
    key: string;
    value: string;
    type: string;
    category: string;
    description: string | null;
}

interface SettingsClientProps {
    allSettings: Setting[];
}

export default function SettingsClient({ allSettings }: SettingsClientProps) {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const categories = [
        { id: 'SMTP', title: 'Email Service (SMTP)', icon: <Mail className="w-6 h-6" />, color: 'blue', description: 'Configure platform email provider' },
        { id: 'SMS', title: 'SMS Gateway', icon: <MessageSquare className="w-6 h-6" />, color: 'green', description: 'SMS notifications and OTP' },
        { id: 'MAPS', title: 'Maps Integration', icon: <MapPin className="w-6 h-6" />, color: 'red', description: 'Google Maps API for locations' },
        { id: 'OTP', title: 'OTP Service', icon: <Key className="w-6 h-6" />, color: 'purple', description: 'One-time password delivery' },
        { id: 'STORAGE', title: 'Cloud Storage', icon: <Database className="w-6 h-6" />, color: 'orange', description: 'S3/Cloud storage for backups' },
        { id: 'REDIS', title: 'Redis Cache', icon: <Server className="w-6 h-6" />, color: 'cyan', description: 'Caching configuration' },
    ];

    const getSettingsForCategory = (catId: string) => {
        return allSettings.filter(s => s.category === catId);
    };

    if (activeCategory) {
        return (
            <div className="max-w-3xl mx-auto">
                <SettingsForm
                    category={activeCategory}
                    settings={getSettingsForCategory(activeCategory)}
                    onClose={() => setActiveCategory(null)}
                />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
                <SettingsCard
                    key={cat.id}
                    icon={cat.icon}
                    title={cat.title}
                    description={cat.description}
                    fields={getSettingsForCategory(cat.id).map(s => s.key.replace(cat.id + '_', '').replace(/_/g, ' '))}
                    color={cat.color as any}
                    onClick={() => setActiveCategory(cat.id)}
                />
            ))}
        </div>
    );
}

function SettingsCard({ icon, title, description, fields, color, onClick }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    fields: string[];
    color: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'cyan';
    onClick: () => void;
}) {
    const colorClasses = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        red: 'from-red-500 to-red-600',
        purple: 'from-purple-500 to-purple-600',
        orange: 'from-orange-500 to-orange-600',
        cyan: 'from-cyan-500 to-cyan-600'
    };

    return (
        <div
            onClick={onClick}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all cursor-pointer group"
        >
            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">{title}</h3>
            <p className="text-sm text-slate-500 mb-4">{description}</p>
            <div className="space-y-1">
                {fields.length > 0 ? fields.map((field, idx) => (
                    <div key={idx} className="text-xs text-slate-400 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                        <span className="capitalize">{field.toLowerCase()}</span>
                    </div>
                )) : (
                    <p className="text-xs text-slate-400 italic">No settings defined</p>
                )}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium group-hover:translate-x-1 inline-block transition-transform">
                    Click to configure →
                </span>
            </div>
        </div>
    );
}
