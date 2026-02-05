import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import archiver from 'archiver';
import { Readable } from 'stream';
import path from 'path';
import fs from 'fs/promises';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const schoolId = (session.user as any).schoolId;

        // Fetch all students with relations
        const students = await prisma.student.findMany({
            where: { schoolId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        image: true,
                        phone: true
                    }
                },
                class: {
                    select: {
                        name: true,
                        section: true
                    }
                },
                parent: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                phone: true,
                                email: true
                            }
                        }
                    }
                }
            },
            orderBy: [
                { class: { name: 'asc' } },
                { class: { section: 'asc' } },
                { rollNo: 'asc' }
            ]
        });

        // Create a ZIP archive
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        // Create CSV content
        const csvRows = [
            [
                'Class',
                'Section',
                'Admission No',
                'Roll No',
                'Name',
                'Gender',
                'DOB',
                'Email',
                'Phone',
                'Address',
                'Parent Name',
                'Parent Phone',
                'Parent Email',
                'Image URL',
                'Documents'
            ].join(',')
        ];

        for (const student of students) {
            const escapeCsvField = (field: any) => {
                if (field === null || field === undefined) return '';
                const stringField = String(field);
                if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
                    return `"${stringField.replace(/"/g, '""')}"`;
                }
                return stringField;
            };

            const row = [
                escapeCsvField(student.class?.name),
                escapeCsvField(student.class?.section),
                escapeCsvField(student.admissionNo),
                escapeCsvField(student.rollNo),
                escapeCsvField(student.user?.name),
                escapeCsvField(student.gender),
                escapeCsvField(student.dob ? new Date(student.dob).toLocaleDateString() : ''),
                escapeCsvField(student.user?.email),
                escapeCsvField(student.user?.phone),
                escapeCsvField(student.address),
                escapeCsvField(student.parent?.user?.name),
                escapeCsvField(student.parent?.user?.phone),
                escapeCsvField(student.parent?.user?.email),
                escapeCsvField(student.user?.image),
                escapeCsvField(student.documents)
            ].join(',');
            csvRows.push(row);
        }

        // Add CSV to archive
        archive.append(csvRows.join('\n'), { name: 'students.csv' });

        // Add manifest
        const manifest = {
            exportDate: new Date().toISOString(),
            schoolId,
            totalStudents: students.length,
            classes: [...new Set(students.map(s => `${s.class?.name}-${s.class?.section}`))],
            format: 'SCA1B2C-AAA001'
        };
        archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' });

        // Note: File downloading from URLs would require additional implementation
        // For now, we're just including URLs in the CSV
        // To download actual files, we'd need to:
        // 1. Parse image/document URLs
        // 2. Download files from public/uploads or S3
        // 3. Add them to the archive

        // Finalize the archive
        archive.finalize();

        // Convert archive stream to Response
        const chunks: Buffer[] = [];
        for await (const chunk of archive as any) {
            chunks.push(Buffer.from(chunk as any));
        }
        const buffer = Buffer.concat(chunks);

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="students_export_${new Date().toISOString().split('T')[0]}.zip"`
            }
        });

    } catch (error: any) {
        console.error('ZIP Export Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create ZIP export' },
            { status: 500 }
        );
    }
}
