import Link from 'next/link';
import { FileText, Calendar, DollarSign, TrendingUp, BookOpen, Users } from 'lucide-react';

export default function ReportsPage() {
    const reportCards = [
        {
            title: "Attendance Reports",
            description: "View student and staff attendance records, summaries, and trends.",
            icon: <Calendar className="w-8 h-8 text-indigo-600" />,
            href: "/admin/attendance/reports",
            color: "bg-indigo-50 border-indigo-100 text-indigo-600"
        },
        {
            title: "Finance Reports",
            description: "Financial overview, fee collections, pending dues, and expense reports.",
            icon: <DollarSign className="w-8 h-8 text-emerald-600" />,
            href: "/admin/finance", // Linking to finance dashboard for now as it contains reports usually
            color: "bg-emerald-50 border-emerald-100 text-emerald-600"
        },
        {
            title: "Academic Reports",
            description: "Student performance, exam results, and subject-wise analysis.",
            icon: <BookOpen className="w-8 h-8 text-orange-600" />,
            href: "/admin/academics", // Linking to academics dashboard
            color: "bg-orange-50 border-orange-100 text-orange-600"
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Reports & Analytics</h2>
                <p className="text-slate-500 mt-1">Access all system reports and analytics from one place.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reportCards.map((card, index) => (
                    <Link href={card.href} key={index} className="group block">
                        <div className="h-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-all hover:border-indigo-200 dark:hover:border-indigo-800 group-hover:-translate-y-1">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${card.color}`}>
                                {card.icon}
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {card.title}
                            </h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                {card.description}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
