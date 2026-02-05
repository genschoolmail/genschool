'use server';

import { prisma } from '@/lib/prisma';
import { getTenantId } from '@/lib/tenant';

export async function exportStudentsData() {
    try {
        const schoolId = await getTenantId();

        const students = await prisma.student.findMany({
            where: { schoolId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                class: {
                    select: {
                        name: true,
                        section: true
                    }
                },
                parent: {
                    select: {
                        fatherName: true,
                        motherName: true,
                        phone: true,
                        email: true
                    }
                }
            }
        });

        // Convert to CSV
        const headers = ['Admission No', 'Name', 'Email', 'Class', 'Gender', 'Father Name', 'Mother Name', 'Parent Phone', 'Parent Email'];
        const csvRows = [headers.join(',')];

        for (const student of students) {
            const row = [
                student.admissionNo || '',
                student.user?.name || '',
                student.user?.email || '',
                student.class ? `${student.class.name}-${student.class.section}` : '',
                student.gender || '',
                student.parent?.fatherName || '',
                student.parent?.motherName || '',
                student.parent?.phone || '',
                student.parent?.email || ''
            ];
            csvRows.push(row.map(field => `"${field}"`).join(','));
        }

        return {
            success: true,
            data: csvRows.join('\n'),
            filename: `students_${new Date().toISOString().split('T')[0]}.csv`
        };
    } catch (error: any) {
        console.error('Export error:', error);
        return {
            success: false,
            error: error.message || 'Export failed'
        };
    }
}

export async function exportTeachersData() {
    try {
        const schoolId = await getTenantId();

        const teachers = await prisma.teacher.findMany({
            where: { schoolId },
            include: {
                user: true
            }
        });

        const headers = ['Employee ID', 'Name', 'Email', 'Phone', 'Designation', 'Qualification'];
        const csvRows = [headers.join(',')];

        for (const teacher of teachers) {
            const row = [
                teacher.employeeId || '',
                teacher.user?.name || '',
                teacher.user?.email || '',
                teacher.user?.phone || '',
                teacher.designation || '',
                teacher.qualification || ''
            ];
            csvRows.push(row.map(field => `"${field}"`).join(','));
        }

        return {
            success: true,
            data: csvRows.join('\n'),
            filename: `teachers_${new Date().toISOString().split('T')[0]}.csv`
        };
    } catch (error: any) {
        console.error('Export error:', error);
        return {
            success: false,
            error: error.message || 'Export failed'
        };
    }
}
