import React from 'react';
import { prisma } from '@/lib/prisma';
import AttendanceClient from './AttendanceClient';

export default async function AttendancePage() {
    const classes = await prisma.class.findMany({
        include: {
            students: {
                include: {
                    user: true
                },
                orderBy: {
                    admissionNo: 'asc'
                }
            }
        },
        orderBy: {
            name: 'asc'
        }
    });

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Attendance Management</h2>
            <AttendanceClient classes={classes} />
        </div>
    );
}
