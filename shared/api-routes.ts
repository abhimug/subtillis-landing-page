// Single source of truth for all API route paths.
// Import this in frontend code instead of hardcoding URL strings.
export const API_ROUTES = {
  elevenlabs: {
    signedUrl: "/api/elevenlabs/signed-url",
  },
} as const;
