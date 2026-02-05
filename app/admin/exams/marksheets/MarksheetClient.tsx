'use client';

import React, { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import PublishResultsButton from './PublishResultsButton';

interface ExamGroup {
    id: string;
    name: string;
    academicYear: string;
    resultsPublished: boolean;
}

interface Class {
    id: string;
    name: string;
    section: string;
}

export default function MarksheetManagementClient({
    examGroups,
    classes
}: {
    examGroups: ExamGroup[];
    classes: Class[];
}) {
    // Download Tab States
    const [selectedExamGroup, setSelectedExamGroup] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showList, setShowList] = useState(false);


    const handleGenerateList = async () => {
        if (!selectedExamGroup) {
            toast.error('Please select an exam term');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/marksheets/list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    examGroupId: selectedExamGroup,
                    classId: selectedClass || undefined
                })
            });

            const data = await response.json();
            setStudents(data);
            setShowList(true);
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const fetchVerificationData = async (scheduleId: string) => {
        if (!scheduleId) return;
        // Assuming setFetchingMarks and setVerificationData are defined elsewhere or will be added
        // setFetchingMarks(true); 
        try {
            const res = await fetch(`/api/exams/verification-data?scheduleId=${scheduleId}`);
            const data = await res.json();

            // Also fetch grading system for auto-remarks
            const gradeRes = await fetch('/api/exams/grading');
            const grades = await gradeRes.json();

            // setVerificationData({ ...data, gradingSystem: grades });
        } catch (error) {
            toast.error('Failed to fetch marks data');
        } finally {
            // setFetchingMarks(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Marksheet Management</h1>
                    <p className="text-slate-500 mt-1">Generate and publish exam results</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Filters */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Exam Term
                            </label>
                            <select
                                value={selectedExamGroup}
                                onChange={(e) => setSelectedExamGroup(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                            >
                                <option value="">Select Exam Term</option>
                                {examGroups.map(group => (
                                    <option key={group.id} value={group.id}>
                                        {group.name} ({group.academicYear})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Class (Optional)
                            </label>
                            {/* Assuming MarksVerificationGrid is imported and intended to be placed here */}
                            {/* Note: This placement within the label's sibling div might not be the intended UI/UX. */}
                            {/* It's placed here to match the provided snippet's context. */}
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                            >
                                <option value="">All Classes</option>
                                {classes.map(cls => (
                                    <option key={cls.id} value={cls.id}>
                                        Class {cls.name}-{cls.section}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="mt-4 flex gap-3 flex-wrap items-center">
                        <button
                            onClick={handleGenerateList}
                            disabled={loading}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Show Students & Marks Status
                        </button>

                        {/* Publish Button Integration */}
                        {selectedExamGroup && (
                            <div className="ml-auto">
                                <PublishResultsButtonWrapper
                                    examGroupId={selectedExamGroup}
                                    examGroups={examGroups}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* List */}
                {showList && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-700/50">
                                    <tr>
                                        <th className="px-6 py-4 text-sm font-semibold">Roll No</th>
                                        <th className="px-6 py-4 text-sm font-semibold">Student Name</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {students.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                                                No students found
                                            </td>
                                        </tr>
                                    ) : (
                                        students.map(student => (
                                            <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                <td className="px-6 py-4 font-medium">{student.rollNo}</td>
                                                <td className="px-6 py-4">{student.name}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <a
                                                        href={`/admin/exams/marksheets/${student.id}/${selectedExamGroup}`}
                                                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium inline-flex items-center gap-1"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                        View Marksheet
                                                    </a>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function PublishResultsButtonWrapper({ examGroupId, examGroups }: { examGroupId: string, examGroups: ExamGroup[] }) {
    const group = examGroups.find(g => g.id === examGroupId);
    if (!group) return null;
    return (
        <PublishResultsButton
            examGroupId={examGroupId}
            isPublished={group.resultsPublished}
        />
    );
}
