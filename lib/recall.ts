export async function startRecallBot(meetingUrl: string) {
  const response = await fetch('https://us-west-2.recall.ai/api/v1/bot/', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${process.env.RECALL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      meeting_url: meetingUrl,
      bot_name: '1on1 Note Taker',
      recording_config: {
        transcript: {
          provider: {
            meeting_captions: {}
          }
        }
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Recall API error:', error);
    throw new Error(`Recall API failed: ${response.status}`);
  }

  return response.json();
}