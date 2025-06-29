import { NextRequest } from 'next/server';
import { createMeeting, getMeetingStatus } from '@/controllers/meetingController';

export async function POST(request: NextRequest) {
  return createMeeting(request);
}

export async function GET(request: NextRequest) {
  return getMeetingStatus(request);
}