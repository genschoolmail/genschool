'use client';

import React, { useState } from 'react';
import MobileNav from '@/components/MobileNav';
import {
    LayoutDashboard, Users, BookOpen, Bus, IndianRupee, Calendar, Settings,
    UserCheck, GraduationCap, FolderTree, BookMarked, ClipboardList,
    Award, FileCheck, Banknote, TrendingDown, TrendingUp, FileText, Tag,
    Package, UserRoundCheck, Library, BarChart3, Clock, Send, Database
} from 'lucide-react';

interface AdminLayoutClientProps {
    signOutAction: () => void;
}

export default function AdminLayoutClient({ signOutAction }: AdminLayoutClientProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navSections = [
        {
            title: 'Main Menu',
            items: [
                { href: '/admin', icon: <LayoutDashboard />, label: 'Dashboard' },
                { href: '/admin/students', icon: <Users />, label: 'Students' },
                { href: '/admin/teachers', icon: <Users />, label: 'Teachers' },
                { href: '/admin/users', icon: <Users />, label: 'Users & Passwords' },
            ],
        },
        {
            title: 'Academics',
            items: [
                { href: '/admin/academics/subject-groups', icon: <FolderTree />, label: 'Subject Groups' },
                { href: '/admin/academics/subjects', icon: <BookMarked />, label: 'Subjects' },
                { href: '/admin/academics', icon: <GraduationCap />, label: 'Class Management' },
                { href: '/admin/academics/timetable', icon: <Clock />, label: 'Timetable' },
                { href: '/admin/academics/promote', icon: <TrendingUp />, label: 'Promote Students' },
                { href: '/admin/academics/class-teachers', icon: <UserCheck />, label: 'Class Teachers' },
            ],
        },
        {
            title: 'Examinations',
            items: [
                { href: '/admin/exams/groups', icon: <ClipboardList />, label: 'Exam Groups' },
                { href: '/admin/exams/grading', icon: <Award />, label: 'Grading System' },
                { href: '/admin/exams/schedule', icon: <Calendar />, label: 'Exam Schedule' },
                { href: '/admin/exams/admit-cards', icon: <FileCheck />, label: 'Admit Cards' },
                { href: '/admin/exams/marks/entry', icon: <Award />, label: 'Marks Entry' },
                { href: '/admin/exams', icon: <FileCheck />, label: 'Exams Overview' },
                { href: '/admin/exams/reports', icon: <FileText />, label: 'Results & Reports' },
            ],
        },
        {
            title: 'Finance',
            items: [
                { href: '/admin/finance', icon: <IndianRupee />, label: 'Finance Dashboard' },
                { href: '/admin/finance/salary', icon: <Banknote />, label: 'Salary' },
                { href: '/admin/finance/expenses', icon: <TrendingDown />, label: 'Expenses' },
                { href: '/admin/finance/income', icon: <TrendingUp />, label: 'Income' },
                { href: '/admin/finance/reports', icon: <FileText />, label: 'Reports' },
                { href: '/admin/finance/discounts', icon: <Tag />, label: 'Discounts' },
            ],
        },
        {
            title: 'Transport',
            items: [
                { href: '/admin/transport', icon: <Bus />, label: 'Transport Dashboard' },
                { href: '/admin/transport/routes', icon: <Bus />, label: 'Routes' },
                { href: '/admin/transport/vehicles', icon: <Bus />, label: 'Vehicles' },
            ],
        },
        {
            title: 'Attendance',
            items: [
                { href: '/admin/attendance', icon: <UserCheck />, label: 'Attendance Dashboard' },
                { href: '/admin/attendance/sheet', icon: <ClipboardList />, label: 'Attendance Sheet' },
                { href: '/admin/attendance/reports', icon: <BarChart3 />, label: 'Attendance Reports' },
            ],
        },
        {
            title: 'Library',
            items: [
                { href: '/admin/library', icon: <Library />, label: 'Library Dashboard' },
                { href: '/admin/library/books', icon: <BookOpen />, label: 'Books' },
                { href: '/admin/library/issue', icon: <FileCheck />, label: 'Issue/Return' },
            ],
        },
        {
            title: 'Communication',
            items: [
                { href: '/admin/communication', icon: <Send />, label: 'Messages & Notices' },
            ],
        },
        {
            title: 'Others',
            items: [
                { href: '/admin/inventory', icon: <Package />, label: 'Inventory' },
                { href: '/admin/visitors', icon: <UserRoundCheck />, label: 'Visitors' },
                { href: '/admin/backup', icon: <Database />, label: 'Backup & Restore' },
                { href: '/admin/settings', icon: <Settings />, label: 'Settings' },
            ],
        },
    ];

    return (
        <MobileNav
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            sections={navSections}
            signOutAction={signOutAction}
            portalName="Gen School Mail"
        />
    );
}
