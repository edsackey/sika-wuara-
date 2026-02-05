import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ChartOfAccount } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const translateText = async (text: string, from: string, to: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Translate the following business text from ${from} to ${to}. Maintain professional terminology. Return only the translation: "${text}"`,
  });
  return response.text;
};

export const generateSpeech = async (text: string, voiceName: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr' = 'Zephyr') => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });
  
  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio;
};

export const getCurrencyRate = async (from: string, to: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Provide the current approximate exchange rate from ${from} to ${to}. Return only the numeric value. Context: West African Business Hub.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          rate: { type: Type.NUMBER }
        }
      }
    }
  });
  const data = JSON.parse(response.text || '{"rate": 1}');
  return data.rate;
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

export const getRoscaAdvice = async (groupData: any, userProfile: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are a ROSCA (Rotating Savings and Credit Association) specialist AI. 
    Group Data: ${JSON.stringify(groupData)}
    User Context: ${userProfile}
    Analyze the risk level of this group, the payout efficiency, and provide a strategic recommendation on whether to join or contribute now. Focus on Ghana Susu traditions.`,
    config: {
      thinkingConfig: { thinkingBudget: 1000 }
    }
  });
  return response.text;
};

export const analyzeDocumentOCR = async (base64Image: string, accounts: ChartOfAccount[] = []) => {
  const accountContext = accounts.map(a => `[ID: ${a.id}, Code: ${a.code}, Name: ${a.name}, Type: ${a.type}]`).join(', ');
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      { text: `Extract double-entry ledger data from this invoice/receipt. 
      CRITICAL: Map the transaction to the most appropriate Chart of Account ID from the list below. 
      Available Accounts: ${accountContext || 'None provided'}.

      Return JSON: { 
        vendor: string, 
        amount: number, 
        currency: string, 
        date: string (YYYY-MM-DD), 
        category: string (short classification), 
        suggestedAccountId: string (the exact ID from the list above that best fits this transaction),
        taxAmount: number, 
        description: string, 
        confidence: number (0.0 to 1.0) 
      }` },
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
          suggestedAccountId: { type: Type.STRING, nullable: true },
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