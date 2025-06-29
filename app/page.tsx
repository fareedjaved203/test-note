'use client';

import { useState, useEffect } from 'react';
import MeetingForm from '@/components/meeting/MeetingForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import InsightsDisplay from '@/components/meeting/InsightsDisplay';

export default function Home() {
  const [meetingUrl, setMeetingUrl] = useState('');
  const [meetingId, setMeetingId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [insights, setInsights] = useState<any>(null);
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
    if (!meetingId || insights) return;

    setLoading(true);
    const pollForSummary = async () => {
      try {
        const response = await fetch(`/api/meetings?id=${meetingId}`);
        const data = await response.json();
        console.log('Poll response:', data);
        
        setStatus(data.status || 'unknown');
        if (data.status === 'completed' && data.insights) {
          setInsights(data.insights);
          setLoading(false);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Failed to fetch summary:', error);
        return false;
      }
    };

    pollForSummary();
    const interval = setInterval(async () => {
      const completed = await pollForSummary();
      if (completed) {
        clearInterval(interval);
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [meetingId, insights]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">1on1</h1>
          <p className="text-gray-600">A feature of Hatchproof to gather meeting insights</p>
        </div>
        
        {!meetingId ? (
          <MeetingForm
            meetingUrl={meetingUrl}
            setMeetingUrl={setMeetingUrl}
            onStartMeeting={startMeeting}
            loading={loading}
          />
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-green-700 font-semibold">Meeting Active</p>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">{status}</span>
              </div>
            </div>
            
            {loading && (
              <LoadingSpinner message="Waiting for meeting to end and transcript to be processed..." />
            )}
            
            {insights && <InsightsDisplay insights={insights} />}
          </div>
        )}
      </div>
    </div>
  );
}