import { getAcademicYear } from '@/lib/actions/academic-year';
import { prisma } from '@/lib/prisma';
import { ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import PromotionWizard from './PromotionWizard';

export default async function BulkPromotionPage({ params }: { params: { id: string } }) {
    const academicYear = await getAcademicYear(params.id);

    if (!academicYear) {
        redirect('/admin/settings/academic-years');
    }

    // Get all classes for selection
    const classes = await prisma.class.findMany({
        orderBy: [
            { name: 'asc' },
            { section: 'asc' }
        ],
        select: {
            id: true,
            name: true,
            section: true,
            _count: {
                select: { students: true }
            }
        }
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href={`/admin/settings/academic-years/${params.id}`}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Users className="w-8 h-8 text-indigo-600" />
                        Bulk Student Promotion
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Academic Year: <span className="font-semibold">{academicYear.name}</span>
                    </p>
                </div>
            </div>

            {/* Promotion Wizard */}
            <PromotionWizard
                classes={classes}
                academicYear={academicYear.name}
            />
        </div>
    );
}
