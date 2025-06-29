'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [meetingUrl, setMeetingUrl] = useState('');
  const [meetingId, setMeetingId] = useState<string | null>(null);
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
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meeting URL</label>
                <input
                  type="url"
                  placeholder="Enter meeting URL (Google Meet, Zoom, Teams)"
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  className="w-full p-4 text-gray-700 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors placeholder-gray-500"
                />
              </div>
              <button
                onClick={startMeeting}
                disabled={loading || !meetingUrl}
                className="w-full p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
              >
                {loading ? 'Starting...' : 'Start Meeting'}
              </button>
            </div>
          </div>
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
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center space-x-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
                  <div>
                    <p className="text-blue-700 font-semibold">Processing Meeting</p>
                    <p className="text-gray-600 text-sm">Waiting for meeting to end and transcript to be processed...</p>
                  </div>
                </div>
              </div>
            )}
            {insights && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg border-l-4 border-blue-500 h-64 overflow-hidden">
                  <div className="flex items-center p-6 pb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-bold">📝</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Summary</h3>
                  </div>
                  <div className="mx-6 mb-6 h-48 overflow-y-auto rounded-lg pb-4">
                    <p className="text-gray-700 leading-relaxed pr-2">{insights.summary}</p>
                  </div>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                
                {insights.actionItems?.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg border-l-4 border-green-500 h-96 overflow-hidden">
                    <div className="flex items-center p-6 pb-4">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-green-600 font-bold">✅</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">Action Items</h3>
                    </div>
                    <div className="mx-6 mb-6 h-80 overflow-y-auto rounded-lg">
                      <div className="space-y-3 pr-2">
                        {insights.actionItems.map((item: any, i: number) => (
                          <div key={i} className="bg-green-50 p-3 my-5 rounded-lg">
                            <div className="font-semibold text-green-800">{item.who}</div>
                            <div className="text-gray-700">{item.what}</div>
                            {item.when && <div className="text-sm text-green-600 mt-1">Due: {item.when}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {insights.keyDecisions?.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg border-l-4 border-yellow-500 h-96 overflow-hidden">
                    <div className="flex items-center p-6 pb-4">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-yellow-600 font-bold">⚡</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">Key Decisions</h3>
                    </div>
                    <div className="mx-6 mb-6 h-80 overflow-y-auto rounded-lg">
                      <div className="space-y-2 pr-2">
                        {insights.keyDecisions.map((decision: string, i: number) => (
                          <div key={i} className="flex items-start space-x-2 my-3">
                            <span className="text-yellow-500 mt-1">•</span>
                            <span className="text-gray-700">{decision}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {insights.nextSteps?.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg border-l-4 border-purple-500 h-96 overflow-hidden">
                    <div className="flex items-center p-6 pb-4">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-purple-600 font-bold">🚀</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">Next Steps</h3>
                    </div>
                    <div className="mx-6 mb-6 h-80 overflow-y-auto rounded-lg">
                      <div className="space-y-2 pr-2">
                        {insights.nextSteps.map((step: string, i: number) => (
                          <div key={i} className="flex items-start space-x-2 my-3">
                            <span className="text-purple-500 mt-1">•</span>
                            <span className="text-gray-700">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {insights.deadlines?.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg border-l-4 border-red-500 h-96 overflow-hidden">
                    <div className="flex items-center p-6 pb-4">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-red-600 font-bold">⏰</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">Important Deadlines</h3>
                    </div>
                    <div className="mx-6 mb-6 h-80 overflow-y-auto rounded-lg">
                      <div className="space-y-3 pr-2">
                        {insights.deadlines.map((deadline: any, i: number) => (
                          <div key={i} className="bg-red-50 p-3 rounded-lg my-4">
                            <div className="font-semibold text-red-800">{deadline.task}</div>
                            <div className="text-red-600 text-sm">{deadline.date}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {insights.questions?.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg border-l-4 border-orange-500 h-96 overflow-hidden">
                    <div className="flex items-center p-6 pb-4">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-orange-600 font-bold">❓</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">Questions/Issues</h3>
                    </div>
                    <div className="mx-6 mb-6 h-80 overflow-y-auto rounded-lg">
                      <div className="space-y-2 pr-2">
                        {insights.questions.map((question: string, i: number) => (
                          <div key={i} className="flex items-start space-x-2">
                            <span className="text-orange-500 mt-1">•</span>
                            <span className="text-gray-700">{question}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}