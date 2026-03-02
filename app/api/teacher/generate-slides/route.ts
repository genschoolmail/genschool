import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

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
            return NextResponse.json({ error: "GEMINI_API_KEY not configured." }, { status: 500 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const mimeType = file.type || "application/pdf";

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are an expert educator creating a rich, visual presentation in ${language}.

Analyze the provided document and generate slide content. Respond ONLY with a valid JSON array, no extra text.

Each slide must have an "emoji" field (a relevant single emoji). Use this exact format:
[
  { "type": "title", "emoji": "🧬", "title": "Main Topic Title", "subtitle": "Engaging subtitle describing this lesson" },
  { "type": "content", "emoji": "📖", "title": "Section Name", "points": ["Detailed point 1", "Detailed point 2", "Detailed point 3", "Detailed point 4"] },
  { "type": "content", "emoji": "💡", "title": "Key Concepts", "points": ["Concept with explanation", "Another concept", "Third concept", "Fourth concept"] },
  { "type": "quiz", "emoji": "❓", "title": "Check Your Understanding", "questions": [{"q": "Question?", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Option A"}, {"q": "Second question?", "options": ["A", "B", "C", "D"], "answer": "B"}] },
  { "type": "lesson_plan", "emoji": "📋", "title": "Lesson Plan", "objectives": ["Students will understand X", "Students will apply Y"], "activities": ["Group discussion on topic", "Worksheet activity"] },
  { "type": "summary", "emoji": "✅", "title": "Key Takeaways", "points": ["Most important learning", "Second learning", "Third learning", "Fourth learning"] }
]

Rules:
- Generate 6-8 slides minimum
- Each content slide should have 3-5 detailed bullet points
- Make quiz have 3-5 questions
- Choose emojis that match the subject matter
- Respond ONLY with the JSON array`;

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: base64, mimeType } }
        ]);

        const text = result.response.text();
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            console.error("[AI_SLIDES] Raw:", text.substring(0, 500));
            return NextResponse.json({ error: "AI could not parse the document. Try a clearer file." }, { status: 500 });
        }

        const slideData = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ success: true, slideData, fileName: file.name });

    } catch (error: any) {
        console.error("[GENERATE_SLIDES_API]", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
