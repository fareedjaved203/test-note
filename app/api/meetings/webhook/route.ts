import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Meeting from '@/models/Meeting';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function generateSummaryWithGemini(transcript: string) {
  console.log('Calling Gemini with transcript:', transcript.substring(0, 100) + '...');
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Please provide a detailed summary of this meeting transcript:\n\n${transcript}`;
    const result = await model.generateContent(prompt);
    const summary = result.response.text();
    console.log('Gemini response:', summary);
    return summary;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { meetingId, transcript } = await request.json();
    console.log('Webhook received:', { meetingId, transcript });
    
    const summary = await generateSummaryWithGemini(transcript);

    await Meeting.findByIdAndUpdate(meetingId, {
      transcript,
      summary,
      status: 'completed'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to process transcript' }, { status: 500 });
  }
}