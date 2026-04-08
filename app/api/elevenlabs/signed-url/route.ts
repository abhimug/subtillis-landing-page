import { NextResponse } from "next/server";
import { getSignedUrl } from "@/backend/services/elevenlabs";
import type { SignedUrlResponse } from "@/shared/types";

export async function GET(): Promise<NextResponse<SignedUrlResponse | { error: string }>> {
  try {
    const result = await getSignedUrl();
    return NextResponse.json(result);
  } catch (err) {
    console.error("Unexpected error in signed-url route:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
