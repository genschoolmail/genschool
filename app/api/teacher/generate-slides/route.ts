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

        const prompt = `You are a world-class curriculum designer for ${schoolName}. Use the provided Research Summary to create an ultra-premium, NotebookLM (2025 Edition) slide deck in ${language} for ${teacherName}'s class.

RULES:
1. **DITTO DESIGN:** Mimic the latest NotebookLM aesthetics: soft pastel gradients, clean white containers, and bold modern typography.
2. **LAYOUT DIVERSITY:** Every slide MUST specify a "layout" from these types:
   - "SPLIT_IMAGE": 50% technical illustration / 50% narrative text.
   - "GRID_CARDS": 2x2 or 3-column micro-cards for features/steps.
   - "HERO_STAT": Center-aligned massive typography for a single profound fact or quote.
   - "DEEP_DIVE": Traditional content layout but with 32px rounded padding.

3. **VISUAL DATA:** The "visual" object must be extremely detailed for vector rendering:
   - For "process": steps must be specific.
   - For "comparison": include "label_left", "label_right", "contrast_point".
   - For "mindmap": include "central_node" and "branches".

4. **TEACHER SYNC:** Every slide MUST include "speaker_notes" (2-4 sentences of deep context for the teacher).

JSON FORMAT:
[
  { 
    "type": "title", 
    "layout": "SPLIT_IMAGE",
    "emoji": "🧬", 
    "title": "Topic Name", 
    "subtitle": "Overview",
    "visual": { "type": "facts", "data": [{"label": "Difficulty", "value": "Advanced"}] },
    "speaker_notes": "Hook the students with a question about X."
  },
  ...
]

Generate 10-12 slides. Stay 100% faithful to the Research Summary. Respond ONLY with JSON.

RESEARCH SUMMARY:
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
