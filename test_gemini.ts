import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";
dotenv.config();

async function run() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI({ apiKey });
    
    const contents = [{ role: 'user', parts: [{ text: 'hello' }] }];
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents as any,
      config: {
        systemInstruction: "You are 'Gardener AI'",
      },
    });
    console.log("Success:", response.text);
  } catch (err: any) {
    console.error("Error occurred:", err);
  }
}
run();
