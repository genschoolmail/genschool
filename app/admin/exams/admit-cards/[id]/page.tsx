import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import AdmitCardTemplate from '@/components/AdmitCardTemplate';
import Link from 'next/link';
import { ArrowLeft, Download, Ban, CheckCircle, Edit } from 'lucide-react';
import { toggleAdmitCardStatus } from '@/lib/admit-card-actions';
import { revalidatePath } from 'next/cache';
import { formatAdmitCardData, formatExamSchedules } from '@/lib/helpers/exam-data-transformers';
import DownloadButton from './DownloadButton';
import DeleteAdmitCardButton from './DeleteAdmitCardButton';
import { getSchoolSettings, getEmergencyContacts } from '@/lib/actions';

export default async function AdmitCardViewPage({ params }: { params: { id: string } }) {
    const [admitCard, schoolSettings, emergencyContacts] = await Promise.all([
        prisma.admitCard.findUnique({
            where: { id: params.id },
            include: {
                examGroup: true,
                student: {
                    include: {
                        class: true,
                        user: true
                    }
                }
            }
        }),
        getSchoolSettings(),
        getEmergencyContacts(),
    ]);

    if (!admitCard) {
        notFound();
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

    // Get primary emergency contact
    const primaryEmergency = emergencyContacts.find((c: any) => c.isActive && c.priority === 1) || emergencyContacts[0];

    async function handleToggleStatus() {
        'use server';
        await toggleAdmitCardStatus(params.id);
        revalidatePath(`/admin/exams/admit-cards/${params.id}`);
        redirect(`/admin/exams/admit-cards/${params.id}`);
    }

    // Use helper functions for data transformation
    const formattedAdmitCard = formatAdmitCardData(admitCard);
    const formattedSchedules = formatExamSchedules(schedules);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between print:hidden">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/exams/admit-cards"
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Admit Card</h1>
                        <p className="text-slate-500 mt-1">
                            {formattedAdmitCard.student.name} - {formattedAdmitCard.student.rollNo}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href={`/admin/exams/admit-cards/${params.id}/edit`}
                        className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                        Edit
                    </Link>
                    <form action={handleToggleStatus}>
                        <button
                            type="submit"
                            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${admitCard.status === 'BLOCKED'
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                                }`}
                        >
                            {admitCard.status === 'BLOCKED' ? (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    Unblock
                                </>
                            ) : (
                                <>
                                    <Ban className="w-4 h-4" />
                                    Block
                                </>
                            )}
                        </button>
                    </form>
                    <DownloadButton />
                    <DeleteAdmitCardButton id={params.id} />
                </div>
            </div>

            {/* Status Banner */}
            {admitCard.status === 'BLOCKED' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 print:hidden">
                    <p className="text-red-800 font-semibold">
                        ⚠️ This admit card is currently blocked and cannot be downloaded by the student.
                    </p>
                </div>
            )}

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
