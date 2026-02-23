import { prisma } from '@/lib/prisma';
import { createInquiry } from '@/lib/cms-actions';
import { GraduationCap, Mail, Phone, MapPin, Send, Users, BookOpen, Award, Bell } from 'lucide-react';
import Link from 'next/link';

import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

// Extract subdomain from host header
async function getSchoolBySubdomain() {
    const headersList = await headers();
    const host = headersList.get('host') || '';

    // Example: successmission.genschoolmail.in -> successmission
    const subdomain = host.split('.')[0];

    console.log(`[PublicPage] host=${host}, subdomain=${subdomain}`);

    // If it's a localhost or main domain, we might need a fallback or test value
    if (host.includes('localhost') || host === process.env.BASE_DOMAIN) {
        return await prisma.school.findFirst({
            where: { status: 'ACTIVE' },
            include: {
                subscription: { include: { plan: true } },
                schoolSettings: true
            }
        });
    }

    return await prisma.school.findUnique({
        where: { subdomain },
        include: {
            subscription: { include: { plan: true } },
            schoolSettings: true
        }
    });
}

export default async function PublicSchoolPage() {
    const school = await getSchoolBySubdomain();

    if (!school) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">School Not Found</h1>
                    <p className="text-slate-500">This domain is not configured.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Notice Board Banner */}
            {school.schoolSettings?.homepageNoticeEnabled && school.schoolSettings?.homepageNotice && (
                <div className="bg-indigo-600 text-white py-3 px-6 text-center">
                    <div className="container mx-auto flex items-center justify-center gap-3">
                        <Bell className="w-5 h-5 animate-bounce" />
                        <span className="font-medium">{school.schoolSettings.homepageNotice}</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-slate-800 leading-none">{school.name}</span>
                            {school.schoolSettings?.admissionStatusEnabled && (
                                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mt-1">
                                    {school.schoolSettings.admissionText || "Admissions Open"}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <a href="#admissions" className="hidden md:block text-slate-600 hover:text-indigo-600 font-medium transition-colors">
                            Admissions
                        </a>
                        <Link href="/login" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-bold">
                            Login
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <section
                className="relative container mx-auto px-6 py-24 md:py-32 overflow-hidden"
                style={school.schoolSettings?.heroImage ? {
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${school.schoolSettings.heroImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    color: 'white'
                } : {}}
            >
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h1 className={`text-4xl md:text-6xl font-extrabold mb-6 ${!school.schoolSettings?.heroImage ? 'text-slate-900' : 'text-white'}`}>
                        {school.schoolSettings?.heroTitle || `Welcome to ${school.name}`}
                    </h1>
                    <p className={`text-lg md:text-2xl mb-10 max-w-2xl mx-auto leading-relaxed ${!school.schoolSettings?.heroImage ? 'text-slate-600' : 'text-slate-100'}`}>
                        {school.schoolSettings?.heroDescription || "Excellence in Education • Shaping Future Leaders • Building Strong Foundations"}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="#admissions" className="px-10 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-xl hover:shadow-indigo-500/20 active:scale-95">
                            Apply for Admission
                        </a>
                        <a href="#about" className={`px-10 py-4 border-2 rounded-xl font-bold transition-all active:scale-95 ${!school.schoolSettings?.heroImage ? 'border-slate-300 text-slate-700 hover:bg-slate-100' : 'border-white/30 text-white hover:bg-white/10'}`}>
                            Learn More
                        </a>
                    </div>
                </div>

                {/* Decorative Gradient if no Image (keep it aesthetic) */}
                {!school.schoolSettings?.heroImage && (
                    <div className="absolute top-0 right-0 -z-10 w-64 h-64 bg-indigo-200/30 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                )}
            </section>

            {/* Stats */}
            <section className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <StatCard icon={<Users />} label="Students Enrolled" value="500+" />
                    <StatCard icon={<BookOpen />} label="Courses Offered" value="50+" />
                    <StatCard icon={<Award />} label="Years of Excellence" value="25+" />
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="container mx-auto px-6 py-20">
                <div className="max-w-4xl mx-auto bg-white rounded-3xl p-12 shadow-xl">
                    <h2 className="text-3xl font-bold text-slate-800 mb-6">About Our School</h2>
                    <p className="text-lg text-slate-600 leading-relaxed mb-6">
                        {school.name} is committed to providing quality education and holistic development.
                        Our experienced faculty, modern infrastructure, and student-centric approach make us
                        a preferred choice for parents seeking the best for their children.
                    </p>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        We offer a comprehensive curriculum that balances academics with extracurricular activities,
                        ensuring that students develop not just intellectually but also socially and emotionally.
                    </p>
                </div>
            </section>

            {/* Admissions Inquiry Form */}
            <section id="admissions" className="container mx-auto px-6 py-20">
                <div className="max-w-2xl mx-auto bg-white rounded-3xl p-12 shadow-xl">
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Admission Inquiry</h2>
                    <p className="text-slate-500 mb-8">Fill out the form below and our team will get back to you.</p>

                    <form action={createInquiry} className="space-y-5">
                        <input type="hidden" name="schoolId" value={school.id} />

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                            <input
                                type="text"
                                name="name"
                                required
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Enter student's name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                            <input
                                type="email"
                                name="email"
                                required
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="parent@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number *</label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="+91 98765 43210"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                            <textarea
                                name="message"
                                rows={4}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Tell us about your child's grade, any special requirements..."
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full px-6 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Send className="w-5 h-5" />
                            Submit Inquiry
                        </button>
                    </form>
                </div>
            </section>

            {/* Gallery Section */}
            {school.schoolSettings?.galleryJson && JSON.parse(school.schoolSettings.galleryJson).length > 0 && (
                <section id="gallery" className="container mx-auto px-6 py-20 bg-white rounded-3xl my-20 shadow-sm border border-slate-100">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-800 mb-4">School Memories</h2>
                        <div className="w-20 h-1 bg-indigo-600 mx-auto rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {JSON.parse(school.schoolSettings.galleryJson).map((item: any, idx: number) => (
                            <div key={idx} className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 hover:shadow-xl transition-all duration-300">
                                <img
                                    src={item.url}
                                    alt={item.caption || "School Memory"}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                {item.caption && (
                                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-sm font-medium">{item.caption}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Contact Information */}
            <section className="bg-slate-900 text-white py-16">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
                        <ContactItem
                            icon={<MapPin />}
                            title="Address"
                            info="123 Education Street, City, State"
                        />
                        <ContactItem
                            icon={<Phone />}
                            title="Phone"
                            info={school.contactPhone || "+91 98765 43210"}
                        />
                        <ContactItem
                            icon={<Mail />}
                            title="Email"
                            info={school.contactEmail || "info@school.com"}
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 text-slate-400 py-8">
                <div className="container mx-auto px-6 text-center">
                    <p>&copy; 2025 {school.name}. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="inline-flex p-4 bg-indigo-100 text-indigo-600 rounded-xl mb-4">
                {icon}
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-2">{value}</div>
            <div className="text-sm text-slate-500">{label}</div>
        </div>
    );
}

function ContactItem({ icon, title, info }: { icon: React.ReactNode; title: string; info: string }) {
    return (
        <div className="text-center">
            <div className="inline-flex p-3 bg-slate-800 rounded-xl mb-3 text-indigo-400">
                {icon}
            </div>
            <div className="font-semibold mb-1">{title}</div>
            <div className="text-slate-400 text-sm">{info}</div>
        </div>
    );
}
