import { GoogleGenAI, Type } from "@google/genai";
import { WeightEntry, AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeWeightTrend = async (entries: WeightEntry[]): Promise<AnalysisResult> => {
  if (entries.length < 2) {
    return {
      status: 'unknown',
      message: 'Dados insuficientes para análise.',
      recommendation: 'Adicione pelo menos dois registos de peso para receber insights.'
    };
  }

  // Prepare data for the prompt
  // Sort by date just in case
  const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Get last 10 entries to avoid token limits if history is huge, but usually cats don't have thousands of entries rapidly.
  // Taking a sample is safer for very long histories.
  const recentEntries = sortedEntries.slice(-15);
  
  const dataString = recentEntries.map(e => `Data: ${e.date}, Peso: ${e.weight}kg${e.note ? ` (Nota: ${e.note})` : ''}`).join('\n');

  const prompt = `
    Analise o histórico de peso deste gato. 
    Considere que mudanças bruscas de peso podem ser perigosas. 
    Se o peso estiver estável, é bom. Se houver perda ou ganho rápido, é um alerta.
    
    Dados:
    ${dataString}

    Responda em formato JSON seguindo este esquema:
    - status: 'healthy' (estável/bom), 'warning' (atenção necessária), ou 'unknown'.
    - message: Uma breve observação sobre a tendência (ex: "O peso está estável nos últimos meses").
    - recommendation: Uma recomendação curta (ex: "Continue a monitorizar" ou "Consulte um veterinário se a perda continuar").
    
    Responda em Português de Portugal.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, enum: ['healthy', 'warning', 'unknown'] },
            message: { type: Type.STRING },
            recommendation: { type: Type.STRING }
          },
          required: ['status', 'message', 'recommendation']
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");

    return JSON.parse(jsonText) as AnalysisResult;

  } catch (error) {
    console.error("Error analyzing weight:", error);
    return {
      status: 'unknown',
      message: 'Não foi possível analisar os dados no momento.',
      recommendation: 'Verifique a sua conexão ou tente mais tarde.'
    };
  }
};
