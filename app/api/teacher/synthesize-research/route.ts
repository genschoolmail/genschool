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
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Flash for speed

        const persona = (formData.get("persona") as string) || "Academic Deep Dive";

        // Build content parts for a SINGLE combined AI call
        const parts: any[] = [];
        const promptIntro = `You are a World-Class Academic Researcher acting as a "${persona}".
Analyze ALL the provided sources and build a comprehensive research synthesis in ${language}.

Persona style:
- Academic Deep Dive: formal, theoretical, cite every concept.
- Classroom Storytelling: use analogies and narrative flow.
- Skeptical Analyst: find contradictions and data gaps.
- Quick Summary: bullet-point, top 10% critical facts only.
Active persona: ${persona}.

Structure your response as:
1. Executive Summary (2-3 paragraphs)
2. Core Concepts & Mechanisms
3. Key Facts & Statistics
4. Strategic Takeaways for students

Be concise but comprehensive. Respond in ${language}.`;

        parts.push(promptIntro);

        // Add all file parts inline
        for (const file of files) {
            if (file.size === 0) continue;
            const arrayBuffer = await file.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString("base64");
            const mimeType = file.type || "application/pdf";
            parts.push({ inlineData: { data: base64, mimeType } });
        }

        // Add scraped link content as text
        for (const link of links) {
            const info = await scrapeLink(link);
            parts.push(`\nWEB SOURCE:\n${info}`);
        }

        parts.push("\nMASTER SYNTHESIS:");

        const result = await model.generateContent(parts);
        const synthesis = result.response.text();

        return NextResponse.json({ success: true, synthesis });

    } catch (error: any) {
        console.error("[RESEARCH_STUDIO_API]", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
