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
            // Rich Slide Generation with MindMap + Visual Metadata
            prompt = `You are a World-Class Curriculum Architect. Build an engaging slide deck in ${language} for ${teacherName} at ${schoolName}.

AVAILABLE LAYOUTS:
- "STUDIO_CENTER": Hero slide with massive title, a key_stat (value+label), and speaker_notes.
- "STUDIO_SPLIT": Left side = text points, Right side = visual object with type/label/elements array.
- "STUDIO_GRID": 3 grid items, each with emoji, title, description.
- "STUDIO_TIMELINE": process_steps array, each with step number, label, description.
- "STUDIO_MINDMAP": A concept map. Has center_node (string) and branches (array of {label, children: string[]}).
- "STUDIO_GRAPH": Data visualization. Has chart_type ("bar" | "pie"), labels (string[]), and values (number[]).
- "STUDIO_DIAGRAM": Flowchart/Process. Has nodes (string[]) and edges (array of {from, to, label}).

RULES:
1. Include AT LEAST 1 STUDIO_MINDMAP slide (typically the 2nd or 3rd slide) to show concept relationships.
2. Include AT LEAST 1 STUDIO_GRAPH if there are any statistics or comparisons in the summary.
3. Include AT LEAST 1 STUDIO_DIAGRAM for any complex logic or "how it works" sections.
4. Include AT LEAST 2 STUDIO_SPLIT slides with descriptive visual objects.
5. All text fields must be strings (not objects). points must be an array of strings.
6. speaker_notes must be a string of 1-2 sentences.
7. Respond ONLY with a valid JSON array. No markdown, no code fences.

JSON EXAMPLE:
[
  {"layout":"STUDIO_CENTER","emoji":"🧬","title":"DNA REPLICATION","key_stat":{"value":"99.99%","label":"Accuracy Rate"},"speaker_notes":"Emphasize the proofreading enzymes."},
  {"layout":"STUDIO_GRAPH","emoji":"📊","title":"MARKET GROWTH","chart_type":"bar","labels":["2022","2023","2024"],"values":[45,78,120],"speaker_notes":"Notice the exponential jump in 2024."},
  {"layout":"STUDIO_MINDMAP","emoji":"🧠","title":"CORE CONCEPTS","center_node":"DNA","branches":[{"label":"Structure","children":["Double Helix","Base Pairs","Sugar-Phosphate"]},{"label":"Function","children":["Replication","Transcription","Translation"]}],"speaker_notes":"Walk through each branch slowly."},
  {"layout":"STUDIO_DIAGRAM","emoji":"⚙️","title":"WORKFLOW","nodes":["Input","Process","Output"],"edges":[{"from":"Input","to":"Process","label":"Upload"},{"from":"Process","to":"Output","label":"Analyze"}],"speaker_notes":"This is the core pipeline."},
  {"layout":"STUDIO_SPLIT","emoji":"⚗️","title":"ENZYME ROLES","points":["Helicase unzips the double helix","DNA Polymerase adds new nucleotides","Ligase seals the backbone"],"visual":{"type":"diagram","label":"REPLICATION FORK","color":"indigo","elements":["Helicase","Template","Polymerase","New Strand"]},"speaker_notes":"Draw the fork on the board."}
]

Generate 10-12 slides covering the full topic. Use all layout types.
RESEARCH SUMMARY:
${summary}

JSON ONLY:`;
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
