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

        const body = await req.json();
        const { summary, language = "English", teacherName = "Teacher", schoolName = "School" } = body;

        if (!summary) return NextResponse.json({ error: "No research summary provided" }, { status: 400 });

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return NextResponse.json({ error: "API Key missing" }, { status: 500 });

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are a curriculum designer for ${schoolName}. Use the provided Research Summary to create a premium, NotebookLM-style slide deck in ${language} for ${teacherName}'s class.

RULES:
1. RESPONSE FORMAT: ONLY valid JSON array.
2. CONTENT FIDELITY: Every slide must stay 100% faithful to the Research Summary. Do not invent facts.
3. STRUCTURE: Generate 10-12 slides.
4. SLIDE SCHEMES: Each slide MUST follow one of these types:
   - "type": "title" (Hero Intro)
   - "type": "content" (Deep Bullet Points)
   - "type": "quiz" (Interactive Questions)
   - "type": "summary" (Final Wrap-up)

5. VISUALS: Every slide MUST have a "visual" object:
   - "visual": { "type": "process", "steps": [...] }
   - "visual": { "type": "comparison", "left": "...", "right": "...", "difference": "..." }
   - "visual": { "type": "facts", "data": [{"label": "...", "value": "..."}] }
   - "visual": { "type": "mindmap", "center": "...", "branches": [...] }

6. TEACHER INSIGHTS: Every slide MUST have "speaker_notes" (2-3 sentences of extra detail for the teacher to say aloud).

JSON FORMAT EXAMPLE:
[
  { 
    "type": "title", 
    "emoji": "🧬", 
    "title": "Topic Name", 
    "subtitle": "Clear Overview",
    "visual": { "type": "facts", "data": [{"label": "Difficulty", "value": "Advanced"}] },
    "speaker_notes": "Welcome to the class. Today we explore X based on our latest research."
  },
  ...
]

RESEARCH SUMMARY (SOURCE):
${summary}

SLIDE JSON:`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            console.error("[GENERATE_SLIDES_V3] JSON MATCH FAILED:", text.substring(0, 500));
            return NextResponse.json({ error: "AI failed to build slides. Check your summary format." }, { status: 500 });
        }

        const slideData = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ success: true, slideData });

    } catch (error: any) {
        console.error("[GENERATE_SLIDES_API]", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
