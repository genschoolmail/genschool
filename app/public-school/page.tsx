import { prisma } from '@/lib/prisma';
import { createInquiry } from '@/lib/cms-actions';
import { GraduationCap, Mail, Phone, MapPin, Send, Users, BookOpen, Award } from 'lucide-react';
import Link from 'next/link';

// This would normally extract subdomain from headers
// For demo, we'll use a default school
async function getSchoolBySubdomain() {
    // In production: extract from request headers
    // const subdomain = headers().get('host')?.split('.')[0];

    return await prisma.school.findFirst({
        where: { status: 'ACTIVE' },
        include: { subscription: { include: { plan: true } } }
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
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-slate-800">{school.name}</span>
                    </div>
                    <div className="flex gap-4">
                        <a href="#admissions" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">
                            Admissions
                        </a>
                        <Link href="/login" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                            Student/Staff Login
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="container mx-auto px-6 py-20">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl font-bold text-slate-900 mb-6">
                        Welcome to {school.name}
                    </h1>
                    <p className="text-xl text-slate-600 mb-8">
                        Excellence in Education • Shaping Future Leaders • Building Strong Foundations
                    </p>
                    <div className="flex gap-4 justify-center">
                        <a href="#admissions" className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg">
                            Apply for Admission
                        </a>
                        <a href="#about" className="px-8 py-4 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-100 transition-all">
                            Learn More
                        </a>
                    </div>
                </div>
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
