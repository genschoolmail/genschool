'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    GraduationCap, Users, Shield, Sparkles, ArrowRight,
    Globe, Zap, CheckCircle2, BarChart3, School,
    Bus, BookOpen, Calculator, UserCog, CalendarClock,
    LayoutDashboard, Lock, Mail, Phone, Menu, X
} from 'lucide-react';
import TrialEnquiryModal from './TrialEnquiryModal';

export default function MainLanding() {
    const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-amber-50/50 font-sans selection:bg-amber-100 selection:text-amber-900 overflow-x-hidden">
            <TrialEnquiryModal isOpen={isEnquiryOpen} onClose={() => setIsEnquiryOpen(false)} />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-amber-100/50 shadow-sm">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-black text-slate-900 tracking-tight">
                            Gen School<span className="text-amber-600">Mail</span>
                        </span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link href="tel:+917759958909" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-amber-600 transition-colors">
                            <Phone className="w-4 h-4" /> +91 7759958909
                        </Link>
                        <Link href="/login" className="font-bold text-slate-600 hover:text-amber-600 px-4 py-2 rounded-xl transition-colors">
                            Login
                        </Link>
                        <button
                            onClick={() => setIsEnquiryOpen(true)}
                            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                        >
                            Start Free Trial
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 p-4 flex flex-col gap-4 shadow-xl">
                        <Link href="/login" className="font-bold text-slate-600 py-2">Login</Link>
                        <button
                            onClick={() => { setIsEnquiryOpen(true); setIsMobileMenuOpen(false); }}
                            className="w-full py-3 bg-amber-500 text-white rounded-xl font-bold"
                        >
                            Start Free Trial
                        </button>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-200/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center space-x-2 bg-white border border-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 hover:scale-105 transition-transform cursor-default">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>India's Best Value School ERP</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 leading-[1.05] tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        Smart Management. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600">
                            Brighter Future.
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-600 font-medium max-w-3xl mx-auto leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        The all-in-one School Management Software that simplifies your campus operations.
                        <span className="block mt-2 text-amber-600 font-bold">Manage Admissions, Fees, Exams & More with Ease.</span>
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                        <button
                            onClick={() => setIsEnquiryOpen(true)}
                            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl font-bold text-lg hover:from-amber-600 hover:to-orange-700 shadow-xl shadow-orange-200 flex items-center justify-center gap-2 hover:scale-105 transition-all active:scale-95"
                        >
                            Get Started Now <ArrowRight className="w-5 h-5" />
                        </button>
                        <Link href="#features" className="px-8 py-4 bg-white text-slate-700 border-2 border-slate-100 rounded-2xl font-bold text-lg hover:bg-slate-50 hover:border-slate-200 shadow-lg flex items-center justify-center gap-2 hover:scale-105 transition-all">
                            View Features
                        </Link>
                    </div>

                    {/* Dashboard Preview / Mockup */}
                    <div className="mt-20 relative mx-auto max-w-5xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 hover:scale-[1.01] transition-transform duration-500">
                        <div className="bg-slate-900 rounded-[2.5rem] p-3 md:p-4 shadow-2xl border-[6px] border-slate-200 shadow-amber-200/50">
                            <div className="bg-slate-800 rounded-2xl overflow-hidden aspect-[16/9] relative group">
                                {/* Abstract UI Placeholder */}
                                <div className="absolute inset-0 bg-white flex">
                                    {/* Sidebar */}
                                    <div className="w-64 border-r border-slate-100 bg-slate-50 p-6 flex flex-col gap-4 hidden md:flex">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-8 h-8 bg-amber-500 rounded-lg"></div>
                                            <div className="h-4 w-24 bg-slate-200 rounded-md"></div>
                                        </div>
                                        <div className="space-y-3">
                                            {[1, 2, 3, 4, 5, 6].map(i => (
                                                <div key={i} className="h-10 w-full bg-white border border-slate-200 rounded-xl shadow-sm" />
                                            ))}
                                        </div>
                                    </div>
                                    {/* Content */}
                                    <div className="flex-1 p-8 bg-white overflow-hidden">
                                        <div className="flex justify-between items-center mb-8">
                                            <div className="h-8 w-48 bg-slate-100 rounded-lg" />
                                            <div className="flex gap-4">
                                                <div className="h-10 w-10 bg-purple-100 rounded-full" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-6 mb-8">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-32 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-100 shadow-sm" />
                                            ))}
                                        </div>
                                        <div className="h-64 bg-slate-50 rounded-2xl border border-slate-100" />
                                    </div>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                                    <p className="bg-white/90 px-6 py-3 rounded-full text-slate-800 font-bold text-xl shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                                        Modern & Intuitive Dashboard
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Floating Badges */}
                        <div className="absolute -right-12 top-20 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce hidden lg:flex border border-slate-100">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center rotate-3">
                                <CheckCircle2 className="w-7 h-7" />
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Uptime</div>
                                <div className="text-xl font-black text-slate-800">99.99%</div>
                            </div>
                        </div>
                        <div className="absolute -left-12 bottom-20 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce delay-700 hidden lg:flex border border-slate-100">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center -rotate-3">
                                <Users className="w-7 h-7" />
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Users</div>
                                <div className="text-xl font-black text-slate-800">50K+</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Features Grid */}
            <section id="features" className="py-32 bg-white relative">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <div className="inline-block px-4 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-purple-100">
                            Everything You Need
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
                            Power-Packed Features. <br />
                            <span className="text-amber-500">Unbeatable Price.</span>
                        </h2>
                        <p className="text-lg text-slate-500 leading-relaxed">
                            Gen School Mail is designed to run your entire institution smoothly.
                            From attendance to results, we've got you covered.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<School />}
                            title="Multi-School Management"
                            description="Manage multiple branches from a single Super Admin panel. Centralized control with isolated data for each school."
                            color="indigo"
                        />
                        <FeatureCard
                            icon={<UserCog />}
                            title="Admission & Enquiries"
                            description="Streamline the entire admission process from enquiry to enrollment. Online forms, document management, and automated follow-ups."
                            color="blue"
                        />
                        <FeatureCard
                            icon={<Calculator />}
                            title="Fee & Finance Management"
                            description="Automated fee collection, receipt generation, diverse fee structures, and comprehensive financial reporting. Never miss a payment."
                            color="green"
                        />
                        <FeatureCard
                            icon={<BookOpen />}
                            title="Examination & Results"
                            description="Create exam schedules, manage grading systems, and generate automated report cards with a single click. detailed performance analytics."
                            color="purple"
                        />
                        <FeatureCard
                            icon={<Bus />}
                            title="Transport & Tracking"
                            description="Manage fleet details, routes, drivers, and fees. Ensure student safety with organized transport management."
                            color="orange"
                        />
                        <FeatureCard
                            icon={<BarChart3 />}
                            title="Library Management"
                            description="Complete cataloging of books, issue/return tracking, and barcode support. Digitalize your school library."
                            color="teal"
                        />
                        <FeatureCard
                            icon={<Users />}
                            title="HR & Payroll"
                            description="Manage staff attendance, leave requests, and automated payroll processing including tax deductions and payslips."
                            color="rose"
                        />
                        <FeatureCard
                            icon={<CalendarClock />}
                            title="Smart Attendance"
                            description="Bio-metric integration or manual attendance for students and staff. Instant SMS/App notifications to parents."
                            color="cyan"
                        />
                        <FeatureCard
                            icon={<Lock />}
                            title="Secure Role Access"
                            description="Secure access control for Admins, Teachers, Accountants, Students, and Parents. Everyone sees only what they need."
                            color="slate"
                        />
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-32 bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                {/* Decoration */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-12">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                                    Why Top Schools Trust <br />
                                    <span className="text-amber-400">Gen School Mail?</span>
                                </h2>
                                <p className="text-slate-400 text-lg">
                                    We provide a reliable, secure, and easy-to-use platform that helps you focus on education, not administration.
                                </p>
                            </div>

                            <div className="space-y-8">
                                <BenefitRow
                                    icon={<Zap className="text-amber-400" />}
                                    title="Lightning Fast Performance"
                                    description="Works smoothly even on slow internet connections. No loading screens, no waiting."
                                />
                                <BenefitRow
                                    icon={<Shield className="text-emerald-400" />}
                                    title="Secure & Reliable"
                                    description="Your data is 100% safe. We use advanced security measures and automatic backups to keep your records protected."
                                />
                                <BenefitRow
                                    icon={<LayoutDashboard className="text-blue-400" />}
                                    title="User-Friendly Interface"
                                    description="No technical training required. Our intuitive design ensures staff, teachers, and parents can use it from Day 1."
                                />
                                <BenefitRow
                                    icon={<Globe className="text-purple-400" />}
                                    title="Accessible Anywhere"
                                    description="Cloud-based solution accessible 24/7 from any device - Laptop, Tablet, or Smartphone."
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-[3rem] rotate-3 blur-md opacity-40 animate-pulse"></div>
                            <div className="relative bg-slate-800 rounded-[3rem] p-8 sm:p-12 border border-slate-700 shadow-2xl space-y-8 text-center hover:scale-[1.02] transition-transform duration-500">
                                <div className="text-center">
                                    <h3 className="text-3xl font-black mb-2 text-white">Contact for Best Pricing</h3>
                                    <p className="text-slate-400">Customized plans for your school's needs.</p>
                                </div>

                                <div className="py-6 border-t border-b border-slate-700 space-y-4">
                                    <div className="flex items-center justify-center gap-3 text-xl font-bold text-amber-400">
                                        <Phone className="w-6 h-6" /> +91 7759958909
                                    </div>
                                    <div className="flex items-center justify-center gap-3 text-lg font-medium text-slate-300">
                                        <Mail className="w-5 h-5" /> gautamdss3@gmail.com
                                    </div>
                                </div>

                                <div className="space-y-3 text-left pl-4 max-w-xs mx-auto">
                                    <CheckItem text="All Modules Included" />
                                    <CheckItem text="Unlimited Users" />
                                    <CheckItem text="Free Onboarding & Training" />
                                    <CheckItem text="24/7 Priority Support" />
                                </div>

                                <button
                                    onClick={() => setIsEnquiryOpen(true)}
                                    className="block w-full py-4 bg-white text-slate-900 rounded-xl font-bold text-center hover:bg-amber-50 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                                >
                                    Enquire Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                <div className="container mx-auto px-6 relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black mb-8">Ready to Transform Your School?</h2>
                    <p className="text-xl text-orange-100 max-w-2xl mx-auto mb-12 font-medium">
                        Join hundreds of forward-thinking schools using Gen School Mail to deliver better education management.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            onClick={() => setIsEnquiryOpen(true)}
                            className="px-10 py-5 bg-white text-orange-600 rounded-2xl font-bold text-xl hover:shadow-2xl hover:scale-105 transition-all active:scale-95"
                        >
                            Start Free Trial
                        </button>
                    </div>
                    <p className="mt-8 text-sm text-orange-100 font-medium opacity-80">Simple Setup • Cancel anytime</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">
                            Gen School<span className="text-amber-500">Mail</span>
                        </span>
                    </div>
                    <div className="text-center md:text-right">
                        <p className="font-bold text-white mb-1">Contact Us</p>
                        <p>+91 7759958909</p>
                        <p>gautamdss3@gmail.com</p>
                    </div>
                    <div className="text-sm font-medium">
                        &copy; {new Date().getFullYear()} Gen School Mail. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode; title: string; description: string; color: string }) {
    // Simplified color map for cleaner look
    const colorClasses: Record<string, string> = {
        indigo: "text-indigo-600 bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white",
        blue: "text-blue-600 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white",
        green: "text-emerald-600 bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white",
        purple: "text-purple-600 bg-purple-50 group-hover:bg-purple-600 group-hover:text-white",
        orange: "text-orange-600 bg-orange-50 group-hover:bg-orange-600 group-hover:text-white",
        teal: "text-teal-600 bg-teal-50 group-hover:bg-teal-600 group-hover:text-white",
        rose: "text-rose-600 bg-rose-50 group-hover:bg-rose-600 group-hover:text-white",
        cyan: "text-cyan-600 bg-cyan-50 group-hover:bg-cyan-600 group-hover:text-white",
        slate: "text-slate-600 bg-slate-50 group-hover:bg-slate-600 group-hover:text-white",
    };

    return (
        <div className="group bg-white hover:bg-amber-50/30 p-8 rounded-[2rem] border border-slate-100 hover:border-amber-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 ${colorClasses[color]}`}>
                <div className="[&>svg]:w-7 [&>svg]:h-7">{icon}</div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-amber-600 transition-colors">{title}</h3>
            <p className="text-slate-500 leading-relaxed font-medium group-hover:text-slate-600">{description}</p>
        </div>
    );
}

function BenefitRow({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="flex gap-4">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-700 shadow-inner group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div>
                <h4 className="text-xl font-bold text-white mb-2">{title}</h4>
                <p className="text-slate-400 leading-relaxed">{description}</p>
            </div>
        </div>
    );
}

function CheckItem({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-slate-300 font-medium">{text}</span>
        </div>
    );
}
