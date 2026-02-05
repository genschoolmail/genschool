'use client';

import React, { useState } from 'react';
import MobileNav from '../../components/MobileNav';
import HamburgerButton from '../../components/ui/HamburgerButton';
import { LayoutDashboard, IndianRupee, FileText, History, BookOpen, Calendar, Book, Bell, CreditCard, Clock, Bus, User, ClipboardList } from 'lucide-react';

interface StudentMobileNavProps {
    userRole?: string;
    subdomain?: string | null;
}

export default function StudentMobileNav({ userRole, subdomain }: StudentMobileNavProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navSections = [
        // ... (existing sections logic)
        {
            title: 'Main Menu',
            items: [
                { href: '/student', icon: <LayoutDashboard />, label: 'Dashboard' },
                { href: '/student/id-card', icon: <CreditCard />, label: 'My ID Card' },
                { href: '/student/exam', icon: <ClipboardList />, label: 'Exams' },
                { href: '/student/notices', icon: <Bell />, label: 'Notices' },
            ],
        },
        {
            title: 'My Finance',
            items: [
                { href: '/student/finance', icon: <IndianRupee />, label: 'Overview' },
                { href: '/student/finance/fees', icon: <FileText />, label: 'My Fees' },

                { href: '/student/finance/receipts', icon: <History />, label: 'Receipts' },
            ],
        },
        {
            title: 'Academics',
            items: [
                { href: '/student/academics', icon: <BookOpen />, label: 'My Classes' },
                { href: '/student/attendance', icon: <Calendar />, label: 'Attendance' },
                { href: '/student/timetable', icon: <Clock />, label: 'Timetable' },
                { href: '/student/library', icon: <Book />, label: 'My Books' },
            ],
        },
        {
            title: 'Transport',
            items: [
                { href: '/student/transport', icon: <Bus />, label: 'My Bus' },
            ],
        },
    ];


    return (
        <>
            <div className="md:hidden relative z-50">
                <HamburgerButton
                    isOpen={isMenuOpen}
                    onClick={() => setIsMenuOpen(true)}
                />
            </div>
            <MobileNav
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                sections={navSections}
                userRole={userRole}
                subdomain={subdomain}
                portalName="Student Portal"
            />
        </>
    );
}
