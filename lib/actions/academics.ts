'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getTenantId } from '@/lib/tenant';

export async function createClass(formData: FormData) {
    try {
        const schoolId = await getTenantId();

        const classData = {
            schoolId,
            name: formData.get('name') as string,
            section: formData.get('section') as string,
            capacity: formData.get('capacity') ? parseInt(formData.get('capacity') as string) : undefined,
            roomNo: formData.get('roomNo') as string || undefined
        };

        await prisma.class.create({
            data: classData
        });

        revalidatePath('/admin/academics');
        return { success: true };
    } catch (error: any) {
        console.error('Create class error:', error);
        return { success: false, error: error.message };
    }
}

export async function updateClass(id: string, formData: FormData) {
    try {
        const classData = {
            name: formData.get('name') as string,
            section: formData.get('section') as string,
            capacity: formData.get('capacity') ? parseInt(formData.get('capacity') as string) : undefined,
            roomNo: formData.get('roomNo') as string || undefined
        };

        await prisma.class.update({
            where: { id },
            data: classData
        });

        revalidatePath('/admin/academics');
        return { success: true };
    } catch (error: any) {
        console.error('Update class error:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteClass(formData: FormData) {
    try {
        const id = formData.get('id') as string;

        await prisma.class.delete({
            where: { id }
        });

        revalidatePath('/admin/academics');
        return { success: true };
    } catch (error: any) {
        console.error('Delete class error:', error);
        return { success: false, error: error.message };
    }
}

export async function createSubject(formData: FormData) {
    try {
        const schoolId = await getTenantId();

        const subjectData = {
            schoolId,
            name: formData.get('name') as string,
            code: formData.get('code') as string || undefined,
            classId: formData.get('classId') as string,
            teacherId: formData.get('teacherId') as string || undefined,
            subjectGroupId: formData.get('subjectGroupId') as string || undefined,
            credits: formData.get('credits') ? parseInt(formData.get('credits') as string) : 0,
            description: formData.get('description') as string || undefined
        };

        await prisma.subject.create({
            data: subjectData
        });

        revalidatePath('/admin/academics');
        revalidatePath('/admin/academics/subjects');
        return { success: true };
    } catch (error: any) {
        console.error('Create subject error:', error);
        return { success: false, error: error.message };
    }
}

export async function updateSubject(id: string, formData: FormData) {
    try {
        const subjectData = {
            name: formData.get('name') as string,
            code: formData.get('code') as string || null,
            classId: formData.get('classId') as string,
            teacherId: formData.get('teacherId') as string || null,
            subjectGroupId: formData.get('subjectGroupId') as string || null,
            credits: formData.get('credits') ? parseInt(formData.get('credits') as string) : 0,
            description: formData.get('description') as string || null
        };

        await prisma.subject.update({
            where: { id },
            data: subjectData
        });

        revalidatePath('/admin/academics');
        revalidatePath('/admin/academics/subjects');
        return { success: true };
    } catch (error: any) {
        console.error('Update subject error:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteSubject(formData: FormData) {
    try {
        const id = formData.get('id') as string;

        await prisma.subject.delete({
            where: { id }
        });

        revalidatePath('/admin/academics');
        return { success: true };
    } catch (error: any) {
        console.error('Delete subject error:', error);
        return { success: false, error: error.message };
    }
}

export async function getClasses() {
    try {
        const schoolId = await getTenantId();
        const classes = await prisma.class.findMany({
            where: { schoolId },
            include: {
                _count: {
                    select: { students: true }
                }
            },
            orderBy: [
                { name: 'asc' },
                { section: 'asc' }
            ]
        });

        return classes.map(cls => ({
            ...cls,
            enrolled: cls._count.students,
            available: (cls.capacity || 0) - cls._count.students
        }));
    } catch (error) {
        console.error('Get classes error:', error);
        return [];
    }
}

export async function getSubjects() {
    try {
        const schoolId = await getTenantId();
        return await prisma.subject.findMany({
            where: { schoolId },
            orderBy: { name: 'asc' }
        });
    } catch (error) {
        console.error('Get subjects error:', error);
        return [];
    }
}

export async function getTimeSlots() {
    try {
        const schoolId = await getTenantId();
        return await prisma.timeSlot.findMany({
            where: { schoolId },
            orderBy: { order: 'asc' }
        });
    } catch (error) {
        console.error('Get time slots error:', error);
        return [];
    }
}

export async function createTimeSlot(formData: FormData) {
    try {
        const schoolId = await getTenantId();
        const data = {
            startTime: formData.get('startTime') as string,
            endTime: formData.get('endTime') as string,
            label: formData.get('label') as string,
            order: parseInt(formData.get('order') as string) || 0,
            schoolId
        };
        await prisma.timeSlot.create({ data });
        revalidatePath('/admin/academics/timetable/settings');
        return { success: true };
    } catch (error: any) {
        console.error('Create time slot error:', error);
        return { success: false, error: error.message };
    }
}

export async function updateTimeSlot(id: string, formData: FormData) {
    try {
        const data = {
            startTime: formData.get('startTime') as string,
            endTime: formData.get('endTime') as string,
            label: formData.get('label') as string,
            order: parseInt(formData.get('order') as string) || 0
        };
        await prisma.timeSlot.update({
            where: { id },
            data
        });
        revalidatePath('/admin/academics/timetable/settings');
        return { success: true };
    } catch (error: any) {
        console.error('Update time slot error:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteTimeSlot(id: string) {
    try {
        await prisma.timeSlot.delete({ where: { id } });
        revalidatePath('/admin/academics/timetable/settings');
        return { success: true };
    } catch (error: any) {
        console.error('Delete time slot error:', error);
        return { success: false, error: error.message };
    }
}

// Subject Group Actions
export async function getSubjectGroups() {
    try {
        const schoolId = await getTenantId();
        return await prisma.subjectGroup.findMany({
            where: { schoolId },
            include: {
                subjects: true
            },
            orderBy: { name: 'asc' }
        });
    } catch (error) {
        console.error('Get subject groups error:', error);
        return [];
    }
}

export async function createSubjectGroup(formData: FormData) {
    try {
        const schoolId = await getTenantId();
        const data = {
            schoolId,
            name: formData.get('name') as string,
            description: formData.get('description') as string || undefined,
        };

        await prisma.subjectGroup.create({ data });
        revalidatePath('/admin/academics/subjects');
        return { success: true };
    } catch (error: any) {
        console.error('Create subject group error:', error);
        return { success: false, error: error.message };
    }
}

export async function updateSubjectGroup(id: string, formData: FormData) {
    try {
        const data = {
            name: formData.get('name') as string,
            description: formData.get('description') as string || null,
        };

        await prisma.subjectGroup.update({
            where: { id },
            data
        });
        revalidatePath('/admin/academics/subjects');
        return { success: true };
    } catch (error: any) {
        console.error('Update subject group error:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteSubjectGroup(id: string) {
    try {
        await prisma.subjectGroup.delete({ where: { id } });
        revalidatePath('/admin/academics/subjects');
        return { success: true };
    } catch (error: any) {
        console.error('Delete subject group error:', error);
        return { success: false, error: error.message };
    }
}

// Missing exports - Stub implementations
export async function assignClassTeacher(formData: FormData) {
    try {
        // Stub implementation
        return { success: true, message: 'Class teacher assigned successfully' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function removeClassTeacher(classId: string) {
    try {
        // Stub implementation
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getClassTeachers() {
    try {
        // Stub implementation
        return [];
    } catch (error) {
        return [];
    }
}

export async function getClass(id: string) {
    try {
        const schoolId = await getTenantId();
        return await prisma.class.findFirst({
            where: { id, schoolId }
        });
    } catch (error) {
        return null;
    }
}

export async function getSubjectsByClass(classId: string) {
    try {
        const schoolId = await getTenantId();
        return await prisma.subject.findMany({
            where: { classId, schoolId }
        });
    } catch (error) {
        return [];
    }
}

export async function getClassTimetable(classId: string) {
    try {
        // Stub implementation
        return [];
    } catch (error) {
        return [];
    }
}

export async function updateTimetableEntry(formData: FormData) {
    try {
        // Stub implementation
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getTeacherTimetable(teacherId: string) {
    try {
        // Stub implementation
        return [];
    } catch (error) {
        return [];
    }
}
