import { GoogleGenAI } from "@google/genai";

// Ensure the API key is available from the environment variables
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const initialPrompt = `You are an expert web developer specializing in creating pixel-perfect, single-file HTML replications of websites. Your task is to take the provided HTML document, which contains cleaned markup and consolidated CSS, and generate a new, single HTML file that accurately reproduces the visual design.

**Instructions:**
1.  Analyze the provided HTML body and the consolidated CSS in the <style> tag.
2.  Your output MUST be a single, complete HTML file.
3.  Do not add any explanations or commentary outside of the HTML code.
4.  Your response should start with \`<!DOCTYPE html>\` and end with \`</html>\`.
5.  Ensure all necessary styles are included in a <style> tag in the <head> to make the file self-contained.
6.  Pay close attention to layout, typography, colors, and spacing to match the original design as closely as possible.

Here is the source HTML to replicate:
`;

const parseHtmlFromMarkdown = (markdown: string): string => {
    const match = markdown.match(/```html\n([\s\S]+)\n```/);
    return match ? match[1] : markdown;
}

export const generateReplication = async (
    htmlPrompt: string, 
    onChunk: (chunk: string) => void
): Promise<void> => {
    const fullPrompt = initialPrompt + '\n' + htmlPrompt;
    
    try {
        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-pro',
            contents: fullPrompt,
        });

        let fullResponse = '';
        for await (const chunk of responseStream) {
            const chunkText = chunk.text;
            if (chunkText) {
                fullResponse += chunkText;
                // Clean the streaming response on the fly to provide a better preview
                const cleanedChunk = parseHtmlFromMarkdown(fullResponse);
                onChunk(cleanedChunk);
            }
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while calling the Gemini API.");
    }
};