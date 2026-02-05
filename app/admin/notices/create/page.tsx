import { prisma } from '@/lib/prisma';
import CreateNoticeClient from './CreateNoticeClient';
import { ensureTenantId } from '@/lib/tenant';

export default async function CreateNoticePage() {
    const schoolId = await ensureTenantId();

    // Fetch Classes for targeting
    const classes = await prisma.class.findMany({
        where: { schoolId },
        select: {
            id: true,
            name: true,
            section: true
        }
    });

    // Fetch Students for targeting
    const students = await prisma.student.findMany({
        where: { schoolId },
        select: {
            id: true,
            user: {
                select: {
                    name: true
                }
            }
        }
    });

    const mappedStudents = students.map(u => ({ id: u.id, user: { name: u.user?.name || 'Anonymous' } }));

    return (
        <CreateNoticeClient
            classes={classes}
            students={mappedStudents}
        />
    );
}
