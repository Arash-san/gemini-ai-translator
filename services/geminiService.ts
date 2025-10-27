
import { GoogleGenAI, Modality } from "@google/genai";

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string,
  tone: string,
  modelId: string,
  apiKey: string,
): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      You are an expert translator. Your task is to translate the given text accurately and naturally, considering the specified tone.

      Translate the following text from ${sourceLang} to ${targetLang}.

      The desired tone for the translation is: "${tone}".

      - If the tone is 'oral translation', provide a colloquial and spoken-form translation.
      - If the tone is 'formal', use formal language and grammar.
      - If the tone is 'friendly', make it sound warm and approachable.

      Do not add any preamble, introduction, or extra text. Only return the translated text itself.

      Text to translate:
      "${text}"
    `;

    const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error during translation:", error);
    if (error instanceof Error && (error.message.includes('API key not valid') || error.message.includes('API_KEY_INVALID'))) {
        throw new Error("The provided API key is not valid. Please check it and try again.");
    }
    throw new Error("Failed to get translation from Gemini API.");
  }
}

export async function generateSpeech(text: string, voiceId: string, apiKey: string): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: voiceId },
                },
            },
        },
    });
    
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error("No audio data received from API.");
    }
    return base64Audio;
  } catch (error) {
    console.error("Error generating speech:", error);
    if (error instanceof Error && (error.message.includes('API key not valid') || error.message.includes('API_KEY_INVALID'))) {
        throw new Error("The provided API key is not valid. Please check it and try again.");
    }
    throw new Error("Failed to generate speech from Gemini API.");
  }
}
