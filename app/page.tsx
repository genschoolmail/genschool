import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getPublicSchool, getSubdomain } from '@/lib/tenant';
import { getAnnouncements } from '@/lib/actions/announcement-actions';
import {
    GraduationCap, Users, Shield, Sparkles,
    ArrowRight, Globe, Zap
} from 'lucide-react';
import SchoolLanding from '@/components/public/SchoolLanding';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    const school = await getPublicSchool();

    if (school) {
        const settings = (school.schoolSettings || {}) as any;
        return {
            title: settings.schoolName || school.name,
            description: settings.heroDescription || `Welcome to ${school.name}`,
            icons: {
                icon: settings.logoUrl || school.logo || '/favicon.ico',
            }
        };
    }

    return {
        title: "SchoolERP - Modern School Management System",
        description: "The unified platform to manage every aspect of your school, from admissions to finance, powered by robust multi-tenancy.",
    };
}

export default async function Home({ searchParams }: { searchParams: { preview?: string } }) {
    const session = await auth();
    const subdomain = getSubdomain();

    // 1. Fetch School-specific data if on a subdomain
    const school = await getPublicSchool();
    const publicNotices = school ? await getAnnouncements({ isPublic: true, schoolId: school.id }) : [];

    // 2. Dashboard Redirect Logic
    if (session?.user && searchParams.preview !== 'true') {
        const role = (session.user as any).role;
        const userSubdomain = (session.user as any).subdomain;

        // If user has a subdomain but is on the root domain, redirect them to their subdomain dashboard
        // This handles cases where they might land on root after a partial signout or direct navigation
        if (userSubdomain && !subdomain && role !== 'SUPER_ADMIN') {
            const isLocalhost = process.env.NODE_ENV === 'development' || !process.env.VERCEL_URL;
            const domain = isLocalhost ? 'localhost:3000' : 'platform.com'; // Replace with env var if available
            const protocol = isLocalhost ? 'http' : 'https';
            redirect(`${protocol}://${userSubdomain}.${domain}/${role.toLowerCase().replace('_', '-')}`);
        }

        const roleRedirects: Record<string, string> = {
            'SUPER_ADMIN': '/super-admin',
            'ADMIN': '/admin',
            'TEACHER': '/teacher',
            'STUDENT': '/student',
            'DRIVER': '/driver',
            'ACCOUNTANT': '/admin/finance' // Accountant dashboard
        };

        // Only redirect if the path is valid for the role
        const targetPath = roleRedirects[role];
        if (targetPath) {
            redirect(targetPath);
        }
    }

    const dashboardUrl = session?.user ? (
        {
            'SUPER_ADMIN': '/super-admin',
            'ADMIN': '/admin',
            'TEACHER': '/teacher',
            'STUDENT': '/student',
            'DRIVER': '/driver',
            'ACCOUNTANT': '/admin/finance'
        }[(session.user as any).role as string] || '/login'
    ) : '/login';

    // JSON-LD Structured Data
    const jsonLd = school ? {
        '@context': 'https://schema.org',
        '@type': 'School',
        name: school.name,
        image: school.logo,
        description: school.schoolSettings?.heroDescription || `Welcome to ${school.name}`,
        address: {
            '@type': 'PostalAddress',
            streetAddress: school.address,
            // Add more address fields if available in your schema/settings
        },
        telephone: school.contactPhone,
        email: school.contactEmail,
        url: `https://${school.subdomain}.genschoolmail.in`, // Dynamically get base domain ideally
    } : {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'SchoolERP',
        url: 'https://genschoolmail.in',
        logo: 'https://genschoolmail.in/logo.png', // Replace with actual logo URL
        sameAs: [
            // 'https://facebook.com/schoolerp',
            // 'https://twitter.com/schoolerp'
        ]
    };

    // 3. Render School Specific Landing Page if on subdomain
    if (school) {
        return (
            <>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                <SchoolLanding
                    school={school}
                    publicNotices={publicNotices}
                    session={session}
                    dashboardUrl={dashboardUrl}
                />
            </>
        );
    }

    // 4. Default SaaS Platform Homepage (Root Domain)
    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-black text-slate-900">
                            School<span className="text-indigo-600">ERP</span>
                        </span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Link href="/login" className="font-bold text-slate-600 hover:text-indigo-600 px-4 py-2 rounded-xl transition-colors">
                            {session ? 'Dashboard' : 'Sign In'}
                        </Link>
                        {!session && (
                            <Link href="/login" className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg">
                                Get Started
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 pt-48 pb-32 text-center container mx-auto px-6">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Enterprise Multi-Tenant SaaS</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
                        Built for <span className="text-indigo-600">Modern</span> Education.
                    </h1>
                    <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                        The unified platform to manage every aspect of your school, from admissions to finance, powered by robust multi-tenancy.
                    </p>
                    <div className="flex justify-center gap-4 pt-4">
                        <Link href="/login" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-200 flex items-center gap-2">
                            Explore Platform <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-32 max-w-5xl mx-auto">
                    <StatCard icon={<Users className="text-indigo-600" />} label="Students Tracked" value="150K+" />
                    <StatCard icon={<Globe className="text-blue-600" />} label="Cities" value="500+" />
                    <StatCard icon={<Zap className="text-amber-600" />} label="Performance" value="99.9%" />
                    <StatCard icon={<Shield className="text-emerald-600" />} label="Security" value="AES-256" />
                </div>
            </main>

            {/* Bottom Proof */}
            <section className="bg-slate-900 py-32 text-center text-white">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl font-black mb-8">One Platform. Zero Complexity.</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto mb-16">
                        We handle the scaling and security so you can focus on educating the next generation.
                    </p>
                </div>
            </section>
        </div>
    );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">{icon}</div>
            <div>
                <div className="text-2xl font-black text-slate-900">{value}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</div>
            </div>
        </div>
    );
}
