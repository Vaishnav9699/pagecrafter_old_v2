import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: NextRequest) {
    try {
        const message = await request.json();
        const apiKey = message.customApiKey || process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("PDF Generator: API Key is missing");
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

        const systemPrompt = `You are PageCrafter PDF AI, an expert document designer.
Your job is to generate a professional document content based on the user's request.

CRITICAL: You must return your response in two parts:
1. Start with 'RESPONSE: ' followed by a brief professional summary of the document.
2. Then, provide the document structure exactly between JSON_START and JSON_END markers.

Example Format:
RESPONSE: I have created a professional report on Climate Change.

JSON_START
{
  "title": "Impact of Climate Change 2024",
  "author": "PageCrafter AI",
  "sections": [
    {
      "heading": "Introduction",
      "content": "Climate change refers to long-term shifts in temperatures and weather patterns..."
    },
    {
      "heading": "Current Trends",
      "content": "Recent data shows a significant increase in global average temperatures..."
    }
  ]
}
JSON_END

Guidelines:
- Keep the headings clear and professional.
- Use detailed and informative content for each section.
- CRITICAL: The 'content' field must ALWAYS be a flat string. DO NOT use arrays, objects, or nested JSON within the content field. Format lists using plain text newlines (\n) or bullet points.
- Ensure the JSON is valid.`;

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

        console.log("PDF Generator: Starting generation for prompt:", message.prompt);

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
                console.error("PDF Generator: JSON Parse Error:", parseError);
                documentData = { title: "Error", sections: [{ heading: "Error", content: "Failed to parse document data." }] };
            }
        } else {
            console.warn("PDF Generator: No JSON markers found");
            documentData = { title: "Error", sections: [{ heading: "Error", content: "AI failed to return structured data." }] };
        }

        return NextResponse.json({
            response: responseText,
            document: documentData
        });
    } catch (error) {
        console.error("Error in PDF generation route:", error);
        return NextResponse.json(
            { error: "Failed to generate PDF content." },
            { status: 500 },
        );
    }
}
