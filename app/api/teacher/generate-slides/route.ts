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
        const {
            summary,
            language = "English",
            teacherName = "Teacher",
            schoolName = "School",
            mode = 'slides',
            customQuery = '',
            persona = "Academic Deep Dive",
            template = 'briefing'
        } = body;

        if (!summary) return NextResponse.json({ error: "No research summary provided" }, { status: 400 });

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return NextResponse.json({ error: "API Key missing" }, { status: 500 });

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        if (mode === 'chat') {
            const chatPrompt = `You are the Research Studio Hub Assistant for ${schoolName}. 
Role: You are communicating as a "${persona}".
Using ONLY the "Research Summary" below, answer this specific educator query: "${customQuery}"

RULES:
1. Maintain the persona: ${persona}.
2. Be professional, detailed, and cite sections of the summary.
3. If the user asks for a simplification, provide it while maintaining technical accuracy.
4. Respond in ${language}.

RESEARCH SUMMARY:
${summary}

ANSWER:`;
            const result = await model.generateContent(chatPrompt);
            return NextResponse.json({ success: true, answer: result.response.text() });
        }

        if (mode === 'transform') {
            let transformPrompt = "";
            if (template === 'briefing') {
                transformPrompt = `Create a 2-page formal educator's BRIEFING DOC from this research summary. 
Focus on instructional strategies and core concepts. Language: ${language}. Ground yourself strictly in this text: ${summary}`;
            } else if (template === 'faq') {
                transformPrompt = `Create a list of 10 complex FAQ items (Question + Answer) for students based on this research summary. 
Include deep-learning questions. Language: ${language}. Ground yourself strictly in this text: ${summary}`;
            } else if (template === 'timeline') {
                transformPrompt = `Convert the core process or historical events in this research summary into a structured CHRONOLOGICAL TIMELINE. 
Use clear timestamps/milestones. Language: ${language}. Text: ${summary}`;
            } else if (template === 'graph') {
                transformPrompt = `Create a Mermaid.js flowchart or mindmap representing the Knowledge Graph of this research summary.
Use [Node Label] format. Focus on connections between entities. 
IMPORTANT: Give ONLY the Mermaid code block starting with 'graph TD' or 'mindmap'.
Text: ${summary}`;
            }

            const result = await model.generateContent(transformPrompt);
            return NextResponse.json({ success: true, output: result.response.text() });
        }

        // --- Slide Generation Mode ---
        const prompt = `You are a World-Class Curriculum Architect and Gamma-Style Presentation Designer.
Build a "Studio v2: Card-Native" slide deck in ${language} for ${teacherName}.

DESIGN PHILOSOPHY (GAMMA-STYLE):
- **Card-Native:** Slides must feel like interconnected "web cards" rather than static pages.
- **Visual Storytelling:** Use complex 3D minimalist descriptions for visuals.
- **Studio Aesthetics:** Deep navy backgrounds (#0A0A0A), Magic Yellow accents (#E8FF41), and Extra-Bold tracking-tight typography.

REQUIRED LAYOUTS:
- "STUDIO_CENTER": Massive hero typography with a single "Visual Fact" (e.g., a statistic with a sub-label).
- "STUDIO_SPLIT": 50/50 division. Detailed text with Yellow Highlighters on left | High-fidelity technical 3D visual on right.
- "STUDIO_GRID": 3 items with distinct emojis and narrative blocks.
- "STUDIO_TIMELINE": A horizontal process flow with 3-4 steps.

JSON SPECIFICATION:
[
  { 
    "type": "content", 
    "layout": "STUDIO_SPLIT",
    "emoji": "🔋", 
    "title": "ENERGY STORAGE SYSTEMS", 
    "points": ["Point 1 with detail", "Point 2 with detail", "Point 3 with detail"],
    "visual": { 
        "type": "technical_diagram", 
        "label": "ION FLOW SYSTEM",
        "elements": ["Anode", "Cathode", "Electrolyte"] 
    },
    "speaker_notes": "Deep dive into the ion transfer mechanism..."
  }
]

Generate 10-12 slides. Stay 100% faithful to the Research Summary. Respond ONLY with JSON.

RESEARCH SUMMARY:
${summary}

SLIDE JSON:`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            console.error("[STUDIO_GEN_V2] JSON MATCH FAILED:", text.substring(0, 500));
            return NextResponse.json({ error: "AI failed to build the studio deck." }, { status: 500 });
        }

        const slideData = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ success: true, slideData });

    } catch (error: any) {
        console.error("[GENERATE_SLIDES_API]", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
