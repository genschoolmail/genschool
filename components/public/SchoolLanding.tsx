'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    GraduationCap, Phone, Mail, Sparkles, Bell,
    ArrowRight, Image as ImageIcon, FileText, Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import AdmissionForm from '@/components/public/AdmissionForm';
import GallerySlideshow from '@/components/public/GallerySlideshow';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import NoticeModal from '@/components/public/NoticeModal';
import Image from 'next/image';

interface SchoolLandingProps {
    school: any;
    publicNotices: any[];
    session: any;
    dashboardUrl: string;
}

export default function SchoolLanding({ school, publicNotices, session, dashboardUrl }: SchoolLandingProps) {
    const settings = school.schoolSettings || school.settings || {};
    const [selectedNotice, setSelectedNotice] = useState<any>(null);

    // Combine CMS Notice and Public Announcements for Marquee
    const marqueeNotices = [...publicNotices];
    if (settings.homepageNoticeEnabled && settings.homepageNotice) {
        marqueeNotices.unshift({
            id: 'cms-notice',
            title: settings.homepageNotice,
            isImportant: true
        });
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans selection:bg-violet-100 selection:text-violet-900 overflow-x-hidden">
            {/* 1. Dynamic Public Notice Marquee */}
            {marqueeNotices.length > 0 && (
                <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white overflow-hidden relative z-[100] border-b border-white/10 shadow-lg">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute w-20 h-20 bg-white/10 rounded-full -top-10 left-1/4 animate-pulse"></div>
                        <div className="absolute w-16 h-16 bg-white/5 rounded-full top-0 right-1/3 animate-pulse delay-300"></div>
                        <div className="absolute w-12 h-12 bg-white/10 rounded-full -bottom-6 right-1/4 animate-pulse delay-150"></div>
                    </div>
                    <div className="container mx-auto px-6 py-2.5 flex items-center justify-center whitespace-nowrap relative z-10">
                        <div className="flex items-center gap-12 animate-marquee hover:pause whitespace-nowrap">
                            {marqueeNotices.map((notice) => (
                                <div key={notice.id} className="flex items-center gap-12">
                                    <span className="flex items-center gap-3 font-black text-xs md:text-sm tracking-wider uppercase">
                                        <Bell className={`w-4 h-4 ${notice.isImportant ? 'text-amber-300 animate-ping' : 'text-emerald-200 animate-bounce'}`} />
                                        {notice.title}
                                    </span>
                                    <span className="w-2 h-2 rounded-full bg-white/30 animate-pulse" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Top Bar */}
            <div className="bg-slate-900 text-slate-300 py-2 text-[11px] font-bold tracking-wider border-b border-slate-800">
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2 hover:text-amber-400 transition-colors cursor-pointer">
                            <Phone className="w-3 h-3 text-amber-500" /> {settings.contactNumber || school.contactPhone || "+91 98765 43210"}
                        </span>
                        <span className="hidden md:flex items-center gap-2 hover:text-amber-400 transition-colors cursor-pointer">
                            <Mail className="w-3 h-3 text-sky-400" /> {settings.email || school.contactEmail || "info@school.edu"}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="hover:text-amber-400 transition-colors uppercase">Staff Portal</Link>
                    </div>
                </div>
            </div>

            {/* 3. Header */}
            <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4 group cursor-pointer">
                        {school.logo ? (
                            <img src={school.logo} alt={school.name} className="w-12 h-12 rounded-2xl object-contain p-1 bg-white shadow-md border border-slate-100" />
                        ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center text-white">
                                <GraduationCap className="w-7 h-7 text-amber-500" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-xl md:text-2xl font-black tracking-tighter text-slate-800 dark:text-white leading-none">{school.name}</h1>
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mt-1">{settings.motto || "Nurturing Future Leaders"}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <nav className="hidden lg:flex items-center space-x-8 text-sm font-bold text-slate-600 dark:text-slate-400">
                            <a href="#enquiry" className="hover:text-amber-600">Admissions</a>
                            <a href="#gallery" className="hover:text-amber-600">Gallery</a>
                            <a href="#notices" className="hover:text-amber-600">Notices</a>
                            <a href="#about" className="hover:text-amber-600">About</a>
                        </nav>
                        <Link href={dashboardUrl} className="px-6 py-2.5 bg-slate-900 dark:bg-amber-500 text-white rounded-2xl font-black text-sm hover:scale-105 transition-all">
                            {session ? 'DASHBOARD' : 'PORTAL LOGIN'}
                        </Link>
                    </div>
                </div>
            </header>

            {/* 4. Hero */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-200/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-200/20 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 animate-pulse delay-300" />

                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-20 items-center relative z-10">
                    <div className="space-y-10 animate-in slide-in-from-left duration-1000">
                        {settings.admissionStatusEnabled && (
                            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-[0.1em] border border-amber-100 animate-bounce">
                                <Sparkles className="w-3 h-3 mr-2" />
                                {settings.admissionText || "Admission Open"}
                            </div>
                        )}
                        <h2 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white leading-[0.95] tracking-tighter animate-in fade-in duration-1000 delay-200">
                            {settings.heroTitle || "Better Future Starts Here."}
                        </h2>
                        <p className="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-lg animate-in fade-in duration-1000 delay-400">
                            {settings.heroDescription || "We provide a holistic learning environment where innovation meets tradition."}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 animate-in slide-in-from-bottom duration-1000 delay-600">
                            <a href="#enquiry" className="group px-10 py-5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 rounded-[28px] font-black text-lg hover:shadow-2xl transition-all duration-300 text-center hover:scale-105 hover:-translate-y-1">
                                <span className="flex items-center justify-center gap-2">
                                    START ENROLMENT
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </a>
                            <a href="#about" className="group px-10 py-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-[28px] font-black text-lg hover:shadow-xl transition-all duration-300 text-center border-2 border-slate-200 dark:border-slate-700 hover:scale-105 hover:-translate-y-1">
                                <span className="flex items-center justify-center gap-2">
                                    LEARN MORE
                                    <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </span>
                            </a>
                        </div>
                    </div>
                    <div className="relative group animate-in slide-in-from-right duration-1000 delay-300">
                        <div className="aspect-[4/5] bg-slate-100 dark:bg-slate-800 rounded-[60px] overflow-hidden border-8 border-white dark:border-slate-700 shadow-3xl rotate-2 group-hover:rotate-0 transition-transform duration-500">
                            {settings.heroImage ? (
                                <img
                                    src={settings.heroImage}
                                    alt="Hero"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">
                                    <GraduationCap className="w-32 h-32 opacity-20 animate-pulse" />
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-amber-400 rounded-3xl shadow-2xl flex items-center justify-center animate-bounce">
                            <span className="text-3xl">🎓</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Stats */}
            <section className="bg-slate-900 py-20 relative overflow-hidden">
                <div className="container mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
                    <StatBox label="Yearly Results" value="100%" />
                    <StatBox label="Total Students" value="2500+" />
                    <StatBox label="Faculty" value="120+" />
                    <StatBox label="Awards Won" value="45" />
                </div>
            </section>

            {/* 6. Admissions / Enquiry - MOVED TO TOP */}
            <section id="enquiry" className="py-32 bg-slate-50 dark:bg-slate-900/50">
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl mx-auto rounded-[60px] overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 shadow-4xl grid md:grid-cols-2">
                        <div className="p-16 lg:p-24 bg-slate-900 text-white">
                            <h3 className="text-4xl font-black mb-6">Join Our Community</h3>
                            <p className="text-slate-400 mb-12">Start your child's journey with us today.</p>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center"><Phone className="text-amber-400" /></div>
                                    <p className="font-bold">{settings.contactNumber || school.contactPhone}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center"><Mail className="text-rose-400" /></div>
                                    <p className="font-bold">{settings.email || school.contactEmail}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <p className="font-bold">{settings.address || school.address || "School Address Not Available"}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-16">
                            <AdmissionForm schoolId={school.id} />
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. Gallery Section */}
            {(() => {
                try {
                    const gallery = settings.galleryJson ? JSON.parse(settings.galleryJson) : [];
                    if (gallery.length > 0) {
                        return (
                            <section id="gallery" className="py-32 bg-white dark:bg-slate-900">
                                <div className="container mx-auto px-6">
                                    <div className="text-center mb-16 animate-in fade-in duration-700">
                                        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider mb-6">
                                            <ImageIcon className="w-3 h-3 mr-2" />
                                            Our Memories
                                        </div>
                                        <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-4">School Gallery</h2>
                                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                                            Capturing moments of learning, growth, and celebration.
                                        </p>
                                    </div>
                                    <GallerySlideshow images={gallery} />
                                </div>
                            </section>
                        );
                    }
                } catch (e) {
                    console.error('Gallery parse error:', e);
                }
                return null;
            })()}

            {/* 8. Notices Section - ALWAYS VISIBLE */}
            <section id="notices" className="py-32 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16 animate-in fade-in duration-700">
                            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider mb-6">
                                <FileText className="w-3 h-3 mr-2" />
                                Latest Updates
                            </div>
                            <h2 className="text-5xl font-black text-slate-900 dark:text-white">Announcements</h2>
                        </div>
                        {publicNotices.length > 0 ? (
                            <div className="space-y-6">
                                {publicNotices.map((notice: any, idx: number) => (
                                    <div
                                        key={notice.id}
                                        onClick={() => setSelectedNotice(notice)}
                                        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl p-8 border-l-4 border-blue-600 hover:shadow-xl transition-all duration-300 animate-in slide-in-from-left cursor-pointer hover:scale-[1.02]"
                                        style={{ animationDelay: `${idx * 100}ms` }}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                                <Bell className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{notice.title}</h3>
                                                <p className="text-slate-700 dark:text-slate-300 mb-3 line-clamp-2">{notice.content}</p>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                        <Calendar className="w-3 h-3" />
                                                        {notice.createdAt ? format(new Date(notice.createdAt), 'MMM dd, yyyy') : 'Date not available'}
                                                    </div>
                                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                                        Click to view full notice →
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                <Bell className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-500 dark:text-slate-400 font-medium">No announcements at the moment</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* 9. About Section */}
            <section id="about" className="py-32 bg-white dark:bg-slate-900">
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16 animate-in fade-in duration-700">
                            <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-4">About {school.name}</h2>
                            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                                Committed to excellence in education and holistic development.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 mb-16">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-[40px] p-10 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-in slide-in-from-bottom duration-700">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Our Mission</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    To provide quality education that empowers students to achieve their full potential through innovative teaching and holistic development.
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-[40px] p-10 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-in slide-in-from-bottom duration-700 delay-100">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Our Vision</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Creating future leaders who are intellectually curious, socially responsible, and emotionally intelligent global citizens.
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-[40px] p-10 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-in slide-in-from-bottom duration-700 delay-200">
                                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Our Values</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Excellence, integrity, respect, innovation, and collaboration form the foundation of everything we do.
                                </p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-[60px] p-12 md:p-16 shadow-xl animate-in fade-in duration-700 delay-300 border border-slate-200 dark:border-slate-700">
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                                    {school.name} is committed to providing quality education and holistic development for every child. Our experienced faculty, modern infrastructure, and student-centric approach make us a preferred choice for parents seeking the best for their children.
                                </p>
                                <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                                    We offer a comprehensive curriculum that balances academics with extracurricular activities, ensuring students develop intellectually, socially, and emotionally. Our state-of-the-art facilities and innovative teaching methods create an environment where learning is both engaging and effective.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="py-20 border-t border-slate-200 dark:border-slate-800 bg-slate-900 text-white">
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-12 mb-12">
                        <div className="md:col-span-2">
                            <h3 className="text-2xl font-black mb-4">{school.name}</h3>
                            <p className="text-slate-400 mb-6">Empowering students to achieve excellence through quality education.</p>
                            {school.logo && (
                                <img src={school.logo} alt={school.name} className="w-32 h-auto" />
                            )}
                        </div>
                        <div>
                            <h4 className="font-black text-amber-400 mb-4 uppercase tracking-wider text-sm">Quick Links</h4>
                            <ul className="space-y-3 text-slate-400">
                                <li><a href="#enquiry" className="hover:text-amber-400 transition-colors">Admissions</a></li>
                                <li><a href="#gallery" className="hover:text-amber-400 transition-colors">Gallery</a></li>
                                <li><a href="#notices" className="hover:text-amber-400 transition-colors">Notices</a></li>
                                <li><a href="#about" className="hover:text-amber-400 transition-colors">About Us</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-black text-amber-400 mb-4 uppercase tracking-wider text-sm">Legal</h4>
                            <ul className="space-y-3 text-slate-400">
                                <li><a href="#privacy" className="hover:text-amber-400 transition-colors">Privacy Notice</a></li>
                                <li><a href="#terms" className="hover:text-amber-400 transition-colors">Terms of Service</a></li>
                                <li><Link href="/login" className="hover:text-amber-400 transition-colors">Staff Portal</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 pt-8 text-center">
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">
                            &copy; {new Date().getFullYear()} {school.name}. All Rights Reserved.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Notice Modal */}
            {selectedNotice && (
                <NoticeModal
                    notice={selectedNotice}
                    onClose={() => setSelectedNotice(null)}
                />
            )}
        </div>
    );
}

function StatBox({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-2">
            <div className="text-4xl font-black text-amber-500">{value}</div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</p>
        </div>
    );
}
