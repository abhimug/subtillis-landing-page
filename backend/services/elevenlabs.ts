import "server-only";
import type { SignedUrlResponse } from "@/shared/types";

export async function getSignedUrl(): Promise<SignedUrlResponse> {
  try {
    const agentId = process.env.ELEVENLABS_AGENT_ID;
    const apiKey = process.env.ELEVENLABS_API_KEY;

    const res = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
      { headers: { "xi-api-key": apiKey! } }
    );

    if (!res.ok) {
      const body = await res.text();
      console.error(`ElevenLabs API error: ${res.status}`, body);
      throw new Error(`ElevenLabs API error: ${res.status}`);
    }

    const data = await res.json();
    return { signedUrl: data.signed_url, mockMode: false };
  } catch (err) {
    console.error("getSignedUrl failed:", err);
    return { signedUrl: null, mockMode: true };
  }
}
