'use client';

import React, { useState } from 'react';
import MobileNav from '../../components/MobileNav';
import HamburgerButton from '../../components/ui/HamburgerButton';
import { LayoutDashboard, Users, Calendar, ClipboardList, PenTool, FileText, UserCircle } from 'lucide-react';

interface TeacherMobileNavProps {
    userRole?: string;
    subdomain?: string | null;
}

export default function TeacherMobileNav({ userRole, subdomain }: TeacherMobileNavProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navSections = [
        // ... (existing sections logic)
        {
            title: 'Main Menu',
            items: [
                { href: '/teacher', icon: <LayoutDashboard />, label: 'Dashboard' },
                { href: '/teacher/id-card', icon: <UserCircle />, label: 'My Profile' },
                { href: '/teacher/classes', icon: <Users />, label: 'My Classes' },
                { href: '/teacher/attendance', icon: <Calendar />, label: 'Attendance' },
                { href: '/teacher/marks', icon: <PenTool />, label: 'Upload Marks' },
                { href: '/teacher/results', icon: <FileText />, label: 'Results' },
                { href: '/teacher/timetable', icon: <ClipboardList />, label: 'Timetable' },
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
                portalName="Teacher Portal"
            />
        </>
    );
}
