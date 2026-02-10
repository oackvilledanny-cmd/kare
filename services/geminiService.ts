
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini API with process.env.API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Review Ontario Daycare logs for CCEYA compliance using Gemini 3 Flash.
 * Focuses on safety, health, and classroom ratios.
 */
export const checkCCEYACompliance = async (dailyLog: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Review this Ontario Daycare log for CCEYA compliance. 
    Log: "${dailyLog}"
    Return a professional assessment focusing on ratios, safety, and health.`,
    config: {
      systemInstruction: "You are a senior inspector for the Ontario Ministry of Education. Be strict, precise, and professional."
    }
  });
  // Use .text property to access content directly
  return response.text || "Analysis unavailable.";
};

/**
 * Generate optimal shift suggestions using Gemini 3 Pro for complex reasoning tasks.
 * Evaluates staff availability against classroom capacity and ratios.
 */
export const getShiftSuggestions = async (staffData: any, classroomData: any) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analyze staff availability and classroom ratios to suggest an optimal shift plan: 
    Staff: ${JSON.stringify(staffData)}
    Rooms: ${JSON.stringify(classroomData)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            staffName: { type: Type.STRING },
            classroom: { type: Type.STRING },
            timeSlot: { type: Type.STRING },
            reasoning: { type: Type.STRING }
          },
          required: ["staffName", "classroom", "timeSlot"],
          propertyOrdering: ["staffName", "classroom", "timeSlot", "reasoning"]
        }
      }
    }
  });
  // Trim response text before parsing as per guidelines
  const text = response.text?.trim() || "[]";
  return JSON.parse(text);
};

/**
 * Analyze and summarize child activities into parent-friendly insights using Gemini 3 Flash.
 * Identifies mood, skills developed, and provides home recommendations.
 */
export const analyzeChildActivity = async (name: string, description: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Summarize this child activity for a parent report. 
    Child: ${name}, Activity: ${description}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          mood: { type: Type.STRING },
          socialInteractions: { type: Type.ARRAY, items: { type: Type.STRING } },
          skills: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendation: { type: Type.STRING }
        },
        propertyOrdering: ["summary", "mood", "socialInteractions", "skills", "recommendation"]
      }
    }
  });
  // Trim response text before parsing as per guidelines
  const text = response.text?.trim() || "{}";
  return JSON.parse(text);
};
