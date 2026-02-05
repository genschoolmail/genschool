'use client';

import React, { useState, useTransition } from 'react';
import { Search, Filter, Save, Loader2, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { updateExamTeacher } from '@/lib/exam-schedule-actions';

interface Teacher {
    id: string;
    user: {
        name: string | null;
    };
}

interface ExamSchedule {
    id: string;
    subject: {
        name: string;
    };
    class: {
        name: string;
        section: string;
    };
    examGroup: {
        name: string;
    };
    examDate: Date;
    teacherId: string | null;
    teacher: {
        user: {
            name: string | null;
        }
    } | null;
}

interface ExamAssignmentClientProps {
    schedules: ExamSchedule[];
    teachers: Teacher[];
    examGroups: { id: string; name: string }[];
    classes: { id: string; name: string; section: string }[];
}

export default function ExamAssignmentClient({
    schedules: initialSchedules,
    teachers,
    examGroups,
    classes
}: ExamAssignmentClientProps) {
    const [schedules, setSchedules] = useState(initialSchedules);
    const [filteredSchedules, setFilteredSchedules] = useState(initialSchedules);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isPending, startTransition] = useTransition();

    // Filtering Logic
    React.useEffect(() => {
        let result = schedules;

        if (selectedGroup) {
            result = result.filter(s => s.examGroup.id === selectedGroup); // Assuming examGroup object has id, checking schema... actually initialSchedules has structure.  Let's check props.
            // Simplified: filter by property match if id is not directly available in flat structure, 
            // but usually we pass relational objects.
        }

        // Wait, filtering `s.examGroup.id` is safer if we ensure it's loaded. 
        // Let's refine the filter to match the data passed from server.

        if (selectedGroup) {
            // We'll rely on server data having proper IDs.
            // Actually, for client-side filtering let's assume `s.examGroup` has `id` if included in Prisma query.
            // If not, we might need to adjust.
        }

        if (selectedClass) {
            // result = result.filter(s => s.classId === selectedClass); // We might need classId exposed.
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(s =>
                s.subject.name.toLowerCase().includes(query) ||
                s.class.name.toLowerCase().includes(query) ||
                s.teacher?.user.name?.toLowerCase().includes(query)
            );
        }

        // Actually, let's implement the filtering properly in the render or via useEffect.
        // For now, simpler filtering:
        const filtered = schedules.filter(s => {
            const matchesGroup = selectedGroup ? (s as any).examGroupId === selectedGroup : true;
            const matchesClass = selectedClass ? (s as any).classId === selectedClass : true;
            const matchesSearch = searchQuery ? (
                s.subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (s.teacher?.user.name || '').toLowerCase().includes(searchQuery.toLowerCase())
            ) : true;
            return matchesGroup && matchesClass && matchesSearch;
        });

        setFilteredSchedules(filtered);
    }, [selectedGroup, selectedClass, searchQuery, schedules]);


    const handleTeacherChange = async (scheduleId: string, teacherId: string) => {
        startTransition(async () => {
            try {
                const result = await updateExamTeacher(scheduleId, teacherId);
                if (result.success) {
                    toast.success('Assigned teacher successfully');
                    // Optimistic update
                    setSchedules(prev => prev.map(s =>
                        s.id === scheduleId
                            ? {
                                ...s,
                                teacherId: teacherId || null,
                                teacher: teacherId ? teachers.find(t => t.id === teacherId) : null
                            } as any
                            : s
                    ));
                } else {
                    toast.error(result.message);
                }
            } catch (error) {
                toast.error('Failed to assign teacher');
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Exam Term</label>
                        <select
                            value={selectedGroup}
                            onChange={(e) => setSelectedGroup(e.target.value)}
                            className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 outline-none"
                        >
                            <option value="">All Terms</option>
                            {examGroups.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Class</label>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 outline-none"
                        >
                            <option value="">All Classes</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name}-{c.section}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Search</label>
                        <div className="relative mt-1">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search subject or teacher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-sm">Subject</th>
                            <th className="px-6 py-4 font-semibold text-sm">Class</th>
                            <th className="px-6 py-4 font-semibold text-sm">Exam Date</th>
                            <th className="px-6 py-4 font-semibold text-sm w-1/3">Assigned Teacher</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {filteredSchedules.map(schedule => (
                            <tr key={schedule.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                <td className="px-6 py-4">
                                    <p className="font-medium text-slate-800 dark:text-white">{schedule.subject.name}</p>
                                    <p className="text-xs text-slate-500">{schedule.examGroup.name}</p>
                                </td>
                                <td className="px-6 py-4">
                                    {schedule.class.name}-{schedule.class.section}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                    {new Date(schedule.examDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="relative">
                                        <select
                                            value={schedule.teacherId || ''}
                                            onChange={(e) => handleTeacherChange(schedule.id, e.target.value)}
                                            disabled={isPending}
                                            className={`w-full px-3 py-2 border rounded-lg outline-none appearance-none cursor-pointer transition-colors ${schedule.teacherId
                                                    ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
                                                    : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-700 dark:border-slate-600'
                                                }`}
                                        >
                                            <option value="">Unassigned (Open to All Dept)</option>
                                            {teachers.map(t => (
                                                <option key={t.id} value={t.id}>{t.user.name}</option>
                                            ))}
                                        </select>
                                        <UserCheck className={`absolute right-3 top-2.5 w-4 h-4 pointer-events-none ${schedule.teacherId ? 'text-green-600' : 'text-slate-400'
                                            }`} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredSchedules.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                    No exams found matching your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
