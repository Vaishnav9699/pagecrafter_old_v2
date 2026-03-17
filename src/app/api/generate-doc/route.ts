import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: NextRequest) {
    try {
        const message = await request.json();
        const apiKey = message.customApiKey || process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("Doc Generator: API Key is missing");
            return NextResponse.json(
                { error: "API Key is not configured. Please add it in Settings." },
                { status: 400 },
            );
        }

        const ai = new GoogleGenAI({
            apiKey: apiKey,
        });

        const config = {
            thinkingConfig: {
                thinkingBudget: -1,
            },
        };
        const model = "gemini-2.5-flash";

        const systemPrompt = `You are PageCrafter Doc AI, an expert word document writer and formatter.
Your job is to generate professional, well-structured document content based on the user's request.

CRITICAL: You must return your response in two parts:
1. Start with 'RESPONSE: ' followed by a brief professional summary of the document you created.
2. Then, provide the document structure exactly between JSON_START and JSON_END markers.

Example Format:
RESPONSE: I have created a professional business proposal document for your review.

JSON_START
{
  "title": "Business Proposal: Cloud Migration Strategy",
  "author": "PageCrafter AI",
  "sections": [
    {
      "heading": "Executive Summary",
      "content": "This proposal outlines a comprehensive strategy for migrating our existing infrastructure to cloud-based solutions. The migration will be executed in three phases over a 12-month period..."
    },
    {
      "heading": "Project Scope",
      "content": "The scope of this project encompasses the migration of all on-premise servers, databases, and applications to a cloud platform. Key deliverables include..."
    },
    {
      "heading": "Timeline & Milestones",
      "content": "Phase 1 (Months 1-3): Assessment and planning\\nPhase 2 (Months 4-8): Core migration\\nPhase 3 (Months 9-12): Testing and optimization..."
    }
  ]
}
JSON_END

Guidelines:
- Create detailed, professional content suitable for a formal Word document.
- Use clear, well-structured headings that flow logically.
- Write thorough, informative paragraphs for each section (at least 3-4 sentences per section).
- Include at least 4-6 sections for comprehensive coverage.
- Use professional language appropriate for business or academic documents.
- Ensure the JSON is valid.
- Use \\n for line breaks within content when needed for lists or formatting.
- CRITICAL: The 'content' field must ALWAYS be a flat string. DO NOT use arrays, objects, or nested JSON within the content field. Format lists using plain text newlines (\\n).`;

        const contents = [
            {
                role: "user",
                parts: [
                    {
                        text: `${systemPrompt}\n\nUser request: ${message.prompt}`,
                    },
                ],
            },
        ];

        console.log("Doc Generator: Starting generation for prompt:", message.prompt);

        const response = await ai.models.generateContentStream({
            model,
            config,
            contents,
        });

        let fullResponse = "";
        for await (const chunk of response) {
            if (chunk.text) {
                fullResponse += chunk.text;
            }
        }

        const responseMatch = fullResponse.match(/RESPONSE:\s*([\s\S]*?)(?=JSON_START|$)/);
        const jsonMatch = fullResponse.match(/JSON_START\s*([\s\S]*?)\s*JSON_END/);

        const responseText = responseMatch ? responseMatch[1].trim() : "I have generated your document content.";

        let documentData = null;
        if (jsonMatch) {
            try {
                const cleanedJson = jsonMatch[1].trim()
                    .replace(/```json/g, '')
                    .replace(/```/g, '');
                documentData = JSON.parse(cleanedJson);
            } catch (parseError) {
                console.error("Doc Generator: JSON Parse Error:", parseError);
                documentData = { title: "Error", sections: [{ heading: "Error", content: "Failed to parse document data." }] };
            }
        } else {
            console.warn("Doc Generator: No JSON markers found");
            documentData = { title: "Error", sections: [{ heading: "Error", content: "AI failed to return structured data." }] };
        }

        return NextResponse.json({
            response: responseText,
            document: documentData
        });
    } catch (error) {
        console.error("Error in Doc generation route:", error);
        return NextResponse.json(
            { error: "Failed to generate document content." },
            { status: 500 },
        );
    }
}
