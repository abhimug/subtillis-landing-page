import { NextResponse } from "next/server";

export async function GET() {
  const agentId = process.env.ELEVENLABS_AGENT_ID;
  if (!agentId) {
    return NextResponse.json({ agentId: null }, { status: 503 });
  }
  return NextResponse.json({ agentId });
}
