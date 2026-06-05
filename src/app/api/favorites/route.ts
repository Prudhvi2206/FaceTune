import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Favorite from "@/models/Favorite";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const favorites = await Favorite.find({
      userId: (session.user as unknown as Record<string, string>).id,
    }).sort({ addedAt: -1 });

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error("Get favorites error:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
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

    const existing = await Favorite.findOne({
      userId: (session.user as unknown as Record<string, string>).id,
      songId: body.songId,
    });

    if (existing) {
      await Favorite.deleteOne({ _id: existing._id });
      return NextResponse.json({ action: "removed" });
    }

    await Favorite.create({
      userId: (session.user as unknown as Record<string, string>).id,
      ...body,
    });

    return NextResponse.json({ action: "added" });
  } catch (error) {
    console.error("Toggle favorite error:", error);
    return NextResponse.json(
      { error: "Failed to toggle favorite" },
      { status: 500 }
    );
  }
}
