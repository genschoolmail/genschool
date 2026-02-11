'use client';

import Link from 'next/link';
import {
    GraduationCap, Users, Shield, Sparkles, ArrowRight,
    Globe, Zap, CheckCircle2, BarChart3, School,
    Bus, BookOpen, Calculator, UserCog, CalendarClock,
    LayoutDashboard, Lock
} from 'lucide-react';

export default function MainLanding() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-black text-slate-900 tracking-tight">
                            Gen School<span className="text-indigo-600">Mail</span>
                        </span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Link href="/login" className="hidden md:block font-bold text-slate-600 hover:text-indigo-600 px-4 py-2 rounded-xl transition-colors">
                            Login
                        </Link>
                        <Link href="/login" className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-100/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-100/50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center space-x-2 bg-white border border-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>India's Most Affordable School ERP</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 leading-[1.05] tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        Manage Your School <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                            Create Future Leaders
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        The all-in-one School Management Software that streamlines Administration,
                        Finance, Academics, and Communication.
                        <span className="block mt-2 text-indigo-600 font-bold">High Features. Low Cost. Unmatched Speed.</span>
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                        <Link href="/login" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 hover:scale-105 transition-all">
                            Start Free Trial <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link href="#features" className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 shadow-lg flex items-center justify-center gap-2 hover:scale-105 transition-all">
                            View Features
                        </Link>
                    </div>

                    {/* Dashboard Preview / Mockup */}
                    <div className="mt-20 relative mx-auto max-w-5xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
                        <div className="bg-slate-900 rounded-[2rem] p-4 shadow-2xl border-4 border-slate-200/50">
                            <div className="bg-slate-800 rounded-2xl overflow-hidden aspect-[16/9] relative group">
                                {/* Abstract UI Placeholder */}
                                <div className="absolute inset-0 bg-slate-900 flex">
                                    {/* Sidebar */}
                                    <div className="w-64 border-r border-slate-700 p-4 flex flex-col gap-4 hidden md:flex">
                                        <div className="h-8 w-32 bg-slate-700 rounded-lg animate-pulse" />
                                        <div className="space-y-2 mt-4">
                                            {[1, 2, 3, 4, 5, 6].map(i => (
                                                <div key={i} className="h-10 w-full bg-slate-800 rounded-lg" />
                                            ))}
                                        </div>
                                    </div>
                                    {/* Content */}
                                    <div className="flex-1 p-8">
                                        <div className="flex justify-between items-center mb-8">
                                            <div className="h-8 w-48 bg-slate-700 rounded-lg" />
                                            <div className="flex gap-4">
                                                <div className="h-10 w-10 bg-indigo-500 rounded-full" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-6 mb-8">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-32 bg-slate-800 rounded-2xl border border-slate-700" />
                                            ))}
                                        </div>
                                        <div className="h-64 bg-slate-800 rounded-2xl border border-slate-700" />
                                    </div>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                    <p className="text-white font-bold text-2xl">Modern & Intuitive Dashboard</p>
                                </div>
                            </div>
                        </div>
                        {/* Floating Badges */}
                        <div className="absolute -right-12 top-20 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce hidden lg:flex">
                            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 font-bold uppercase">Uptime</div>
                                <div className="text-lg font-black text-slate-800">99.99%</div>
                            </div>
                        </div>
                        <div className="absolute -left-12 bottom-20 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce delay-700 hidden lg:flex">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 font-bold uppercase">Active Users</div>
                                <div className="text-lg font-black text-slate-800">50K+</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Features Grid */}
            <section id="features" className="py-32 bg-white relative">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                            Everything You Need
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
                            Power-Packed Modules for <br />
                            <span className="text-indigo-600">Complete School Automation</span>
                        </h2>
                        <p className="text-lg text-slate-500 leading-relaxed">
                            Gen School Mail is not just software; it's an operating system for your educational institute.
                            Simple enough for anyone to use, powerful enough to run everything.
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
                            title="Role-Based Access"
                            description="Secure access control for Admins, Teachers, Accountants, Students, and Parents. Everyone sees only what they need."
                            color="slate"
                        />
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-32 bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-12">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                                    Why Top Schools Trust <br />
                                    <span className="text-indigo-400">Gen School Mail?</span>
                                </h2>
                                <p className="text-slate-400 text-lg">
                                    We understand the challenges of running an educational institution.
                                    Our platform is built to solve them efficiently and affordably.
                                </p>
                            </div>

                            <div className="space-y-8">
                                <BenefitRow
                                    icon={<Zap className="text-amber-400" />}
                                    title="Lightning Fast Performance"
                                    description="Optimized for speed. Access records, generate reports, and load pages instantly, even with low internet bandwidth."
                                />
                                <BenefitRow
                                    icon={<Shield className="text-emerald-400" />}
                                    title="Bank-Grade Security"
                                    description="Your data is safe with us. We use AES-256 encryption and daily automated backups to ensure zero data loss."
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
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-[3rem] rotate-3 blur-sm opacity-50"></div>
                            <div className="relative bg-slate-800 rounded-[3rem] p-8 sm:p-12 border border-slate-700 shadow-2xl space-y-8">
                                <div className="text-center">
                                    <h3 className="text-2xl font-bold mb-2">Simple, Transparent Pricing</h3>
                                    <p className="text-slate-400">Everything you need to grow your school.</p>
                                </div>
                                <div className="bg-slate-700/50 rounded-2xl p-6 text-center border border-slate-600">
                                    <p className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-2">Starting From</p>
                                    <div className="text-5xl font-black text-white mb-2">₹10<span className="text-lg text-slate-400 font-medium"> /student /month</span></div>
                                    <p className="text-xs text-slate-400">Billed Annually</p>
                                </div>
                                <div className="space-y-4">
                                    <CheckItem text="All Modules Included" />
                                    <CheckItem text="Unlimited Users" />
                                    <CheckItem text="Free Onboarding & Training" />
                                    <CheckItem text="24/7 Priority Support" />
                                    <CheckItem text="Free Automatic Updates" />
                                </div>
                                <Link href="/login" className="block w-full py-4 bg-white text-slate-900 rounded-xl font-bold text-center hover:bg-indigo-50 transition-colors">
                                    Get Started Now
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-gradient-to-br from-indigo-600 to-purple-700 text-white text-center">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl md:text-5xl font-black mb-8">Ready to Transform Your School?</h2>
                    <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-12">
                        Join hundreds of forward-thinking schools using Gen School Mail to deliver better education management.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="/login" className="px-10 py-5 bg-white text-indigo-600 rounded-2xl font-bold text-xl hover:shadow-2xl hover:scale-105 transition-all">
                            Create Your School Account
                        </Link>
                    </div>
                    <p className="mt-8 text-sm text-indigo-200 font-medium">No credit card required for trial • Cancel anytime</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-indigo-900 rounded-lg flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-indigo-400" />
                        </div>
                        <span className="text-xl font-bold text-white">
                            Gen School<span className="text-indigo-500">Mail</span>
                        </span>
                    </div>
                    <div className="text-sm font-medium">
                        &copy; {new Date().getFullYear()} Gen School Mail. All rights reserved.
                    </div>
                    <div className="flex gap-6 text-sm font-medium">
                        <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link href="#" className="hover:text-white transition-colors">Support</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode; title: string; description: string; color: string }) {
    const colorClasses: Record<string, string> = {
        indigo: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white",
        blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
        green: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
        purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
        orange: "bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white",
        teal: "bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white",
        rose: "bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white",
        cyan: "bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white",
        slate: "bg-slate-50 text-slate-600 group-hover:bg-slate-600 group-hover:text-white",
    };

    return (
        <div className="group bg-slate-50 hover:bg-white p-8 rounded-[2rem] border border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-300">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 ${colorClasses[color]}`}>
                {/* Clone element to force size if needed, or rely on parent div sizing */}
                <div className="[&>svg]:w-7 [&>svg]:h-7">{icon}</div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{title}</h3>
            <p className="text-slate-500 leading-relaxed font-medium">{description}</p>
        </div>
    );
}

function BenefitRow({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="flex gap-4">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-700 shadow-inner">
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
