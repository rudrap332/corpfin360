
import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";
import { FinancialMetrics, BusinessValuation, FinancialAnalysis, ChatMessage } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialHealthAnalysis = async (metrics: FinancialMetrics): Promise<FinancialAnalysis> => {
  try {
    const prompt = `Analyze the following financial data for a startup/SME: Annual Revenue: $${metrics.revenue.toLocaleString()}, Net Profit Margin: ${metrics.profitMargin}%, Year-over-Year Growth: ${metrics.growthRate}%, Debt-to-Equity Ratio: ${metrics.debtToEquity}, Cash Runway (months): ${metrics.cashRunway}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are an expert corporate finance analyst specializing in SMEs and startups. Provide a concise, clear, and actionable analysis of a company's financial health based on the provided metrics. Structure your response in JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Positive points about the company's financial health." },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Areas for improvement in the company's financials." },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actionable advice for the company." },
          },
          required: ["strengths", "weaknesses", "recommendations"],
        },
      },
    });

    const jsonString = response.text.trim();
    return JSON.parse(jsonString) as FinancialAnalysis;
  } catch (error) {
    console.error("Error getting financial health analysis:", error);
    throw new Error("Failed to get financial analysis from AI. Please try again.");
  }
};

export const getMarketTrendReport = async (industry: string): Promise<string> => {
    try {
        const prompt = `Provide a market trend analysis for the "${industry}" industry, specifically for startups and SMEs.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are a market research analyst. Generate a brief but insightful report on the current market trends for the given industry. Focus on key innovations, competitive landscape, potential opportunities, and emerging threats for startups and SMEs. Format the output using markdown for readability, including headings and bullet points.",
                temperature: 0.7,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error getting market trend report:", error);
        throw new Error("Failed to generate market trend report. Please try again.");
    }
};


export const getBusinessValuation = async (industry: string, revenue: number, growthRate: number): Promise<BusinessValuation> => {
  try {
    const prompt = `Estimate the valuation for a startup in the "${industry}" sector with an Annual Recurring Revenue (ARR) of $${revenue.toLocaleString()} and a year-over-year growth rate of ${growthRate}%.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are a business valuation expert specializing in startups. Based on the provided data, calculate an estimated pre-money valuation range. Explain the methodology used in simple terms. Provide the response in JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            valuationMin: { type: Type.NUMBER, description: "The lower end of the estimated valuation range in USD." },
            valuationMax: { type: Type.NUMBER, description: "The upper end of the estimated valuation range in USD." },
            methodology: { type: Type.STRING, description: "A brief explanation of the valuation method used, like revenue multiples." },
            commentary: { type: Type.STRING, description: "Additional context or factors that could influence the valuation." },
          },
          required: ["valuationMin", "valuationMax", "methodology", "commentary"],
        },
      },
    });
    
    const jsonString = response.text.trim();
    return JSON.parse(jsonString) as BusinessValuation;
  } catch (error) {
    console.error("Error getting business valuation:", error);
    throw new Error("Failed to estimate business valuation. Please try again.");
  }
};

let chatInstance: Chat | null = null;

export const getFundraisingAdvice = async (message: string): Promise<string> => {
    try {
        if (!chatInstance) {
            chatInstance = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: "You are a seasoned venture capitalist and startup mentor. Your goal is to provide clear, practical, and encouraging advice to founders on their fundraising journey. Answer their questions directly and avoid overly complex jargon. Keep your answers concise and helpful.",
                },
            });
        }
        const response: GenerateContentResponse = await chatInstance.sendMessage({ message });
        return response.text;
    } catch (error) {
        console.error("Error getting fundraising advice:", error);
        throw new Error("Failed to get fundraising advice. Please try again.");
    }
};

export const getDocumentAnalysis = async (documentText: string, userQuery: string): Promise<string> => {
    try {
        const prompt = `Based on the following document, please answer the user's question.
        
        User's question: "${userQuery}"

        Document content:
        ---
        ${documentText}
        ---
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are an expert business analyst and consultant. Your task is to analyze the provided document and answer the user's question based *only* on the information within that document. Provide a clear, concise, and well-structured response. Use markdown for formatting.",
                temperature: 0.5,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error getting document analysis:", error);
        throw new Error("Failed to analyze the document. Please try again.");
    }
};

export const generateVideo = async (prompt: string, onProgress: (message: string) => void): Promise<string> => {
    try {
        onProgress("Initializing video generation model...");
        let operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            config: { numberOfVideos: 1 }
        });

        const progressMessages = [
            "Composing initial scenes...",
            "Rendering primary frames (this can take a few minutes)...",
            "Applying visual effects and styles...",
            "Finalizing high-resolution video stream...",
            "Almost there, polishing the final cut..."
        ];
        let messageIndex = 0;

        while (!operation.done) {
            onProgress(progressMessages[messageIndex % progressMessages.length]);
            messageIndex++;
            await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

        if (!downloadLink) {
            throw new Error("Video generation completed, but no download link was found.");
        }

        // The API key must be appended to the download URL to authorize the download
        return `${downloadLink}&key=${process.env.API_KEY}`;
    } catch (error) {
        console.error("Error generating video:", error);
        throw new Error("Failed to generate the video. Please try again with a different prompt.");
    }
};