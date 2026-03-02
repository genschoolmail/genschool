import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AISlideGenerator from '@/components/teacher/AISlideGenerator';
import { Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function AISlidesPage() {
    const session = await auth();
    if (!session || session.user.role !== 'TEACHER') {
        redirect('/login');
    }

    const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
        include: {
            classes: true,
            classTeachers: { include: { class: true } },
            subjects: { include: { class: true } },
            school: { select: { name: true } }
        }
    });

    if (!teacher) return <div>Teacher not found</div>;

    const schoolName = teacher.school?.name || "School";
    const teacherName = session.user.name || "Teacher";

    // Aggregate unique classes for the sharing dropdown
    const classesMap = new Map();
    teacher.classes.forEach(c => classesMap.set(c.id, c));
    teacher.classTeachers.forEach(ct => ct.class && classesMap.set(ct.id, ct.class));
    teacher.subjects.forEach(s => s.class && classesMap.set(s.class.id, s.class));
    const teacherClasses = Array.from(classesMap.values());

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <Link href="/teacher" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-indigo-100 dark:bg-indigo-500/20 p-3 rounded-2xl">
                            <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">AI Slide Generator</h1>
                            <p className="text-slate-500 dark:text-slate-400">Transform your notes into slides, quizzes, and lesson plans</p>
                        </div>
                    </div>

                    <AISlideGenerator
                        classes={teacherClasses}
                        schoolName={schoolName}
                        teacherName={teacherName}
                    />
                </div>
            </div>
        </div>
    );
}
