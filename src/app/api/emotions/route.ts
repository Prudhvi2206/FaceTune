import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import EmotionHistory from "@/models/EmotionHistory";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { emotion, confidence, sessionId } = body;

    if (!emotion || confidence === undefined || !sessionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    const entry = await EmotionHistory.create({
      userId: (session.user as unknown as Record<string, string>).id,
      emotion,
      confidence,
      sessionId,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error("Save emotion error:", error);
    return NextResponse.json(
      { error: "Failed to save emotion data" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const days = parseInt(searchParams.get("days") || "7");

    await connectDB();

    const since = new Date();
    since.setDate(since.getDate() - days);

    const history = await EmotionHistory.find({
      userId: (session.user as unknown as Record<string, string>).id,
      timestamp: { $gte: since },
    })
      .sort({ timestamp: -1 })
      .limit(limit);

    return NextResponse.json({ history });
  } catch (error) {
    console.error("Get emotion history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch emotion history" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const result = await EmotionHistory.deleteMany({
      userId: (session.user as unknown as Record<string, string>).id,
    });

    return NextResponse.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error("Delete emotion history error:", error);
    return NextResponse.json(
      { error: "Failed to delete emotion history" },
      { status: 500 }
    );
  }
}
