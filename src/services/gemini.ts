import { GoogleGenAI } from "@google/genai";
import { Trend } from "../types";

// Initialize Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeTrendWithGemini(topic: string): Promise<Trend> {
  const prompt = `
    Analyze the wellness trend "${topic}" specifically for the Indian market.
    Act as a trend spotter and venture capitalist.
    
    Search for:
    1. Recent search interest and social media buzz (Reddit, YouTube, Instagram) in India.
    2. Current product availability in India (Amazon, D2C brands).
    3. Scientific backing or health claims.
    
    Return a JSON object strictly matching this schema. Do not include markdown code blocks, just raw JSON.
    
    {
      "id": "string", // Generate a random string
      "name": "string", // Title case
      "category": "Supplement" | "Skincare" | "Food & Beverage" | "Mental Wellness" | "Fitness",
      "description": "string", // 1-2 sentences
      "signals": [
        {
          "source": "Google Trends" | "Reddit" | "Instagram" | "YouTube" | "Research" | "Regulatory",
          "strength": number, // 0-100
          "change": number, // Percentage growth
          "context": "string", // Specific detail, e.g. "r/SkincareAddictionIndia mentions up"
          "date": "string" // YYYY-MM-DD (Use current dates in 2025-2026)
        }
      ],
      "market": {
        "marketSize": "string", // e.g. "₹50Cr"
        "competitionLevel": "Low" | "Medium" | "High",
        "currentPlayers": ["string"], // List real brands if found
        "pricePoint": "string" // e.g. "₹500 - ₹1000"
      },
      "scores": {
        "velocity": number, // 0-100 based on recent buzz
        "marketPotential": number, // 0-100 based on TAM
        "competition": number, // 0-100 based on existing players
        "timeToMainstream": number, // Months until peak
        "overallScore": number // Average of others weighted
      },
      "opportunityBrief": "string", // A compelling 2-paragraph pitch to a founder. Why is this a ₹30Cr opportunity? What is the specific product gap?
      "status": "Emerging" | "Accelerating" | "Peaking" | "Mainstream",
      "historicalInterest": [{ "date": "string", "value": number }] // Generate estimated trend data (0-100) from 2023-01 to present (2026-02). Date format: YYYY-MM
    }
    
    Ensure the data is realistic based on the search results. If it's a very new trend, competition should be Low.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    const data = JSON.parse(text) as Trend;
    
    // Ensure ID is unique if not generated correctly
    if (!data.id) data.id = crypto.randomUUID();
    
    return data;
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    throw new Error("Failed to analyze trend. Please try again.");
  }
}
