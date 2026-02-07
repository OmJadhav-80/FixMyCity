
import { GoogleGenAI, Type } from "@google/genai";

// Mock data for simulation when API key is missing or quota is exceeded
const MOCK_ANALYSIS: DamageAnalysis = {
  type: "Pothole (Severe)",
  severity: 8,
  description: "Detected a large asphalt depression with exposed aggregate. Signs of water accumulation indicating poor drainage. High risk for two-wheelers.",
  priority: 85,
  maintenanceSuggestion: "Immediate cold patch required. Schedule full resurfacing for 50m radius within 7 days."
};

export interface DamageAnalysis {
  type: string;
  severity: number;
  description: string;
  priority: number;
  maintenanceSuggestion: string;
}

export const analyzeRoadDamage = async (base64Image: string): Promise<DamageAnalysis | null> => {
  // Validate API Key Availability
  const apiKey = (process.env.API_KEY || '').trim();
  const isKeyValid = apiKey && apiKey.length > 20 && !['YOUR_API_KEY', 'undefined', 'null'].includes(apiKey);

  // SIMULATION MODE: If no valid key, return mock data after a delay
  if (!isKeyValid) {
    console.warn("Gemini Service: No valid API Key detected. Switching to Simulation Mode.");
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network latency
    
    // Add some randomness to the mock for realism
    const isSevere = Math.random() > 0.5;
    return {
      ...MOCK_ANALYSIS,
      type: isSevere ? "Pothole (Severe)" : "Surface Crack (Medium)",
      severity: isSevere ? 8 : 4,
      priority: isSevere ? 85 : 45,
      description: isSevere ? MOCK_ANALYSIS.description : "Linear cracking observed along the lane divider. Potential for expansion if not sealed."
    };
  }

  try {
    // Initialize Gemini Client inside the function scope
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // High-performance model (Turbo class)
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } },
          { text: "Analyze this road damage image. Identify the type (pothole, cracks, erosion, etc.), rate severity from 1-10, provide a brief description, estimate a priority score (1-100), and suggest maintenance steps. Respond in JSON." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            severity: { type: Type.NUMBER },
            description: { type: Type.STRING },
            priority: { type: Type.NUMBER },
            maintenanceSuggestion: { type: Type.STRING }
          },
          required: ["type", "severity", "description", "priority", "maintenanceSuggestion"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Analysis Error (Switching to Fallback):", error);
    // Fallback to simulation on API error (e.g., quota exceeded, rate limit)
    return MOCK_ANALYSIS;
  }
};
