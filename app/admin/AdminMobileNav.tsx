'use client';

import React, { useState } from 'react';
import MobileNav from '../../components/MobileNav';
import HamburgerButton from '../../components/ui/HamburgerButton';
import { LayoutDashboard, Users, Calendar, ClipboardList, PenTool, FileText, Bus, UserPlus, Settings, BookOpen, Shield } from 'lucide-react';

import SignOutButton from '../../components/SignOutButton';

interface AdminMobileNavProps {
    userRole?: string;
    subdomain?: string | null;
}

export default function AdminMobileNav({ userRole, subdomain }: AdminMobileNavProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navSections = [
        // ... (keep existing sections)
        {
            title: 'Main Menu',
            items: [
                { href: '/admin', icon: <LayoutDashboard />, label: 'Dashboard' },
                { href: '/admin/students', icon: <Users />, label: 'Students' },
                { href: '/admin/teachers', icon: <Users />, label: 'Teachers' },
                { href: '/admin/users', icon: <Shield />, label: 'Users & Passwords' },
                { href: '/admin/admissions/enquiries', icon: <UserPlus />, label: 'Admission Enquiries' },
            ],
        },
        {
            title: 'Academic',
            items: [
                { href: '/admin/attendance', icon: <Calendar />, label: 'Attendance' },
                { href: '/admin/academics', icon: <BookOpen />, label: 'Academics' },
                { href: '/admin/exams', icon: <FileText />, label: 'Examinations' },
                { href: '/admin/library', icon: <BookOpen />, label: 'Library' },
            ],
        },
        {
            title: 'Administration',
            items: [
                { href: '/admin/finance', icon: <FileText />, label: 'Finance' },
                { href: '/admin/transport', icon: <Bus />, label: 'Transport' },
                { href: '/admin/inventory', icon: <ClipboardList />, label: 'Inventory' },
                { href: '/admin/settings', icon: <Settings />, label: 'Settings' },
                { href: '/admin/settings/website', icon: <LayoutDashboard />, label: 'Website CMS' },
                { href: '/admin/backup', icon: <Shield />, label: 'Backup & Restore' },
            ],
        },
        {
            title: 'Communication',
            items: [
                { href: '/admin/notices', icon: <FileText />, label: 'Notices' },
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
                portalName="Admin Portal"
            />
        </>
    );
}
