import { GoogleGenAI } from "@google/genai";
import { Subtitle } from "../types";

export const generateCaptions = async (
  audioBase64: string, 
  apiKey: string,
  language: string = "English"
): Promise<Subtitle[]> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelId = "gemini-2.0-flash"; 

  // We are removing responseSchema to allow for more flexible generation 
  // and manually parsing the JSON. This often yields better results for 
  // long transcripts where strict schema validation might truncate or block output.
  const systemInstruction = `
    You are a professional video captioning AI. 
    Your task is to transcribe the audio and format it as a JSON array of subtitles.
    
    Output Format:
    [
      {
        "start": "HH:MM:SS,mmm",
        "end": "HH:MM:SS,mmm",
        "text": "The spoken text"
      },
      ...
    ]

    Rules:
    1. The 'start' and 'end' timestamps must be in SubRip (SRT) format: "HH:MM:SS,mmm" (e.g., "00:00:01,500").
    2. Transcription must be accurate to the audio.
    3. If the language is ${language}, transcribe in ${language}.
    4. Do not include any text other than the JSON array.
    5. Split long sentences into multiple segments for better readability (max 10-15 words per segment).
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "audio/wav",
                data: audioBase64,
              },
            },
            {
              text: `Generate synchronized subtitles for this audio in ${language}. Return ONLY the JSON array.`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.1, // Low temperature for factual transcription
      },
    });

    let jsonText = response.text;
    
    if (!jsonText) {
      throw new Error("No response from AI");
    }

    // Clean up potential markdown formatting (common with Gemini)
    // It might wrap response in ```json ... ```
    jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    jsonText = jsonText.trim();

    // Parse JSON
    let subtitles: Omit<Subtitle, 'id'>[] = [];
    try {
      subtitles = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.log("Raw Text:", jsonText);
      throw new Error("AI response was not valid JSON.");
    }

    if (!Array.isArray(subtitles)) {
       throw new Error("AI response format invalid (not an array).");
    }
    
    if (subtitles.length === 0) {
        // If we get an empty array, it means the model heard silence or couldn't process.
        console.warn("AI returned empty subtitles array.");
    }

    // Add IDs for React keys and ensure text exists
    return subtitles.map((sub, index) => ({
      id: index,
      start: sub.start || "00:00:00,000",
      end: sub.end || "00:00:00,000",
      text: sub.text || ""
    }));

  } catch (error) {
    console.error("Gemini API Error:", error);
    let errorMessage = "Failed to generate captions. Please try again.";
    
    if (error instanceof Error) {
        if (error.message.includes("404") || error.message.includes("not found")) {
            errorMessage = `Model '${modelId}' not found or API key invalid.`;
        } else if (error.message.includes("valid JSON")) {
            errorMessage = "AI response was malformed. Please try again.";
        }
    }
    
    throw new Error(errorMessage);
  }
};