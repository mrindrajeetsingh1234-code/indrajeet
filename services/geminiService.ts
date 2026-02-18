
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Caption } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// TURBO CAPTIONS - Using Flash Lite for maximum speed
export const generateCaptions = async (videoBase64: string, mimeType: string): Promise<Caption[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-flash-lite-latest',
    contents: [
      {
        parts: [
          { inlineData: { data: videoBase64, mimeType: mimeType } },
          { text: "Transcribe this video. Output JSON only: [{start: number, end: number, text: string}]. Be extremely fast and precise." },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            start: { type: Type.NUMBER },
            end: { type: Type.NUMBER },
            text: { type: Type.STRING },
          },
          required: ["start", "end", "text"],
        },
      },
    },
  });

  try {
    const rawJson = response.text?.trim() || "[]";
    const captions: any[] = JSON.parse(rawJson);
    return captions.map((c, index) => ({ ...c, id: `c-${index}` }));
  } catch (error) {
    console.error("Transcription error:", error);
    return [];
  }
};

// VEO VIDEO GEN
export const createVeoVideo = async (prompt: string, image?: string) => {
  const ai = getAI();
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    image: image ? { imageBytes: image, mimeType: 'image/png' } : undefined,
    config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
  });

  while (!operation.done) {
    await new Promise(r => setTimeout(r, 8000));
    operation = await ai.operations.getVideosOperation({ operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
};

// PRO ANALYSIS WITH THINKING
export const deepAnalyze = async (prompt: string, media?: { data: string, mimeType: string }) => {
  const ai = getAI();
  const contents: any[] = [{ parts: [{ text: prompt }] }];
  if (media) contents[0].parts.unshift({ inlineData: media });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents,
    config: {
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });
  return response.text;
};

// IMAGE GENERATION (Pro)
export const generateImagePro = async (prompt: string, ratio: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: ratio as any, imageSize: "1K" } }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
};
