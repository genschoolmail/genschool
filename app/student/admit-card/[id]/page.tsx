import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import AdmitCardTemplate from '@/components/AdmitCardTemplate';
import Link from 'next/link';
import { ArrowLeft, Download, AlertTriangle } from 'lucide-react';
import { auth } from '@/auth';
import { formatAdmitCardData, formatExamSchedules } from '@/lib/helpers/exam-data-transformers';
import DownloadButton from '@/app/admin/exams/admit-cards/[id]/DownloadButton';

export default async function StudentAdmitCardViewPage({ params }: { params: { id: string } }) {
    const session = await auth();
    const user = session?.user;

    if (!user) {
        redirect('/login');
    }

    // Find student record
    const student = await prisma.student.findFirst({
        where: { userId: user.id }
    });

    if (!student) {
        return <div>Student profile not found</div>;
    }

    const admitCard = await prisma.admitCard.findUnique({
        where: {
            id: params.id,
            studentId: student.id // Ensure student owns this card
        },
        include: {
            examGroup: true,
            student: {
                include: {
                    class: true,
                    user: true
                }
            }
        }
    });

    if (!admitCard) {
        notFound();
    }

    // Check access rights
    const now = new Date();
    const isIssued = admitCard.status === 'ISSUED';
    const isBlocked = admitCard.status === 'BLOCKED';
    const start = admitCard.downloadStartDate ? new Date(admitCard.downloadStartDate) : null;
    const end = admitCard.downloadEndDate ? new Date(admitCard.downloadEndDate) : null;

    const isStarted = !start || now >= start;
    const isEnded = end && now > end;

    if (isBlocked) {
        return (
            <div className="p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-800">Admit Card Blocked</h2>
                <p className="text-slate-500 mt-2">Please contact the administration.</p>
                <Link href="/student/admit-card" className="mt-4 inline-block text-indigo-600 hover:underline">
                    Back to List
                </Link>
            </div>
        );
    }

    if (!isIssued || !isStarted || isEnded) {
        return (
            <div className="p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-800">Admit Card Unavailable</h2>
                <p className="text-slate-500 mt-2">
                    {isEnded ? 'Download window has expired.' : 'Admit card is not yet available for download.'}
                </p>
                <Link href="/student/admit-card" className="mt-4 inline-block text-indigo-600 hover:underline">
                    Back to List
                </Link>
            </div>
        );
    }

    // Get schedules for the student's class
    const schedules = await prisma.examSchedule.findMany({
        where: {
            examGroupId: admitCard.examGroupId,
            classId: admitCard.student.classId || undefined
        },
        include: {
            subject: true
        },
        orderBy: {
            examDate: 'asc'
        }
    });

    // Use helper functions for data transformation
    const formattedAdmitCard = formatAdmitCardData(admitCard);
    const formattedSchedules = formatExamSchedules(schedules);

    // Fetch School Settings & Emergency Contact for display match with Admin
    const schoolSettings = await prisma.schoolSettings.findFirst({
        where: { schoolId: student.schoolId }
    });

    const emergencyContacts = await prisma.emergencyContact.findMany({
        where: { schoolId: student.schoolId, isActive: true },
        orderBy: { priority: 'asc' },
        take: 1
    });

    const primaryEmergency = emergencyContacts[0] || null;

    // Update download count (optional, can be done via server action or useEffect)
    // For simplicity, we just render here.

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between print:hidden">
                <Link
                    href="/student/admit-card"
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to List
                </Link>
                <DownloadButton />
            </div>

            {/* Admit Card */}
            <AdmitCardTemplate
                admitCard={formattedAdmitCard}
                schedules={formattedSchedules}
                schoolSettings={schoolSettings}
                emergencyContact={primaryEmergency ? {
                    name: primaryEmergency.name,
                    phone: primaryEmergency.phone
                } : null}
            />
        </div>
    );
}
