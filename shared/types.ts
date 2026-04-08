// UI state machine for the voice call
export type CallStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "ended"
  | "error"
  | "mock";

// What the backend API returns to the frontend.
// signedUrl is null when the backend isn't connected yet (mockMode: true).
export interface SignedUrlResponse {
  signedUrl: string | null;
  mockMode: boolean;
}

// A single message in the live transcript
export interface TranscriptMessage {
  source: "user" | "agent";
  text: string;
}
