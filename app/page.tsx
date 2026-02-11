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
import MainLanding from '@/components/public/MainLanding';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    const school = await getPublicSchool();

    if (school) {
        const settings = (school.schoolSettings || {}) as any;
        const schoolName = settings.schoolName || school.name;
        const schoolDescription = settings.heroDescription || `Welcome to ${schoolName}. A center for educational excellence.`;
        const schoolImage = settings.logoUrl || school.logo || '/images/school-placeholder.jpg';
        const schoolUrl = `https://${school.subdomain}.genschoolmail.in`;

        return {
            title: schoolName,
            description: schoolDescription,
            icons: {
                icon: settings.logoUrl || school.logo || '/favicon.ico',
            },
            openGraph: {
                title: schoolName,
                description: schoolDescription,
                url: schoolUrl,
                siteName: schoolName,
                images: [
                    {
                        url: schoolImage,
                        width: 800,
                        height: 600,
                        alt: schoolName,
                    },
                ],
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: schoolName,
                description: schoolDescription,
                images: [schoolImage],
            },
            alternates: {
                canonical: schoolUrl,
            }
        };
    }

    // Main Platform (Super Admin)
    const platformTitle = "Gen School Mail - Smart Multi-School Management Software";
    const platformDescription = "A powerful, unified platform for managing multiple schools, admissions, fees, exams, and more. scalable and secure Gen School Mail solution.";
    const platformUrl = "https://genschoolmail.in";
    const platformImage = "/images/platform-hero.jpg";

    return {
        title: platformTitle,
        description: platformDescription,
        keywords: ['Gen School Mail', 'Multi School ERP', 'Education Software', 'Student Information System'],
        openGraph: {
            title: platformTitle,
            description: platformDescription,
            url: platformUrl,
            siteName: 'Gen School Mail',
            images: [
                {
                    url: platformImage,
                    width: 1200,
                    height: 630,
                    alt: 'Gen School Mail Platform',
                },
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: platformTitle,
            description: platformDescription,
            images: [platformImage],
        },
        alternates: {
            canonical: platformUrl,
        }
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
        name: 'Gen School Mail',
        url: 'https://genschoolmail.in',
        logo: 'https://genschoolmail.in/logo.png', // Replace with actual logo URL
        sameAs: [
            // 'https://facebook.com/genschoolmail',
            // 'https://twitter.com/genschoolmail'
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
    return <MainLanding />;
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
