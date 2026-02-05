import { getAcademicYear, getAcademicYears } from '@/lib/actions/academic-year';
import { ArrowLeft, Copy } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import DataCarryForwardForm from './DataCarryForwardForm';

export default async function DataCarryForwardPage({ params }: { params: { id: string } }) {
    const toAcademicYear = await getAcademicYear(params.id);
    const allYears = await getAcademicYears();

    if (!toAcademicYear) {
        redirect('/admin/settings/academic-years');
    }

    // Get previous years
    const previousYears = allYears.filter(year =>
        new Date(year.startDate) < new Date(toAcademicYear.startDate)
    );

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
                        <Copy className="w-8 h-8 text-blue-600" />
                        Data Carry Forward
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Copy to: <span className="font-semibold">{toAcademicYear.name}</span>
                    </p>
                </div>
            </div>

            {/* Form */}
            <DataCarryForwardForm
                toYearId={params.id}
                toYearName={toAcademicYear.name}
                previousYears={previousYears}
            />
        </div>
    );
}
