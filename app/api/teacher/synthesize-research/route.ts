import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

async function scrapeLink(url: string): Promise<string> {
    try {
        const res = await fetch(url, { signal: AbortSignal.timeout(8000), next: { revalidate: 3600 } });
        const html = await res.text();
        const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : url;
        const metaDescMatch = html.match(/meta name="description" content="([\s\S]*?)"/i);
        const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : "";
        const paragraphs = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
        const bodyText = paragraphs.slice(0, 8).map(p => p.replace(/<[^>]*>/gm, '')).join(' ').slice(0, 2000);
        return `[WEB SOURCE: ${url}]\nTitle: ${title}\nDescription: ${metaDesc}\nContent: ${bodyText}\n`;
    } catch {
        return `[WEB SOURCE: ${url}] - Could not fetch this URL.\n`;
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
        const persona = (formData.get("persona") as string) || "Academic Deep Dive";
        const links: string[] = JSON.parse(linksJson || "[]");

        if (files.filter(f => f.size > 0).length === 0 && links.length === 0) {
            return NextResponse.json({ error: "No sources provided" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });

        // Initialize with default (v1beta) or try forcing stable v1 if possible
        const genAI = new GoogleGenerativeAI(apiKey);

        // Comprehensive Model List to handle varying account/region availability
        const modelsToTry = [
            "gemini-2.0-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash",
            "gemini-1.5-flash-001",
            "gemini-1.5-flash-002",
            "gemini-pro"
        ];

        let lastError = "";
        let finalModelUsed = "";
        let result: any = null;

        const systemPrompt = `You are a World-Class Academic Researcher working as a "${persona}".
Analyze ALL provided source materials and synthesize a comprehensive research summary in ${language}.

PERSONA STYLE - ${persona}:
${persona === 'Academic Deep Dive' ? 'Be formal, thorough, cite concepts, use academic language.' : ''}
${persona === 'Classroom Storytelling' ? 'Use engaging stories, analogies, relatable examples.' : ''}
${persona === 'Skeptical Analyst' ? 'Highlight contradictions, assumptions, and data gaps.' : ''}
${persona === 'Quick Summary' ? 'Be concise — only the top 10% most important facts, in bullet form.' : ''}

Structure your synthesis as:
## Executive Summary
(2-3 paragraph overview)
## Core Concepts
(Key ideas, definitions, mechanisms)
## Key Facts & Data
(Statistics, numbers, specific evidence)
## Student Takeaways
(What must be remembered — 5-8 bullet points)

Respond ONLY in ${language}. Be thorough.`;

        const contentParts: any[] = [{ text: systemPrompt }];
        const validFiles = files.filter(f => f.size > 0);

        for (const file of validFiles) {
            const arrayBuffer = await file.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString("base64");
            const mimeType = file.type || "application/pdf";
            contentParts.push({ text: `\n[FILE: ${file.name}]` });
            contentParts.push({ inlineData: { data: base64, mimeType } });
        }
        for (const link of links) {
            const linkContent = await scrapeLink(link);
            contentParts.push({ text: linkContent });
        }
        contentParts.push({ text: "\n\n---\nSYNTHESIS:" });

        for (const modelName of modelsToTry) {
            try {
                // Skip non-vision models if files are present
                if (modelName === "gemini-pro" && validFiles.length > 0) continue;

                console.log(`[SYNTHESIZE] Trying model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                result = await model.generateContent({ contents: [{ role: "user", parts: contentParts }] });

                if (result && result.response) {
                    finalModelUsed = modelName;
                    break;
                }
            } catch (e: any) {
                console.error(`[SYNTHESIZE] Model ${modelName} failed:`, e.message);
                lastError = `${modelName}: ${e.message}`;
            }
        }

        if (!result || !result.response) {
            return NextResponse.json({
                error: `All AI Engines failed to respond. This usually means the API Key is invalid or restricted in your region.`,
                debug: lastError
            }, { status: 500 });
        }

        const synthesis = result.response.text();

        if (!synthesis || synthesis.trim().length < 50) {
            return NextResponse.json({ error: "AI returned insufficient content. Try again or use different sources." }, { status: 500 });
        }

        return NextResponse.json({ success: true, synthesis, model: finalModelUsed });

    } catch (error: any) {
        console.error("[SYNTHESIZE_API_ERROR]", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
