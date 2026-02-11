'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    GraduationCap, Users, Shield, Sparkles, ArrowRight,
    Globe, Zap, CheckCircle2, BarChart3, School,
    Bus, BookOpen, Calculator, UserCog, CalendarClock,
    LayoutDashboard, Lock, Mail, Phone, Menu, X, Facebook, Twitter, Instagram, Linkedin
} from 'lucide-react';
import TrialEnquiryModal from './TrialEnquiryModal';

export default function MainLanding() {
    const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-amber-100 selection:text-amber-900 overflow-x-hidden flex flex-col">
            <TrialEnquiryModal isOpen={isEnquiryOpen} onClose={() => setIsEnquiryOpen(false)} />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 h-20 flex items-center shadow-sm">
                <div className="container mx-auto px-6 flex justify-between items-center h-full">
                    {/* Brand */}
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="relative w-12 h-12 transition-transform duration-300 group-hover:scale-105">
                            <Image
                                src="/api/files/1yEgE0CwFxIh1FZP0q2mZ0eZEtqgW_ZI_"
                                alt="Gen School Mail Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <span className="text-2xl font-black text-slate-800 tracking-tight hidden sm:block">
                            Gen School<span className="text-amber-500">Mail</span>
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center space-x-8">
                        <div className="flex items-center space-x-6 text-sm font-bold text-slate-600">
                            <Link href="#features" className="hover:text-amber-600 transition-colors">Features</Link>
                            <Link href="#why-us" className="hover:text-amber-600 transition-colors">Why Us</Link>
                            <Link href="#pricing" className="hover:text-amber-600 transition-colors">Pricing</Link>
                        </div>

                        <div className="h-6 w-px bg-slate-200"></div>

                        <div className="flex items-center space-x-4">
                            <Link href="tel:+917759958909" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-amber-600 transition-colors">
                                <Phone className="w-4 h-4" /> +91 7759958909
                            </Link>
                            <Link href="/login" className="font-bold text-slate-600 hover:text-amber-600 px-4 py-2 rounded-xl transition-colors">
                                Login
                            </Link>
                            <button
                                onClick={() => setIsEnquiryOpen(true)}
                                className="px-6 py-2.5 bg-amber-500 text-white rounded-full font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-200 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
                            >
                                Start Free Trial <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="lg:hidden p-2 text-slate-600" onClick={toggleMenu}>
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-100 p-6 flex flex-col gap-6 shadow-2xl animate-in slide-in-from-top-4 duration-200">
                        <Link href="#features" onClick={toggleMenu} className="font-bold text-slate-600 text-lg">Features</Link>
                        <Link href="#why-us" onClick={toggleMenu} className="font-bold text-slate-600 text-lg">Why Us</Link>
                        <Link href="#pricing" onClick={toggleMenu} className="font-bold text-slate-600 text-lg">Pricing</Link>
                        <hr className="border-slate-100" />
                        <Link href="/login" onClick={toggleMenu} className="font-bold text-slate-600 text-lg">Login</Link>
                        <button
                            onClick={() => { setIsEnquiryOpen(true); setIsMobileMenuOpen(false); }}
                            className="w-full py-4 bg-amber-500 text-white rounded-xl font-bold text-lg shadow-lg"
                        >
                            Start Free Trial
                        </button>
                    </div>
                )}
            </nav>

            {/* Split Screen Hero Section */}
            <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-50">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                        {/* Left Content */}
                        <div className="text-center lg:text-left space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
                            <div className="inline-flex items-center space-x-2 bg-white border border-slate-200 text-slate-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span>Trusted by 500+ Schools</span>
                            </div>

                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
                                The Smartest Way to <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600">
                                    Manage Your School
                                </span>
                            </h1>

                            <p className="text-lg md:text-xl text-slate-600 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                                Experience the future of education management. Streamline admissions, fees, exams, and more with our all-in-one, cloud-based platform.
                            </p>

                            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-4">
                                <button
                                    onClick={() => setIsEnquiryOpen(true)}
                                    className="px-8 py-4 bg-slate-900 text-white rounded-full font-bold text-lg hover:bg-slate-800 shadow-xl flex items-center justify-center gap-2 hover:scale-105 transition-all active:scale-95"
                                >
                                    Get Started Free
                                </button>
                                <Link href="#features" className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-bold text-lg hover:bg-slate-50 shadow-sm hover:shadow-md flex items-center justify-center gap-2 transition-all">
                                    Explore Features
                                </Link>
                            </div>

                            <div className="pt-8 flex items-center justify-center lg:justify-start gap-6 text-sm font-semibold text-slate-500">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" /> No Credit Card
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" /> 14-Day Free Trial
                                </div>
                            </div>
                        </div>

                        {/* Right Visual */}
                        <div className="relative lg:h-[600px] flex items-center justify-center animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
                            {/* Decorative Blobs */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-amber-200/40 via-purple-200/40 to-blue-200/40 rounded-full blur-[100px] animate-pulse"></div>

                            {/* Main Dashboard Screenshot */}
                            <div className="relative w-full max-w-2xl transform lg:perspective-[2000px] lg:rotate-y-[-12deg] lg:rotate-x-[5deg] hover:rotate-0 transition-all duration-700 ease-out z-20">
                                <div className="relative bg-white rounded-xl shadow-2xl border-4 border-slate-900/5 overflow-hidden ring-1 ring-slate-900/10">
                                    <Image
                                        src="/api/files/1u1TUVm5ddXwItnnXC5GWKHRpT8C-OiSI"
                                        alt="Gen School Mail Dashboard"
                                        width={1200}
                                        height={800}
                                        className="w-full h-auto object-cover"
                                        priority
                                    />

                                    {/* Overlay Gradient for depth */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent pointer-events-none mix-blend-overlay"></div>
                                </div>

                                {/* Floating Elements - Repositioned */}
                                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce delay-700 border border-slate-100 z-30">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <LayoutDashboard className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Interface</div>
                                        <div className="text-sm font-black text-slate-800">Clean & Modern</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Grid - Asymmetric Layout */}
            <section id="features" className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">
                            Powerful Features. <br />
                            <span className="text-amber-500">Zero Complexity.</span>
                        </h2>
                        <p className="text-lg text-slate-500 leading-relaxed">
                            Designed for modern schools. Gen School Mail simplifies administrative tasks so you can focus on education.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature Cards with hover effects */}
                        <FeatureCard
                            icon={<School />}
                            title="Multi-School Management"
                            description="Centralized control for groups of schools. Manage standards, finances, and hr across all branches."
                            color="indigo"
                        />
                        <FeatureCard
                            icon={<UserCog />}
                            title="Admission Automation"
                            description="Paperless admission process. Online forms, document uploads, and automated entrance notifications."
                            color="blue"
                        />
                        <FeatureCard
                            icon={<Calculator />}
                            title="Smart Fee Collection"
                            description="Automated fee reminders, online payments, receipt generation, and defaulter tracking."
                            color="green"
                        />
                        <FeatureCard
                            icon={<BookOpen />}
                            title="Exam & Grading"
                            description="Customizable grading systems (GPA/CCE). One-click report card generation and analytics."
                            color="purple"
                        />
                        <FeatureCard
                            icon={<Bus />}
                            title="Transport GPS"
                            description="Real-time bus tracking, route management, and automated pickup/drop alerts for parents."
                            color="orange"
                        />
                        <FeatureCard
                            icon={<Users />}
                            title="HR & Payroll"
                            description="Biometric attendance integration, leave management, and automated salary slip generation."
                            color="rose"
                        />
                    </div>
                </div>
            </section>

            {/* Visual Break / Statistics */}
            <section id="why-us" className="py-20 bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-1/2 -right-1/2 w-[1000px] h-[1000px] bg-slate-800/50 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-1/2 -left-1/2 w-[1000px] h-[1000px] bg-amber-900/20 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
                        <div className="p-4">
                            <div className="text-4xl lg:text-5xl font-black text-amber-500 mb-2">500+</div>
                            <div className="text-slate-400 font-medium">Schools Trusted</div>
                        </div>
                        <div className="p-4">
                            <div className="text-4xl lg:text-5xl font-black text-blue-500 mb-2">50k+</div>
                            <div className="text-slate-400 font-medium">Active Students</div>
                        </div>
                        <div className="p-4">
                            <div className="text-4xl lg:text-5xl font-black text-green-500 mb-2">99.9%</div>
                            <div className="text-slate-400 font-medium">Uptime Guarantee</div>
                        </div>
                        <div className="p-4">
                            <div className="text-4xl lg:text-5xl font-black text-purple-500 mb-2">24/7</div>
                            <div className="text-slate-400 font-medium">Expert Support</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Teaser / CTA */}
            <section id="pricing" className="py-24 bg-amber-50 relative">
                <div className="container mx-auto px-6">
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-amber-100 relative overflow-hidden text-center max-w-4xl mx-auto">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-orange-600"></div>

                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">
                            Premium Features.<br /> Pocket-Friendly Price.
                        </h2>
                        <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
                            Start for as low as <strong>₹10/student/month</strong>. No hidden charges. No setup fees.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button
                                onClick={() => setIsEnquiryOpen(true)}
                                className="px-10 py-4 bg-amber-500 text-white rounded-xl font-bold text-lg hover:bg-amber-600 shadow-xl transition-all"
                            >
                                Get Custom Quote
                            </button>
                            <Link href="/login" className="px-10 py-4 bg-white text-slate-700 border-2 border-slate-100 rounded-xl font-bold text-lg hover:border-slate-300 transition-all">
                                View Demo
                            </Link>
                        </div>

                        <p className="mt-8 text-sm text-slate-400">
                            Trusted by leading institutions across India
                        </p>
                    </div>
                </div>
            </section>

            {/* Expanded Footer with Quick Links & Legal */}
            <footer className="bg-slate-950 text-slate-400 pt-20 pb-10 border-t border-slate-900 mt-auto">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                        {/* Brand Column */}
                        <div className="space-y-6">
                            <div className="flex items-center space-x-2">
                                <div className="relative w-10 h-10">
                                    <Image
                                        src="/api/files/1yEgE0CwFxIh1FZP0q2mZ0eZEtqgW_ZI_"
                                        alt="Gen School Mail Logo"
                                        fill
                                        className="object-contain brightness-0 invert"
                                    />
                                </div>
                                <span className="text-xl font-bold text-white">
                                    Gen School<span className="text-amber-500">Mail</span>
                                </span>
                            </div>
                            <p className="text-slate-500 leading-relaxed">
                                Empowering schools with next-gen technology. Simplifying management, enhancing education.
                            </p>
                            <div className="flex gap-4">
                                <SocialLink href="#" icon={<Facebook className="w-5 h-5" />} />
                                <SocialLink href="#" icon={<Twitter className="w-5 h-5" />} />
                                <SocialLink href="#" icon={<Instagram className="w-5 h-5" />} />
                                <SocialLink href="#" icon={<Linkedin className="w-5 h-5" />} />
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-white font-bold mb-6">Product</h4>
                            <ul className="space-y-4">
                                <li><Link href="#features" className="hover:text-amber-500 transition-colors">Features</Link></li>
                                <li><Link href="#pricing" className="hover:text-amber-500 transition-colors">Pricing</Link></li>
                                <li><Link href="#why-us" className="hover:text-amber-500 transition-colors">Why Choose Us</Link></li>
                                <li><Link href="/login" className="hover:text-amber-500 transition-colors">Portal Login</Link></li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 className="text-white font-bold mb-6">Legal</h4>
                            <ul className="space-y-4">
                                <li><Link href="#" className="hover:text-amber-500 transition-colors">Privacy Policy</Link></li>
                                <li><Link href="#" className="hover:text-amber-500 transition-colors">Terms of Service</Link></li>
                                <li><Link href="#" className="hover:text-amber-500 transition-colors">Refund Policy</Link></li>
                                <li><Link href="#" className="hover:text-amber-500 transition-colors">Data Security</Link></li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="text-white font-bold mb-6">Contact Us</h4>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <Phone className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                    <span>+91 7759958909</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Mail className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                    <span>gautamdss3@gmail.com</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Globe className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                    <span>genschoolmail.in</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium">
                        <div>
                            &copy; {new Date().getFullYear()} Gen School Mail. All rights reserved.
                        </div>
                        <div className="flex gap-6">
                            <Link href="#" className="hover:text-white transition-colors">Sitemap</Link>
                            <Link href="#" className="hover:text-white transition-colors">Cookies</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode; title: string; description: string; color: string }) {
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
        <div className="group bg-white p-8 rounded-3xl border border-slate-100 hover:border-amber-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 ${colorClasses[color]}`}>
                <div className="[&>svg]:w-7 [&>svg]:h-7">{icon}</div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-amber-600 transition-colors">{title}</h3>
            <p className="text-slate-500 leading-relaxed font-medium group-hover:text-slate-600">{description}</p>
        </div>
    );
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
    return (
        <Link href={href} className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-slate-400 hover:bg-amber-500 hover:text-white transition-all border border-slate-800 hover:border-amber-500">
            {icon}
        </Link>
    );
}
