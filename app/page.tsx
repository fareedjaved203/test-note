'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [meetingUrl, setMeetingUrl] = useState('');
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');

  const startMeeting = async () => {
    if (!meetingUrl) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingUrl })
      });
      
      const data = await response.json();
      setMeetingId(data.meetingId);
    } catch (error) {
      console.error('Failed to start meeting:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!meetingId) return;

    setLoading(true);
    const pollForSummary = async () => {
      try {
        const response = await fetch(`/api/meetings?id=${meetingId}`);
        const data = await response.json();
        console.log('Poll response:', data);
        
        setStatus(data.status || 'unknown');
        if (data.status === 'completed' && data.summary) {
          setSummary(data.summary);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch summary:', error);
      }
    };

    pollForSummary();
    const interval = setInterval(pollForSummary, 10000);
    return () => clearInterval(interval);
  }, [meetingId]);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Meeting Note Taker</h1>
        
        {!meetingId ? (
          <div className="space-y-4">
            <input
              type="url"
              placeholder="Enter meeting URL (Google Meet, Zoom, Teams)"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              className="w-full p-3 border rounded"
            />
            <button
              onClick={startMeeting}
              disabled={loading || !meetingUrl}
              className="w-full p-3 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              {loading ? 'Starting...' : 'Start Meeting'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-green-600">Meeting started! ID: {meetingId}</p>
            <p className="text-gray-500">Status: {status}</p>
            {loading && <p className="text-blue-500">Waiting for meeting to end and transcript to be processed...</p>}
            {summary && (
              <div className="p-4 bg-gray-100 rounded">
                <h2 className="font-bold mb-2 text-black">Meeting Summary:</h2>
                <p className="text-black">{summary}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}