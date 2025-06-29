import mongoose from 'mongoose';

const MeetingSchema = new mongoose.Schema({
  meetingUrl: { type: String, required: true },
  platform: { type: String, required: true },
  status: { type: String, default: 'started' },
  botId: { type: String },
  transcript: { type: String },
  summary: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Meeting || mongoose.model('Meeting', MeetingSchema);