
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const translateText = async (text: string, from: string, to: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Translate the following business text from ${from} to ${to}. Maintain professional terminology. Return only the translation: "${text}"`,
  });
  return response.text;
};

export const getBusinessAdvice = async (query: string, financialContext?: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `You are Sika Wura AI, an elite African business strategist and investment advisor (BigCapital style). 
    Context: ${financialContext || 'General Business'}
    User Query: ${query}
    Provide actionable, high-level advice focusing on GHS rates, VAT compliance, and West African growth.`,
    config: {
      thinkingConfig: { thinkingBudget: 2000 }
    }
  });
  return response.text;
};

export const analyzeDocumentOCR = async (base64Image: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      { text: "Extract invoice/receipt data for a double-entry ledger. Return JSON: { vendor: string, amount: number, currency: string, date: string, category: 'Utilities' | 'Travel' | 'Inventory' | 'Office', taxAmount: number, description: string, confidence: number }" },
      { inlineData: { mimeType: "image/jpeg", data: base64Image } }
    ],
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          vendor: { type: Type.STRING },
          amount: { type: Type.NUMBER },
          currency: { type: Type.STRING },
          date: { type: Type.STRING },
          category: { type: Type.STRING },
          taxAmount: { type: Type.NUMBER },
          description: { type: Type.STRING },
          confidence: { type: Type.NUMBER }
        },
        required: ["vendor", "amount", "date"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const getFinancialSummary = async (transactions: any[], companyName: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze these ledger entries for ${companyName}. Provide a CEO summary: current liquidity, burn rate, and top expense leak: ${JSON.stringify(transactions)}`,
  });
  return response.text;
};
