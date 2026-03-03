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
        const files = formData.getAll("file") as File[];
        const linksJson = formData.get("links") as string;
        const language = (formData.get("language") as string) || "English";
        const links: string[] = JSON.parse(linksJson || "[]");

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return NextResponse.json({ error: "API Key missing" }, { status: 500 });

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" }); // Using Flash for speed and large context

        let context = "THE RESEARCH LIBRARY:\n\n";

        // 1. Process All Files
        if (files.length > 0) {
            for (const file of files) {
                if (file.size === 0) continue;
                const arrayBuffer = await file.arrayBuffer();
                const base64 = Buffer.from(arrayBuffer).toString("base64");
                const mimeType = file.type || "application/pdf";

                context += `SOURCE FILE (${file.name}):\n`;
                const fileResult = await model.generateContent([
                    "Extract all critical instructional data, technical definitions, and core arguments from this document. Provide a dense, long-form reconstruction of the content (1000+ words if needed).",
                    { inlineData: { data: base64, mimeType } }
                ]);
                context += fileResult.response.text() + "\n\n---\n";
            }
        }

        // 2. Process All Links
        if (links.length > 0) {
            for (const link of links) {
                const info = await scrapeLink(link);
                context += `WEB SOURCE:\n${info}\n---\n`;
            }
        }

        const persona = (formData.get("persona") as string) || "Academic Deep Dive";

        // 3. Master Synthesis for the Research Hub
        const synthesisPrompt = `You are a World-Class Academic Researcher and Educator acting as a "${persona}".
I have provided a MASSIVE amount of raw research data from multiple sources (Docs and Web).

GOAL: Build a "Synthetic Brain" (Foundation) for a student lesson in ${language}.

TONE & PERSPECTIVE:
- Use the perspective of a ${persona}.
- ${persona === 'Academic Deep Dive' ? 'Be extremely formal, cite every theory, and focus on ontological foundations.' : ''}
- ${persona === 'Classroom Storytelling' ? 'Use engaging analogies, vivid examples, and focus on narrative flow.' : ''}
- ${persona === 'Skeptical Analyst' ? 'Focus on contradictions between sources, challenge the assumptions, and highlight data gaps.' : ''}
- ${persona === 'Quick Summary' ? 'Be bulleted, punchy, and focus ONLY on the top 10% most critical facts.' : ''}

REQUIRED STRUCTURE:
1. Executive Summary: The big picture.
2. Deep Dive: Exhaustive breakdown of core mechanics/theories.
3. Comparative Analysis: How different sources agree or disagree.
4. Key Statistics & Data Points: Explicit numbers and figures.
5. Strategic Takeaways: What students MUST remember.

RULES:
- Be verbose and high-fidelity. If the source material is complex, keep it complex.
- Use verbatim quotes for accuracy.
- Respond in ${language}.

RESEARCH DATA:
${context}

MASTER SYNTHESIS:`;

        const result = await model.generateContent(synthesisPrompt);
        const synthesis = result.response.text();

        return NextResponse.json({ success: true, synthesis });

    } catch (error: any) {
        console.error("[RESEARCH_STUDIO_API]", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
