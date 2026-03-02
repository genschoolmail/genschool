'use server';

import { prisma } from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";
import { auth } from "@/auth";
import { saveFile } from "@/lib/upload";
import { generateSlideContent, askAITeacher, generateAudioSummary } from "@/lib/gemini";
import { jsPDF } from "jspdf";
import { revalidatePath } from "next/cache";

/**
 * Main action to generate AI slides from a file and save to Drive.
 */
export async function generateAISlideDeck(formData: FormData) {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'TEACHER') throw new Error("Unauthorized");

        const schoolId = await getTenantId();
        const file = formData.get('file') as File;
        const language = formData.get('language') as string || "English";
        const title = formData.get('title') as string || file.name.split('.')[0];

        if (!file || file.size === 0) throw new Error("No file uploaded");

        // 1. Process File with Gemini (Multimodal)
        // Convert file to Base64 for Gemini
        const arrayBuffer = await file.arrayBuffer();
        const base64Content = Buffer.from(arrayBuffer).toString('base64');
        const mimeType = file.type || "application/pdf";

        // 2. Process File with Gemini (Multimodal)
        const slideData = await generateSlideContent(language, {
            data: base64Content,
            mimeType
        });

        // 3. Generate PDF Slides using jspdf
        const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        slideData.forEach((slide: any, index: number) => {
            if (index > 0) doc.addPage();

            // Background & Header
            doc.setFillColor(index === 0 ? "#6366f1" : "#f8fafc");
            doc.rect(0, 0, pageWidth, pageHeight, "F");

            doc.setTextColor(index === 0 ? "#ffffff" : "#1e293b");
            doc.setFontSize(28);
            doc.text(slide.title || "Untitled Slide", pageWidth / 2, 40, { align: "center" });

            doc.setFontSize(16);
            if (slide.type === "title") {
                doc.text(slide.subtitle || "", pageWidth / 2, 60, { align: "center" });
            } else if (slide.type === "content") {
                slide.points?.forEach((p: string, i: number) => {
                    doc.text(`• ${p}`, 20, 70 + (i * 10));
                });
            } else if (slide.type === "quiz") {
                slide.questions?.forEach((q: any, i: number) => {
                    doc.text(`${i + 1}. ${q.q}`, 20, 70 + (i * 20));
                    doc.setFontSize(12);
                    doc.text(`Options: ${q.options.join(", ")}`, 25, 78 + (i * 20));
                    doc.setFontSize(16);
                });
            }

            // Footer
            doc.setFontSize(10);
            doc.setTextColor("#94a3b8");
            doc.text(`${session.user.name} | ${index + 1} / ${slideData.length}`, pageWidth - 20, pageHeight - 10, { align: "right" });
        });

        // 3. Save PDF Buffer
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
        const pdfFile = new File([pdfBuffer], `${title}-AI-Slides.pdf`, { type: 'application/pdf' });

        const fileUrl = await saveFile(pdfFile, 'ai-slides', schoolId);

        return { success: true, fileUrl, slideData };

    } catch (error: any) {
        console.error("[GENERATE_AI_SLIDES]", error);
        return { error: error.message };
    }
}

/**
 * Share the generated AI content with a specific class.
 */
export async function shareNoteWithClass(data: {
    classId: string;
    title: string;
    content: any;
    fileUrl: string;
}) {
    try {
        const session = await auth();
        const schoolId = await getTenantId();
        if (!session?.user?.id) throw new Error("Unauthorized");

        const teacher = await prisma.teacher.findUnique({
            where: { userId: session.user.id }
        });

        if (!teacher) throw new Error("Teacher profile not found");

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        const sharedNote = await prisma.sharedNote.create({
            data: {
                schoolId,
                teacherId: teacher.id,
                teacherName: session.user.name || "Teacher",
                classId: data.classId,
                title: data.title,
                content: JSON.stringify(data.content),
                fileUrl: data.fileUrl,
                expiresAt: expiryDate
            }
        });

        revalidatePath('/student/notes');
        return { success: true, noteId: sharedNote.id };

    } catch (error: any) {
        console.error("[SHARE_NOTE]", error);
        return { error: error.message };
    }
}

/**
 * Get notes shared with a student's class.
 */
export async function getStudentNotes() {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'STUDENT') throw new Error("Unauthorized");

        const student = await prisma.student.findUnique({
            where: { userId: session.user.id }
        });

        if (!student || !student.classId) return [];

        // Fetch active notes
        const notes = await prisma.sharedNote.findMany({
            where: {
                classId: student.classId,
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' }
        });

        return notes;
    } catch (error) {
        console.error("[GET_STUDENT_NOTES]", error);
        return [];
    }
}

/**
 * Chat with AI Teacher about a specific note.
 */
export async function chatWithAITeacher(noteId: string, question: string) {
    try {
        const session = await auth();
        if (!session) throw new Error("Unauthorized");

        const note = await prisma.sharedNote.findUnique({
            where: { id: noteId }
        });

        if (!note) throw new Error("Note not found");

        // Limit context to the AI content of the note
        const response = await askAITeacher(note.content, question);
        return { response };

    } catch (error: any) {
        return { error: error.message };
    }
}

/**
 * Generate a quick audio summary script for a note.
 */
export async function getAudioSummary(noteId: string) {
    try {
        const session = await auth();
        if (!session) throw new Error("Unauthorized");

        const note = await prisma.sharedNote.findUnique({
            where: { id: noteId }
        });

        if (!note) throw new Error("Note not found");

        const summary = await generateAudioSummary(note.content);
        return { summary };
    } catch (error: any) {
        return { error: error.message };
    }
}

/**
 * Cleanup expired notes (Internal/Background).
 */
export async function cleanupExpiredNotes() {
    try {
        const schoolId = await getTenantId();
        const expiredNotes = await prisma.sharedNote.findMany({
            where: {
                schoolId,
                expiresAt: { lt: new Date() }
            }
        });

        if (expiredNotes.length === 0) return { success: true, count: 0 };

        // 1. Delete from Database
        await prisma.sharedNote.deleteMany({
            where: {
                id: { in: expiredNotes.map((n: any) => n.id) }
            }
        });

        // 2. Drive cleanup would happen here if we tracked Drive IDs separately.
        // For now, we rely on Drive's own lifecycle or manual cleanup if needed.

        return { success: true, count: expiredNotes.length };
    } catch (error) {
        console.error("[CLEANUP_NOTES]", error);
        return { error };
    }
}
