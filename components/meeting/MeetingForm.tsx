interface MeetingFormProps {
  meetingUrl: string;
  setMeetingUrl: (url: string) => void;
  onStartMeeting: () => void;
  loading: boolean;
}

export default function MeetingForm({ meetingUrl, setMeetingUrl, onStartMeeting, loading }: MeetingFormProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Meeting URL</label>
          <input
            type="url"
            placeholder="Enter meeting URL (Google Meet, Zoom, Teams)"
            value={meetingUrl}
            onChange={(e) => setMeetingUrl(e.target.value)}
            className="w-full text-gray-700 p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors placeholder-gray-500"
          />
        </div>
        <button
          onClick={onStartMeeting}
          disabled={loading || !meetingUrl}
          className="w-full p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
        >
          {loading ? 'Starting...' : 'Start Meeting'}
        </button>
      </div>
    </div>
  );
}