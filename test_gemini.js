require('dotenv').config();
const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  try {
    const buffer = fs.readFileSync('../DUKAANSETU/public/logo.jpg');
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [
        "Analyze this grocery product image. Return a JSON object with: 'name' (product name), 'brand' (brand name), 'category', 'packSize', and 'description'. Return ONLY valid JSON.",
        {
          inlineData: {
            data: buffer.toString('base64'),
            mimeType: 'image/jpeg'
          }
        }
      ]
    });
    console.log('RAW TEXT:', response.text);
    
    // simulate parsing
    const text = response.text.replace(/```json/gi, '').replace(/```/g, '').trim();
    console.log('PARSED:', JSON.parse(text));
  } catch (err) {
    console.log('ERROR:', err);
  }
}
test();
