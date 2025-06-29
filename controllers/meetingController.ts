import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Meeting from "@/models/Meeting";
import { startRecallBot } from "@/lib/recall";
import { generateInsights } from "@/services/geminiService";
import { getTranscript } from "@/services/recallService";

export async function createMeeting(request: NextRequest) {
  try {
    await dbConnect();
    const { meetingUrl } = await request.json();

    const platform = meetingUrl.includes("zoom.us")
      ? "zoom"
      : meetingUrl.includes("teams.microsoft.com")
      ? "teams"
      : "google-meet";

    const meeting = await Meeting.create({
      meetingUrl,
      platform,
      status: "started",
    });

    try {
      const botResponse = await startRecallBot(meetingUrl);
      await Meeting.findByIdAndUpdate(meeting._id, { botId: botResponse.id });
      console.log("Recall bot started:", botResponse.id);
    } catch (error) {
      console.error("Failed to start recall bot:", error instanceof Error ? error.message : error);
    }

    return NextResponse.json({ meetingId: meeting._id });
  } catch (error) {
    console.error("Create meeting error:", error);
    return NextResponse.json(
      { error: "Failed to start meeting" },
      { status: 500 }
    );
  }
}

export async function getMeetingStatus(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const meetingId = searchParams.get("id");

    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    if (meeting.status !== "completed" && meeting.botId) {
      try {
        const transcript = await getTranscript(meeting.botId);
        console.log("transcript:", transcript);
        if (transcript) {
          const insights = await generateInsights(transcript);

          await Meeting.findByIdAndUpdate(meetingId, {
            transcript,
            summary: JSON.stringify(insights),
            status: "completed",
          });

          return NextResponse.json({
            status: "completed",
            insights
          });
        }
      } catch (error) {
        console.error("Failed to poll recall:", error instanceof Error ? error.message : error);
      }
    }

    let insights = null;
    if (meeting.summary) {
      try {
        insights = JSON.parse(meeting.summary);
      } catch (error) {
        console.error("JSON parse error:", error instanceof Error ? error.message : error);
        insights = { summary: meeting.summary };
      }
    }

    return NextResponse.json({
      status: meeting.status,
      insights
    });
  } catch (error) {
    console.error("Get meeting status error:", error);
    return NextResponse.json(
      { error: "Failed to get meeting" },
      { status: 500 }
    );
  }
}
