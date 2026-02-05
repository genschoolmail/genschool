'use server';

import { prisma } from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";

export async function generateAdmissionNo() {
    try {
        const schoolId = await getTenantId();
        const count = await prisma.student.count({ where: { schoolId } });
        const year = new Date().getFullYear().toString().slice(-2);
        return `ADM${year}${String(count + 1).padStart(4, '0')}`;
    } catch (e) {
        return `ADM${new Date().getFullYear().toString().slice(-2)}0001`;
    }
}

export async function getUniqueClassNames() {
    try {
        const schoolId = await getTenantId();
        const classes = await prisma.class.findMany({
            where: { schoolId },
            select: { name: true },
            distinct: ['name']
        });
        return classes.map(c => c.name).sort((a, b) => {
            const numA = parseInt(a) || 0;
            const numB = parseInt(b) || 0;
            return numA - numB;
        });
    } catch (e) {
        console.error('Error fetching class names:', e);
        return [];
    }
}

export async function getSectionsForClass(className: string) {
    try {
        const schoolId = await getTenantId();
        const sections = await prisma.class.findMany({
            where: { schoolId, name: className },
            include: {
                _count: {
                    select: { students: true }
                }
            }
        });

        return sections.map(s => ({
            id: s.id,
            section: s.section,
            capacity: s.capacity,
            enrolled: s._count.students,
            available: Math.max(0, s.capacity - s._count.students)
        }));
    } catch (e) {
        console.error('Error fetching sections:', e);
        return [];
    }
}

export async function getAutoAssignment(className: string) {
    try {
        const schoolId = await getTenantId();

        // Count students in this class across all sections to get the next available roll number
        const count = await prisma.student.count({
            where: {
                schoolId,
                class: {
                    name: className
                }
            }
        });

        return {
            success: true,
            rollNo: (count + 1).toString()
        };
    } catch (error) {
        console.error('Error in auto-assignment:', error);
        return { success: false, error: 'Failed to auto-assign' };
    }
}

export async function getAdmissionEnquiries() {
    try {
        const schoolId = await getTenantId();
        // Assuming 'AdmissionEnquiry' model based on context
        // return await prisma.admissionEnquiry.findMany({ where: { schoolId } });
        return [];
    } catch (e) {
        return [];
    }
}

export async function updateAdmissionEnquiryStatus(id: string, status: string) {
    return { success: true };
}

export async function deleteAdmissionEnquiry(id: string) {
    return { success: true };
}
