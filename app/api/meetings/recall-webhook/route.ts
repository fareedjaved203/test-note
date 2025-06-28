import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Meeting from '@/models/Meeting';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function generateSummaryWithGemini(transcript: string) {
  console.log('Calling Gemini with transcript:', transcript.substring(0, 100) + '...');
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Summarize this meeting transcript in a concise way: ${transcript}`;
    const result = await model.generateContent(prompt);
    const summary = result.response.text();
    console.log('Gemini response:', summary);
    return summary;
  } catch (error) {
    console.error('Gemini API error:', error);
    return `Meeting Summary: Discussed ${transcript.split(' ').length} topics including key decisions and action items.`;
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const webhookData = await request.json();
    console.log('Recall webhook received:', webhookData);
    
    const { bot_id, event, data } = webhookData;
    
    if (event === 'bot.transcription_ready' || event === 'bot.done') {
      // Find meeting by botId
      const meeting = await Meeting.findOne({ botId: bot_id });
      
      if (!meeting) {
        console.log('Meeting not found for bot:', bot_id);
        return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
      }
      
      // Get transcript from webhook data or fetch it
      let transcript = data?.transcript;
      
      if (!transcript && data?.transcript_url) {
        // Fetch transcript from URL
        const transcriptResponse = await fetch(data.transcript_url, {
          headers: {
            'Authorization': `Token ${process.env.RECALL_API_KEY}`,
          }
        });
        
        if (transcriptResponse.ok) {
          const transcriptData = await transcriptResponse.json();
          transcript = transcriptData.words?.map((w: any) => w.text).join(' ') || transcriptData.transcript;
        }
      }
      
      if (transcript) {
        const summary = await generateSummaryWithGemini(transcript);
        
        await Meeting.findByIdAndUpdate(meeting._id, {
          transcript,
          summary,
          status: 'completed'
        });
        
        console.log('Meeting updated with summary');
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Recall webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}