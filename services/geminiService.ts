import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateInsights(transcript: string) {
  console.log('Calling Gemini with transcript:', transcript.substring(0, 100) + '...');
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Analyze this meeting transcript and return a JSON object with the following structure:
{
  "summary": "2-3 sentence summary",
  "actionItems": [{"who": "person", "what": "task", "when": "deadline"}],
  "keyDecisions": ["decision 1", "decision 2"],
  "nextSteps": ["step 1", "step 2"],
  "deadlines": [{"task": "task name", "date": "date"}],
  "questions": ["question 1", "question 2"]
}

Transcript: ${transcript}`;
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    console.log('Gemini response:', response);
    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No valid JSON found in response');
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}