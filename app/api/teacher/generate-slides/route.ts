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

        const prompt = `You are an expert educator creating a premium, NotebookLM-style visual presentation in ${language}.

Analyze the provided document and generate slide content. Respond ONLY with a valid JSON array.

Each slide MUST include:
1. "emoji": A single relevant icon emoji.
2. "visual": A structured object describing a diagram or illustration.
   Formats for "visual":
   - { "type": "process", "steps": ["Step 1", "Step 2", "Step 3"] }
   - { "type": "comparison", "left": "Value A", "right": "Value B", "difference": "Contrast point" }
   - { "type": "facts", "data": [{"label": "Metric", "value": "Number/Info"}] }
   - { "type": "mindmap", "center": "Main Topic", "branches": ["Sub 1", "Sub 2"] }

JSON Format:
[
  { 
    "type": "title", 
    "emoji": "🧬", 
    "title": "Topic Name", 
    "subtitle": "Clear Overview",
    "visual": { "type": "facts", "data": [{"label": "Difficulty", "value": "Advanced"}] }
  },
  { 
    "type": "content", 
    "emoji": "📖", 
    "title": "Core Concept", 
    "points": ["Major point 1", "Major point 2", "Major point 3"],
    "visual": { "type": "process", "steps": ["Inbound", "Processing", "Outbound"] }
  },
  ...
]

Rules:
- Generate 7-10 slides.
- Every slide MUST have a unique "visual" object.
- Make content deep, technical, and educational.
- Respond ONLY with the JSON array.`;

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
