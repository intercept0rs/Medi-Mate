import { GoogleGenAI } from "@google/genai";
import { TranslationSet } from '../types';

const MODEL_NAME = 'gemini-2.5-flash';

let ai: GoogleGenAI | null = null;

const getAi = (): GoogleGenAI => {
    if (!ai) {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
}

export const fetchMedicineInfo = async (medicineName: string, t: TranslationSet): Promise<string> => {
  try {
    const aiInstance = getAi();
    const prompt = `For the medicine "${medicineName}", please provide the following information in a simple, easy-to-understand format suitable for a patient or caretaker:
1. **Primary Use**: What is this medicine for?
2. **Common Side Effects**: List the most common side effects.
3. **Potential Drug Interactions**: What are some common or important drugs it might interact with?
Please start each section with a clear heading.`;
    
    const response = await aiInstance.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error fetching medicine info from Gemini:", error);
    return t.aiDisclaimer || "Could not retrieve information. Please check your connection or API key and try again.";
  }
};

interface HealthReadings {
    systolic: string;
    diastolic: string;
    bloodSugar: string;
    sugarReadingType: 'fasting' | 'afterMeal';
}

export const analyzeHealthReadings = async (readings: HealthReadings, t: TranslationSet): Promise<string> => {
    try {
        const aiInstance = getAi();
        const prompt = `Act as a helpful medical assistant. Analyze the following health readings for a patient and provide a simple, easy-to-understand explanation.
        
        Readings:
        - Blood Pressure: ${readings.systolic} / ${readings.diastolic} mmHg
        - Blood Sugar: ${readings.bloodSugar} mg/dL (${readings.sugarReadingType === 'fasting' ? 'Fasting' : 'After Meal'})

        Please provide the analysis in the following structure:
        1.  **Blood Pressure**: Briefly explain what the numbers mean (e.g., normal, elevated, high).
        2.  **Blood Sugar**: Briefly explain what the number means based on whether it was fasting or after a meal.
        3.  **General Advice**: Provide 2-3 general, non-prescriptive lifestyle tips that could be helpful (e.g., related to diet, exercise, monitoring). Do not give specific medical advice or tell them to change medications.

        IMPORTANT: Conclude the entire response with the following disclaimer, exactly as written: "${t.aiAnalysisDisclaimer}"
        `;

        const response = await aiInstance.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error analyzing health readings from Gemini:", error);
        return t.aiDisclaimer || "Could not retrieve information. Please check your connection or API key and try again.";
    }
};
