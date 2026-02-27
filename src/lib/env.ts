/**
 * Server-side environment variable validation.
 * Import this only in API routes / server components.
 * Never expose this to the client bundle.
 */

export interface EnvConfig {
  // AI
  geminiApiKey: string;
  elevenLabsApiKey: string;

  // Twilio
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioPhoneNumber: string;

  // SendGrid
  sendgridApiKey: string;
  sendgridFromEmail: string;
  sendgridFromName: string;

  // WhatsApp Business
  whatsappToken: string;
  whatsappBusinessId: string;
  whatsappPhoneId: string;

  // App
  appUrl: string;
  webhookSecret: string;
  defaultBusinessId: string;
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.startsWith("your_")) {
    // In development, warn but don't crash
    if (process.env.NODE_ENV === "development") {
      console.warn(`[env] Missing or placeholder value for ${key}`);
      return "";
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, fallback = ""): string {
  const value = process.env[key];
  if (!value || value.startsWith("your_")) return fallback;
  return value;
}

/**
 * Returns validated environment configuration.
 * Throws in production if required keys are missing.
 */
export function getEnv(): EnvConfig {
  return {
    geminiApiKey:       requireEnv("GEMINI_API_KEY"),
    elevenLabsApiKey:   requireEnv("ELEVEN_LABS_API_KEY"),
    twilioAccountSid:   requireEnv("TWILIO_ACCOUNT_SID"),
    twilioAuthToken:    requireEnv("TWILIO_AUTH_TOKEN"),
    twilioPhoneNumber:  requireEnv("TWILIO_PHONE_NUMBER"),
    sendgridApiKey:     requireEnv("SENDGRID_API_KEY"),
    sendgridFromEmail:  optionalEnv("SENDGRID_FROM_EMAIL", "noreply@ai-booking.app"),
    sendgridFromName:   optionalEnv("SENDGRID_FROM_NAME", "AI Booking Assistant"),
    whatsappToken:      requireEnv("WHATSAPP_TOKEN"),
    whatsappBusinessId: requireEnv("WHATSAPP_BUSINESS_ID"),
    whatsappPhoneId:    requireEnv("WHATSAPP_PHONE_ID"),
    appUrl:             optionalEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
    webhookSecret:      optionalEnv("WEBHOOK_SECRET", "dev-secret"),
    defaultBusinessId:  optionalEnv("DEFAULT_BUSINESS_ID", "twilight-lake-0344"),
  };
}

/**
 * Returns which integrations are actually configured (non-empty keys).
 */
export function getConfiguredIntegrations(): {
  gemini: boolean;
  elevenLabs: boolean;
  twilio: boolean;
  sendgrid: boolean;
  whatsapp: boolean;
} {
  return {
    gemini:     !!process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith("your_"),
    elevenLabs: !!process.env.ELEVEN_LABS_API_KEY && !process.env.ELEVEN_LABS_API_KEY.startsWith("your_"),
    twilio:     !!process.env.TWILIO_ACCOUNT_SID && !process.env.TWILIO_ACCOUNT_SID.startsWith("your_"),
    sendgrid:   !!process.env.SENDGRID_API_KEY && !process.env.SENDGRID_API_KEY.startsWith("your_"),
    whatsapp:   !!process.env.WHATSAPP_TOKEN && !process.env.WHATSAPP_TOKEN.startsWith("your_"),
  };
}
