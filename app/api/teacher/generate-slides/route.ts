import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

async function listAuthorizedModels(apiKey: string): Promise<string> {
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
        if (!res.ok) return "";
        const data = await res.json();
        return (data.models || []).map((m: any) => m.name.replace('models/', '')).join(', ');
    } catch { return ""; }
}

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

        const authorized = await listAuthorizedModels(apiKey);
        const modelsToTry = [
            "gemini-2.0-flash", "gemini-2.0-flash-exp", "gemini-2.0-pro-exp-02-05",
            "gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"
        ];
        const discovered = authorized.split(', ').map(m => m.trim()).filter(m => m && !modelsToTry.includes(m));
        const finalModelsToTry = [...modelsToTry, ...discovered];

        let result: any = null;
        let lastError = "";
        let usedModel = "";

        let prompt = "";
        if (mode === 'chat') {
            prompt = `You are the Research Studio Hub Assistant for ${schoolName}. 
Role: You are communicating as a "${persona}".
Using ONLY the "Research Summary" below, answer this specific educator query: "${customQuery}"
RULES: Maintain persona, cite summary sections, respond in ${language}.
RESEARCH SUMMARY: ${summary}
ANSWER:`;
        } else if (mode === 'transform') {
            if (template === 'Teaching Briefing') {
                prompt = `Create a 2-page formal educator's BRIEFING DOC from this research summary. Focus on instructional strategies. Language: ${language}. Summary: ${summary}`;
            } else if (template === 'FAQ List') {
                prompt = `Create a list of 10 complex FAQ items (Question + Answer) for students based on summary. Language: ${language}. Summary: ${summary}`;
            } else if (template === 'Chronology') {
                prompt = `Convert core process/events into a structured CHRONOLOGICAL TIMELINE with milestones. Language: ${language}. Summary: ${summary}`;
            } else {
                prompt = `Summarize key insights. Language: ${language}. Summary: ${summary}`;
            }
        } else {
            prompt = `You are a World-Class Curriculum Architect and Senior Graphic Designer. 
Your goal is to build a high-fidelity, professional slides deck in ${language} for ${teacherName} at ${schoolName}.

TOPIC COMPREHENSION & DEPTH:
1. Thoroughly analyze the entire RESEARCH SUMMARY below.
2. Produce content that goes beyond surface-level bullet points. 
3. Use professional terminology and provide deep, accurate insights. 
4. Ensure the logical flow follows a curriculum-grade narrative (Intro -> Core Principles -> Complex Mechanics -> Case Study/Data -> Conclusion).

AVAILABLE LAYOUTS (MANDATORY MIX):
- "STUDIO_CENTER": High-impact hero slide. Use for Intro/Module headers. Must include a meaningful "key_stat" (value + label).
- "STUDIO_SPLIT": Detailed comparisons or evidence. Left: points. Right: deep visual definition (type, label, elements).
- "STUDIO_GRID": Categorizing 3 parallel concepts. Elements must be distinct but related.
- "STUDIO_TIMELINE": Procedural, historical, or mechanical steps (up to 4).
- "STUDIO_MINDMAP": Hierarchical breakdown. center_node must be the core theme. branches must show sub-themes and leaf nodes.
- "STUDIO_GRAPH": Mandatory for any quantitative data found in summary. chart_type ("bar" | "pie").
- "STUDIO_DIAGRAM": Mandatory for logic flows, structural relationships, or feedback loops. nodes[] + edges[].

STYLING RULES:
- emoji: Use sophisticated, relevant emojis (e.g., 🔬 🧬 🏛️ 📊).
- speaker_notes: 2-3 sentences of deep educational context for each slide.
- No markdown, no prefixes. Only a valid JSON array.

GENERATE 10-12 SLIDES. COVER EVERY ASPECT OF THE SUMMARY WITH PROFESSIONAL RIGOUR.

JSON EXAMPLE (Strict adherence required):
[
  {
    "layout": "STUDIO_CENTER",
    "emoji": "🌟",
    "title": "Module Title",
    "key_stat": {"value": "100%", "label": "Retention"},
    "speaker_notes": "Expert narrative about this module."
  }
]

RESEARCH SUMMARY:
${summary}

JSON RESPONSE ONLY:`;
        }

        for (const modelName of finalModelsToTry) {
            try {
                console.log(`[GEN_SLIDES] Trying ${modelName}...`);
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: modelName });
                const response = await model.generateContent(prompt);
                if (response?.response) {
                    result = response;
                    usedModel = modelName;
                    break;
                }
            } catch (e: any) {
                console.error(`[GEN_SLIDES] ${modelName} failed:`, e.message.slice(0, 80));
                lastError = e.message;
            }
        }

        if (!result) {
            return NextResponse.json({ error: "All AI Engines exhausted or over quota.", debug: lastError }, { status: 500 });
        }

        const text = result.response.text();

        if (mode === 'chat') return NextResponse.json({ success: true, answer: text, model: usedModel });
        if (mode === 'transform') return NextResponse.json({ success: true, output: text, model: usedModel });

        // Clean JSON - remove markdown fences if present
        const cleaned = text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
        const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            return NextResponse.json({ error: "AI failed to build valid JSON deck.", debug: text.slice(0, 200) }, { status: 500 });
        }

        const slideData = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ success: true, slideData, model: usedModel });

    } catch (error: any) {
        console.error("[GENERATE_SLIDES_API_ERROR]", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
