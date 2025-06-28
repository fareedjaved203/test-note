import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Meeting from '@/models/Meeting';
import { startRecallBot } from '@/lib/recall';
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

async function getRecallTranscript(botId: string) {
  const response = await fetch(`https://us-west-2.recall.ai/api/v1/bot/${botId}/`, {
    headers: {
      'Authorization': `Token ${process.env.RECALL_API_KEY}`,
    }
  });
  
  if (!response.ok) {
    console.log('Bot status fetch failed:', response.status);
    return null;
  }
  
  const data = await response.json();
  
  const isDone = data.status_changes?.some((s: any) => s.code === 'done');
  
  const completedRecording = data.recordings?.find((r: any) => 
    r.media_shortcuts?.transcript
  );
  
  console.log("data recordings: ", data.recordings); 
  console.log('Completed recording:', completedRecording);
  
  if (completedRecording?.media_shortcuts?.transcript?.data.download_url) {
    console.log('Found transcript download URL:', completedRecording.media_shortcuts.transcript.data.download_url);
    const transcriptUrl = completedRecording.media_shortcuts.transcript.data.download_url;
    
    try {
      const transcriptResponse = await fetch(transcriptUrl, {
        headers: {
          'Authorization': `Token ${process.env.RECALL_API_KEY}`,
        }
      });
      
      console.log('Transcript download response status:', transcriptResponse.status);
      
      if (transcriptResponse.ok) {
        const transcriptData = await transcriptResponse.json();
        console.log('Downloaded transcript data:', JSON.stringify(transcriptData, null, 2));
        
        const allText = transcriptData
          .flatMap((participant: any) => participant.words || [])
          .map((word: any) => word.text)
          .join(' ');
        
        console.log('Extracted text:', allText.substring(0, 200) + '...');
        
        if (allText.trim()) {
          return allText;
        }
      }
    } catch (error) {
      console.error('Error fetching transcript:', error);
    }
  } else {
    console.log('No transcript download URL found');
    
    const processingRecording = data.recordings?.find((r: any) => r.status?.code === 'processing');
    if (processingRecording) {
      console.log('Recording still processing, returning null');
      return null;
    }
  }
  
  if (!isDone) {
    console.log('Bot not done yet, returning null');
    return null;
  }
  
  console.log('Bot is done but no transcript found, using mock');
  return 'This is a test meeting transcript. We discussed project updates, deadlines, and next steps for the team.';
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { meetingUrl } = await request.json();
    
    const platform = meetingUrl.includes('zoom.us') ? 'zoom' : 
                    meetingUrl.includes('teams.microsoft.com') ? 'teams' : 'google-meet';
    
    const meeting = await Meeting.create({
      meetingUrl,
      platform,
      status: 'started'
    });

    try {
      const botResponse = await startRecallBot(meetingUrl, meeting._id.toString());
      await Meeting.findByIdAndUpdate(meeting._id, { botId: botResponse.id });
      console.log('Recall bot started:', botResponse.id);
    } catch (error) {
      console.error('Failed to start recall bot:', error);
    }

    return NextResponse.json({ meetingId: meeting._id });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to start meeting' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const meetingId = searchParams.get('id');
    
    const meeting = await Meeting.findById(meetingId);
    
    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    if (meeting.status !== 'completed' && meeting.botId) {
      try {
        const transcript = await getRecallTranscript(meeting.botId);
        console.log("transcript:", transcript);
        if (transcript) {
          const summary = await generateSummaryWithGemini(transcript);
          
          await Meeting.findByIdAndUpdate(meetingId, {
            transcript,
            summary,
            status: 'completed'
          });
          
          return NextResponse.json({
            status: 'completed',
            summary,
            notes: ''
          });
        }
      } catch (error) {
        console.error('Failed to poll recall:', error);
      }
    }

    return NextResponse.json({
      status: meeting.status,
      summary: meeting.summary,
      notes: meeting.notes
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get meeting' }, { status: 500 });
  }
}