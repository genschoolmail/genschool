import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

async function scrapeLink(url: string) {
    try {
        const res = await fetch(url, { next: { revalidate: 3600 } });
        const html = await res.text();

        // Basic extraction: Title + Meta Description + some body text
        const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1] : url;

        const metaDescMatch = html.match(/<meta name="description" content="([\s\S]*?)"/i);
        const metaDesc = metaDescMatch ? metaDescMatch[1] : "";

        // Extract some text from paragraphs (limited for context size)
        const paragraphs = html.match(/<p>([\s\S]*?)<\/p>/gi) || [];
        const bodyPreview = paragraphs.slice(0, 5).map(p => p.replace(/<[^>]*>?/gm, '')).join(' ');

        return `Source: ${url}\nTitle: ${title}\nDescription: ${metaDesc}\nContent Preview: ${bodyPreview}\n`;
    } catch (e) {
        return `Source: ${url} (Could not reach this link)\n`;
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "TEACHER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;
        const linksJson = formData.get("links") as string;
        const language = (formData.get("language") as string) || "English";
        const links: string[] = JSON.parse(linksJson || "[]");

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return NextResponse.json({ error: "API Key missing" }, { status: 500 });

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        let context = "EXTRACTED RESEARCH DATA:\n\n";

        // 1. Process File
        if (file && file.size > 0) {
            const arrayBuffer = await file.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString("base64");
            const mimeType = file.type || "application/pdf";

            context += `PRIMARY DOCUMENT (${file.name}): [Content provided via multimodal input]\n`;

            // Initial analysis of the file to get its core message
            const fileResult = await model.generateContent([
                "Extract the core educational content from this file and summarize it in 500 words for a teacher's lesson foundation.",
                { inlineData: { data: base64, mimeType } }
            ]);
            context += fileResult.response.text() + "\n\n";
        }

        // 2. Process Links
        if (links.length > 0) {
            context += "EXTERNAL RESEARCH LINKS:\n";
            for (const link of links) {
                const info = await scrapeLink(link);
                context += info + "---\n";
            }
        }

        // 3. Synthesize Everything
        const synthesisPrompt = `You are an elite educational researcher. I have provided research data from a document and external links in ${language}.

TASK: Consolidate all this information into a single, high-fidelity "Lesson Foundation" summary. 
RULES:
1. Stay 100% faithful to the source material. Use verbatim quotes where possible.
2. Organize it logically: Overview, Core Concepts, Detailed Explanations, and Key Takeaways.
3. Keep it deep and technical; do not oversimplify.
4. This summary will be used to generate slides, so make it comprehensive (approx 800-1200 words).
5. Respond in ${language}.

RESEARCH DATA:
${context}

MASTER LESSON FOUNDATION:`;

        const result = await model.generateContent(synthesisPrompt);
        const synthesis = result.response.text();

        return NextResponse.json({ success: true, synthesis });

    } catch (error: any) {
        console.error("[SYNTHESIZE_API]", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
