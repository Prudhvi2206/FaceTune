import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import CustomMoodTrack from "@/models/CustomMoodTrack";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const emotion = searchParams.get("emotion");

  try {
    await connectDB();
    const query: Record<string, any> = {
      userId: (session.user as unknown as Record<string, string>).id,
    };
    if (emotion) {
      query.emotion = emotion;
    }

    const tracks = await CustomMoodTrack.find(query).sort({ addedAt: -1 });
    return NextResponse.json({ tracks });
  } catch (error) {
    console.error("Get custom mood tracks error:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom mood tracks" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    await connectDB();

    const userId = (session.user as unknown as Record<string, string>).id;

    // Check if duplicate mapping exists for this user, emotion and song
    const existing = await CustomMoodTrack.findOne({
      userId,
      emotion: body.emotion,
      songId: body.songId,
    });

    if (existing) {
      // Toggle behavior: if already assigned to this emotion, remove it!
      await CustomMoodTrack.deleteOne({ _id: existing._id });
      return NextResponse.json({ action: "removed", track: existing });
    }

    const newTrack = await CustomMoodTrack.create({
      userId,
      ...body,
    });

    return NextResponse.json({ action: "added", track: newTrack });
  } catch (error) {
    console.error("Create custom mood track error:", error);
    return NextResponse.json(
      { error: "Failed to save custom mood track" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  try {
    await connectDB();
    const res = await CustomMoodTrack.deleteOne({
      _id: id,
      userId: (session.user as unknown as Record<string, string>).id,
    });

    if (res.deletedCount === 0) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete custom mood track error:", error);
    return NextResponse.json(
      { error: "Failed to delete custom mood track" },
      { status: 500 }
    );
  }
}
