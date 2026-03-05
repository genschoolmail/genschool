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
            template = 'briefing',
            designStyle = "Professional, grounded, and structurally rigorous"
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
            } else if (template === 'Master Study Guide') {
                prompt = `Create a "Master Study Guide" optimized for PDF export based on this research summary.
Language: ${language}.
Format as strict Markdown with explicit H1, H2, and H3 headers.
Must include EXACTLY:
1. At the very top, these exact placeholders on their own lines: 
[SCHOOL_LOGO]
[SCHOOL_NAME]
2. "## Quick Recall": A bulleted list of 10 rapid-fire key facts.
3. "## Deep Dive": Detailed paragraphs elaborating on 3-4 core concepts.
4. "## Self-Assessment": 5 Multiple Choice Questions (MCQs) with an answer key at the bottom.
Summary: ${summary}`;
            } else {
                prompt = `Summarize key insights. Language: ${language}. Summary: ${summary}`;
            }
        } else {
            prompt = `You are the "Core Intelligence Engine", acting as a World-Class Curriculum Architect and Senior Presentation Designer. 
Your goal is to build a high-fidelity, professional slides deck in ${language} for ${teacherName} at ${schoolName}.

STYLE DIRECTIVE: MIRROR GOOGLE NOTEBOOKLM PROFESSIONAL AESTHETIC.
- Clean, Minimalist, High-Impact.
- Use whitespace effectively.
- Typography: Clear, hierarchical, academic.
- Backgrounds: Professional light/soft palettes (unless the visual_prompt specifies otherwise).

CUSTOM DESIGN BRIEF (CRITICAL):
Follow this narrative, structural, and stylistic directive from the user: "${designStyle}"

STRICT GROUNDING & CONTENT RULES:
1. ONLY use information from the RESEARCH SUMMARY below. Absolutely no hallucinations or external facts.
2. Every slide MUST include bracketed citations in the speaker_notes or content (e.g., [Source: Page X]).
3. RULE OF 6x6: For any bulleted list, use a MAXIMUM of 6 bullets per slide, and a MAXIMUM of 6 words per bullet. Be punchy and concise.
4. INFOGRAPHICS REQUIRED: You MUST use "STUDIO_MINDMAP", "STUDIO_DIAGRAM", "STUDIO_GRAPH", and "STUDIO_TIMELINE" layouts to represent complex relationships, cycles, hierarchies, and metrics. Avoid plain text slides where a visual representation is possible.

REQUIRED SLIDE DECK STRUCTURE (10-15 Slides):
Slide 1: Title Slide (STUDIO_CENTER)
Slide 2: Agenda (STUDIO_GRID or SPLIT)
Middle Slides: Core Concepts (MINDMAPS), Deep Dives (DIAGRAMS), Case Studies (SPLIT)
Penultimate Slide: Summary / Conclusion (CENTER)
Final Slide: Knowledge Check / Quiz Reflection (GRID)

AVAILABLE LAYOUTS (MANDATORY MIX):

- "STUDIO_CENTER": High-impact hero slide. Use for Intro/Module headers. Must include a meaningful "key_stat" (value + label).
- "STUDIO_SPLIT": Detailed comparisons or evidence. Left: points. Right: deep visual definition (type, label, elements).
- "STUDIO_GRID": Categorizing 3 parallel concepts. Elements must be distinct but related.
- "STUDIO_TIMELINE": Procedural, historical, or mechanical steps (up to 4).
- "STUDIO_MINDMAP": Hierarchical breakdown. center_node must be the core theme. branches must show sub-themes and leaf nodes.
- "STUDIO_GRAPH": Mandatory for any quantitative data found in summary. chart_type ("bar" | "pie").
- "STUDIO_DIAGRAM": Mandatory for logic flows, structural relationships, or feedback loops. nodes[] + edges[].

STYLING RULES:
- emoji: Use sophisticated, relevant emojis.
- visual_prompt: CRITICAL. Provide a 10-15 word descriptive prompt for an AI image generator (e.g., "A futuristic laboratory with holographic DNA strands, cinematic lighting, 8k"). This will be used to generate a background/focal image.
- speaker_notes: CRITICAL. Every slide must have 3-4 sentences of deep educational context PLUS citations [Source: X].
- No markdown, no prefixes. Only a valid JSON array.

GENERATE 10-12 SLIDES. COVER EVERY ASPECT OF THE SUMMARY WITH PROFESSIONAL RIGOUR.

JSON EXAMPLE (Strict adherence required):
[
  {
    "layout": "STUDIO_CENTER",
    "emoji": "🌟",
    "title": "Module Title",
    "visual_prompt": "Professional cinematic wide shot of a tech-focused university campus",
    "key_stat": {"value": "100%", "label": "Retention"},
    "speaker_notes": "Expert narrative about this module [Source: 1]."
  },
  {
    "layout": "STUDIO_MINDMAP",
    "emoji": "🧠",
    "title": "Core Architecture",
    "center_node": "System Kernel",
    "branches": [{"label": "Memory"}, {"label": "CPU"}, {"label": "I/O"}],
    "visual_prompt": "Complex electrical circuit board with glowing blue pathways",
    "speaker_notes": "Breakdown of the kernel structure [Source: 2]."
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
