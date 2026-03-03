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

        // --- DYNAMIC MODEL DISCOVERY & FALLBACK ---
        const authorized = await listAuthorizedModels(apiKey);
        const modelsToTry = [
            "gemini-2.0-flash",
            "gemini-2.0-flash-exp",
            "gemini-2.0-pro-exp-02-05",
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-pro"
        ];

        // Add discovered models that aren't in our list
        const discovered = authorized.split(', ').map(m => m.trim()).filter(m => m && !modelsToTry.includes(m));
        const finalModelsToTry = [...modelsToTry, ...discovered];

        let result: any = null;
        let lastError = "";
        let usedModel = "";

        // Prepare Prompts
        let prompt = "";
        if (mode === 'chat') {
            prompt = `You are the Research Studio Hub Assistant for ${schoolName}. 
Role: You are communicating as a "${persona}".
Using ONLY the "Research Summary" below, answer this specific educator query: "${customQuery}"
RULES: Maintain persona, cite summary, respond in ${language}.
RESEARCH SUMMARY: ${summary}
ANSWER:`;
        } else if (mode === 'transform') {
            if (template === 'briefing') {
                prompt = `Create a 2-page formal educator's BRIEFING DOC from this research summary. Focus on instructional strategies. Language: ${language}. Summary: ${summary}`;
            } else if (template === 'faq') {
                prompt = `Create a list of 10 complex FAQ items (Question + Answer) for students based on summary. Language: ${language}. Summary: ${summary}`;
            } else if (template === 'timeline') {
                prompt = `Convert core process into a structured CHRONOLOGICAL TIMELINE. Language: ${language}. Summary: ${summary}`;
            } else {
                prompt = `Summarize key insights. Language: ${language}. Summary: ${summary}`;
            }
        } else {
            // Slide Generation
            prompt = `Build a "Studio v2: Card-Native" slide deck in ${language} for ${teacherName}.
Generate 10-12 slides using the STUDIO_CENTER, STUDIO_SPLIT, STUDIO_GRID, STUDIO_TIMELINE layouts.
JSON SPEC: Array of objects with type, layout, emoji, title, points[], visual{type,label,elements[]}, speaker_notes.
Respond ONLY with JSON. SUMMARY: ${summary}
SLIDE JSON:`;
        }

        // --- FALLBACK LOOP (Quota Resilience) ---
        for (const modelName of finalModelsToTry) {
            try {
                console.log(`[GEN_SLIDES] Trying ${modelName}...`);
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: modelName });

                const response = await model.generateContent(prompt);
                if (response && response.response) {
                    result = response;
                    usedModel = modelName;
                    break;
                }
            } catch (e: any) {
                console.error(`[GEN_SLIDES] ${modelName} failed:`, e.message);
                lastError = e.message;
                // If it's a 429 or 404, we continue to the next model
                if (e.message?.includes("429") || e.message?.includes("404")) continue;
                // For other errors, we might want to stop, but let's be aggressive and try all
            }
        }

        if (!result) {
            return NextResponse.json({
                error: "All AI Engines exhausted or over quota.",
                debug: lastError,
                discovery: `Tried: ${finalModelsToTry.join(', ')}`
            }, { status: 500 });
        }

        const text = result.response.text();

        if (mode === 'chat') return NextResponse.json({ success: true, answer: text, model: usedModel });
        if (mode === 'transform') return NextResponse.json({ success: true, output: text, model: usedModel });

        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            return NextResponse.json({ error: "AI failed to build valid JSON deck.", debug: text.slice(0, 100) }, { status: 500 });
        }

        const slideData = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ success: true, slideData, model: usedModel });

    } catch (error: any) {
        console.error("[GENERATE_SLIDES_API_ERROR]", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
