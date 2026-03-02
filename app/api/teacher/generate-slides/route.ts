import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/auth";
import { saveFile } from "@/lib/upload";
import { getTenantId } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";

export const maxDuration = 60; // 60 second timeout for AI processing

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "TEACHER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;
        const language = (formData.get("language") as string) || "English";

        if (!file || file.size === 0) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "GEMINI_API_KEY not configured on the server." }, { status: 500 });
        }

        // Convert file to base64
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const mimeType = file.type || "application/pdf";
        const title = file.name.split(".")[0];

        // Call Gemini API
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        const prompt = `You are an expert educator. Analyze the provided document and generate a structured classroom slide deck in ${language}.

IMPORTANT: Respond ONLY with a valid JSON array. No explanation text before or after.

Format:
[
  { "type": "title", "title": "Main Topic", "subtitle": "Brief overview" },
  { "type": "content", "title": "Section Name", "points": ["Key point 1", "Key point 2", "Key point 3"] },
  { "type": "content", "title": "Another Section", "points": ["Point A", "Point B"] },
  { "type": "quiz", "title": "Check Understanding", "questions": [{"q": "Question?", "options": ["A", "B", "C", "D"], "answer": "A"}] },
  { "type": "lesson_plan", "title": "Lesson Plan", "objectives": ["Objective 1"], "activities": ["Activity 1"] },
  { "type": "references", "title": "Further Reading", "links": [{"label": "Resource", "url": "https://example.com"}] }
]`;

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: base64, mimeType } }
        ]);

        const text = result.response.text();

        // Extract JSON array from AI response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            console.error("[AI_SLIDES] AI response:", text.substring(0, 500));
            return NextResponse.json({ error: "AI could not generate slide content. Please try a clearer document." }, { status: 500 });
        }

        const slideData = JSON.parse(jsonMatch[0]);

        // Generate PDF
        const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        slideData.forEach((slide: any, index: number) => {
            if (index > 0) doc.addPage();

            // Background
            if (index === 0) {
                doc.setFillColor(99, 102, 241); // indigo-500
            } else {
                doc.setFillColor(248, 250, 252); // slate-50
            }
            doc.rect(0, 0, pageWidth, pageHeight, "F");

            // Slide number badge
            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(200, 200, 200);

            // Title
            if (index === 0) {
                doc.setTextColor(255, 255, 255);
            } else {
                doc.setTextColor(30, 41, 59); // slate-800
            }
            doc.setFontSize(24);
            const titleText = slide.title || "Untitled Slide";
            const wrappedTitle = doc.splitTextToSize(titleText, pageWidth - 40);
            doc.text(wrappedTitle, pageWidth / 2, 35, { align: "center" });

            doc.setFontSize(13);
            if (slide.type === "title") {
                doc.setTextColor(index === 0 ? 199 : 100, index === 0 ? 210 : 116, index === 0 ? 254 : 139);
                const subtitle = doc.splitTextToSize(slide.subtitle || "", pageWidth - 60);
                doc.text(subtitle, pageWidth / 2, 60, { align: "center" });
            } else if (slide.type === "content" && slide.points) {
                if (index !== 0) doc.setTextColor(71, 85, 105); // slate-600
                slide.points.slice(0, 8).forEach((p: string, i: number) => {
                    const wrapped = doc.splitTextToSize(`• ${p}`, pageWidth - 50);
                    doc.text(wrapped, 25, 60 + (i * 12));
                });
            } else if (slide.type === "quiz" && slide.questions) {
                if (index !== 0) doc.setTextColor(71, 85, 105);
                slide.questions.slice(0, 3).forEach((q: any, i: number) => {
                    doc.setFontSize(12);
                    const qText = doc.splitTextToSize(`${i + 1}. ${q.q}`, pageWidth - 50);
                    doc.text(qText, 25, 60 + (i * 25));
                    doc.setFontSize(10);
                    if (q.options) {
                        doc.text(q.options.map((o: string, idx: number) => `${String.fromCharCode(65 + idx)}) ${o}`).join("   "), 30, 68 + (i * 25));
                    }
                });
            } else if (slide.type === "lesson_plan") {
                if (index !== 0) doc.setTextColor(71, 85, 105);
                if (slide.objectives) {
                    doc.setFontSize(11);
                    doc.text("Objectives:", 25, 58);
                    slide.objectives.slice(0, 4).forEach((o: string, i: number) => {
                        doc.text(`• ${o}`, 30, 66 + (i * 10));
                    });
                }
            }

            // Footer
            doc.setFontSize(9);
            doc.setTextColor(148, 163, 184); // slate-400
            doc.text(`${session.user.name || "Teacher"} | Slide ${index + 1} of ${slideData.length}`, pageWidth - 15, pageHeight - 8, { align: "right" });
        });

        // Save PDF
        const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
        const schoolId = await getTenantId();
        const pdfFile = new File([pdfBuffer], `${title}-AI-Slides.pdf`, { type: "application/pdf" });
        const fileUrl = await saveFile(pdfFile, "ai-slides", schoolId);

        return NextResponse.json({ success: true, fileUrl, slideData });

    } catch (error: any) {
        console.error("[GENERATE_SLIDES_API]", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
