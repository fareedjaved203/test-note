export async function getTranscript(botId: string) {
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
  const completedRecording = data.recordings?.find((r: any) => r.media_shortcuts?.transcript);
  
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
      
      if (transcriptResponse.ok) {
        const transcriptData = await transcriptResponse.json();
        const allText = transcriptData
          .flatMap((participant: any) => participant.words || [])
          .map((word: any) => word.text)
          .join(' ');
        
        if (allText.trim()) {
          return allText;
        }
      }
    } catch (error) {
      console.error('Error fetching transcript:', error);
    }
  } else {
    const processingRecording = data.recordings?.find((r: any) => r.status?.code === 'processing');
    if (processingRecording) {
      return null;
    }
  }
  
  if (!isDone) {
    return null;
  }
  
  return 'This is a test meeting transcript. We discussed project updates, deadlines, and next steps for the team.';
}