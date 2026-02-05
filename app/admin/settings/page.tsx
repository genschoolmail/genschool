import Link from 'next/link';
import {
    School, Calendar, CreditCard, Shield, Settings,
    Palette, Upload, Key, UserCog, GraduationCap,
    Database, FileCheck, Globe
} from 'lucide-react';

export default function AdminSettingsDashboard() {
    const modules = [
        {
            title: "Profile Settings",
            description: "Manage your account, password, and contact info",
            icon: <UserCog className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
            href: "/admin/settings/profile",
            color: "bg-blue-50 dark:bg-blue-900/20"
        },
        {
            title: "School Information",
            description: "Update school details, logos, and contact info",
            icon: <School className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
            href: "/admin/settings/school-info",
            color: "bg-indigo-50 dark:bg-indigo-900/20"
        },
        {
            title: "Academic Years",
            description: "Manage academic sessions and terms",
            icon: <Calendar className="w-8 h-8 text-green-600 dark:text-green-400" />,
            href: "/admin/settings/academic-years",
            color: "bg-green-50 dark:bg-green-900/20"
        },
        {
            title: "Online Payments & Payouts",
            description: "Monitor student payments and bank settlements",
            icon: <CreditCard className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />,
            href: "/admin/settings/payouts",
            color: "bg-emerald-50 dark:bg-emerald-900/20"
        },
        {
            title: "Class & Sections",
            description: "Manage class structure and sections",
            icon: <GraduationCap className="w-8 h-8 text-purple-600 dark:text-purple-400" />,
            href: "/admin/settings/class-sections",
            color: "bg-purple-50 dark:bg-purple-900/20"
        },
        {
            title: "Promotion Rules",
            description: "Set criteria for student promotion",
            icon: <FileCheck className="w-8 h-8 text-orange-600 dark:text-orange-400" />,
            href: "/admin/settings/promotion-rules",
            color: "bg-orange-50 dark:bg-orange-900/20"
        },
        {
            title: "Signatures",
            description: "Upload digital signatures for documents",
            icon: <Upload className="w-8 h-8 text-teal-600 dark:text-teal-400" />,
            href: "/admin/settings/signatures",
            color: "bg-teal-50 dark:bg-teal-900/20"
        },
        {
            title: "Data Management",
            description: "Bulk import/export student data with files",
            icon: <Database className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />,
            href: "/admin/settings/data-management",
            color: "bg-cyan-50 dark:bg-cyan-900/20"
        },
        {
            title: "Website Management",
            description: "Customize school landing page & memories",
            icon: <Globe className="w-8 h-8 text-orange-600 dark:text-orange-400" />,
            href: "/admin/settings/website",
            color: "bg-orange-50 dark:bg-orange-900/20"
        },
        {
            title: "Theme Compliance",
            description: "Customize application appearance",
            icon: <Palette className="w-8 h-8 text-pink-600 dark:text-pink-400" />,
            href: "/admin/settings/theme",
            color: "bg-pink-50 dark:bg-pink-900/20"
        },
        {
            title: "System Settings",
            description: "General system configurations",
            icon: <Settings className="w-8 h-8 text-slate-600 dark:text-slate-400" />,
            href: "/admin/settings/system",
            color: "bg-slate-50 dark:bg-slate-900/20"
        },
        {
            title: "App Updates",
            description: "Check for system updates",
            icon: <Database className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />,
            href: "/admin/settings/app-updates",
            color: "bg-cyan-50 dark:bg-cyan-900/20"
        },
        {
            title: "KYC & Verification",
            description: "Upload documents for school verification",
            icon: <FileCheck className="w-8 h-8 text-rose-600 dark:text-rose-400" />,
            href: "/admin/settings/kyc",
            color: "bg-rose-50 dark:bg-rose-900/20"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Manage all system configurations and preferences</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {modules.map((module, index) => (
                        <Link
                            key={index}
                            href={module.href}
                            className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-slate-100 dark:border-slate-700/50 overflow-hidden"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl ${module.color} transition-colors duration-300`}>
                                    {module.icon}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {module.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                        {module.description}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
