import React from 'react';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import MarksheetTemplate from '@/components/MarksheetTemplate';
import { generateMarksheet } from '@/lib/marksheet-actions';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PrintButton from '@/components/PrintButton';

export default async function StudentMarksheetPage({
    params
}: {
    params: { studentId: string; examGroupId: string };
}) {
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/login');
    }

    // Check permissions
    const isAdmin = session.user.role === 'ADMIN';
    const isStudent = session.user.role === 'STUDENT';
    const userId = session.user.id;

    // If student, verify they're viewing their own marksheet
    if (isStudent) {
        const student = await prisma.student.findUnique({
            where: { id: params.studentId },
            select: { userId: true }
        });

        if (student?.userId !== userId) {
            redirect('/unauthorized');
        }
    }

    // Get marksheet data
    const marksheetData = await generateMarksheet(params.studentId, params.examGroupId);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between print:hidden">
                <div className="flex items-center gap-4">
                    <Link
                        href={isAdmin ? '/admin/exams/marksheets' : '/student/marksheets'}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Marksheet</h1>
                        <p className="text-slate-500 mt-1">
                            {marksheetData.student.name} - {marksheetData.examGroup.name}
                        </p>
                    </div>
                </div>
                <PrintButton />
            </div>

            {/* Marksheet */}
            <MarksheetTemplate
                {...marksheetData}
                student={{
                    ...marksheetData.student,
                    rollNo: marksheetData.student.rollNo || '',
                    class: marksheetData.student.class || { name: '', section: '' }
                }}
                schoolSettings={{
                    ...(marksheetData.schoolSettings || {
                        schoolName: null,
                        logoUrl: null,
                        watermarkUrl: null,
                        address: null,
                        city: null,
                        state: null,
                        pincode: null,
                        contactNumber: null,
                        email: null,
                        affiliationNumber: null,
                        affiliatedTo: null,
                    }),
                    gradingSystem: marksheetData.gradeSystem
                }}
            />
        </div>
    );
}
