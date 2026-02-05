import React from 'react';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import MarksEntryClient from '@/components/MarksEntryClient';
import { AlertCircle } from 'lucide-react';

export default async function TeacherMarksEntryPage() {
    const session = await auth();
    if (!session || session.user.role !== 'TEACHER') {
        redirect('/login');
    }

    // 1. Get Teacher Profile
    const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id }
    });

    if (!teacher) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-600">Teacher Profile Not Found</h1>
            </div>
        );
    }

    // 2. Get Assigned Classes (where teacher is class teacher OR has subject assigned)
    const assignedSubjects = await prisma.subject.findMany({
        where: { teacherId: teacher.id },
        include: { class: true }
    });

    if (assignedSubjects.length === 0) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">No Subjects Assigned</h2>
                    <p className="text-slate-600">You have not been assigned any subjects yet. Please contact the administrator.</p>
                </div>
            </div>
        );
    }

    // Extract unique classes and subjects for the dropdowns
    const uniqueClassesMap = new Map();
    const uniqueSubjectsMap = new Map();

    assignedSubjects.forEach(sub => {
        if (sub.class) {
            uniqueClassesMap.set(sub.class.id, sub.class);
        }
        uniqueSubjectsMap.set(sub.id, sub);
    });

    const classes = Array.from(uniqueClassesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    const subjects = Array.from(uniqueSubjectsMap.values()).sort((a, b) => a.name.localeCompare(b.name));

    // Get all exam groups (Teacher can see all exams, but can only enter marks for their subjects)
    const examGroups = await prisma.examGroup.findMany({
        orderBy: { order: 'asc' },
        where: {
            // Optional: Filter only active exams if needed
        }
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Marks Entry</h1>
                <p className="text-slate-500 mt-1">Enter marks for your assigned subjects</p>
            </div>

            <MarksEntryClient
                examGroups={examGroups}
                classes={classes}
                subjects={subjects}
                role="TEACHER"
            />
        </div>
    );
}
