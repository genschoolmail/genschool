import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Generates slide-by-slide content, including Quiz, Lesson Plan, and References.
 */
export async function generateSlideContent(sourceText: string, language: string = "English") {
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

    const prompt = `
        You are an expert educator. Based on the following source text, generate a structured classroom slide deck content in ${language}.
        
        The response MUST be a valid JSON array of objects, where each object represents a slide:
        [
            { "type": "title", "title": "Topic Name", "subtitle": "Overview" },
            { "type": "content", "title": "Section Title", "points": ["Point 1", "Point 2", ...] },
            { "type": "quiz", "title": "Check Your Understanding", "questions": [{ "q": "Question?", "options": ["A", "B", "C", "D"], "answer": "A" }] },
            { "type": "lesson_plan", "title": "Lesson Plan", "objectives": ["Obj 1", "Obj 2"], "activities": ["Activity 1"] },
            { "type": "references", "title": "Further Reading", "links": [{ "label": "YouTube", "url": "link" }] }
        ]

        Source Text:
        ${sourceText}
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        throw new Error("AI did not return a valid JSON structure.");
    } catch (error) {
        console.error("[GEMINI_SLIDES]", error);
        throw error;
    }
}

/**
 * AI Teacher Chatbot Logic: Context-aware Q&A.
 */
export async function askAITeacher(noteContent: string, question: string, language: string = "English") {
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

    const prompt = `
        You are a friendly and helpful AI Teacher. You are helping a student understand a specific lesson.
        
        CONTEXT (Lesson Notes):
        ${noteContent}

        STUDENT QUESTION:
        ${question}

        INSTRUCTIONS:
        1. Answer the question specifically using the context above.
        2. If the answer is NOT in the context, politely say: "I don't have that information in today's lesson, but based on what we covered, I can tell you about [related point from the notes]."
        3. Respond in ${language}.
        4. Be encouraging, clear, and accurate.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("[GEMINI_CHAT]", error);
        throw error;
    }
}

/**
 * Generates flashcards for student revision.
 */
export async function generateFlashcards(content: string, language: string = "English") {
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

    const prompt = `
        Based on the following lesson, generate 5-8 flashcards in ${language}.
        The response MUST be a valid JSON array:
        [ { "front": "Question/Term", "back": "Answer/Definition" } ]

        Lesson Content:
        ${content}
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        throw new Error("AI did not return valid flashcards.");
    } catch (error) {
        console.error("[GEMINI_FLASHCARDS]", error);
        throw error;
    }
}

/**
 * Generates an audio script for a quick summary.
 */
export async function generateAudioSummary(content: string, language: string = "English") {
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

    const prompt = `
        Create a 1-minute engaging audio summary script of this lesson in ${language}.
        Speak as a friendly teacher recapping the main highlights.

        Lesson Content:
        ${content}
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("[GEMINI_AUDIO]", error);
        throw error;
    }
}
