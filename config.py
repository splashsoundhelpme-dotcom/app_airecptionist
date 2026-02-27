"""
config.py — Fiduciary Mandate Configuration
============================================
Reads API keys from environment variables (Secrets panel / .env.local).
Used by any Python-side AI scripts that complement the Next.js backend.

Fiduciary Mandate v1.0
  - The AI acts exclusively in the interest of the registered business.
  - Keys are never logged or exposed to the client.
  - All operations are scoped to a single business_id per session.

Usage:
    from config import cfg
    print(cfg.gemini_api_key)
    print(cfg.eleven_labs_api_key)
"""

import os
from dataclasses import dataclass, field
from typing import Optional


# ── Helpers ───────────────────────────────────────────────────────────────────

def _require(key: str) -> str:
    """
    Returns the value of an environment variable.
    Raises ValueError in production if the key is missing or still a placeholder.
    Warns (but does not raise) in development.
    """
    value = os.environ.get(key, "")
    is_placeholder = not value or value.startswith("your_")

    if is_placeholder:
        env = os.environ.get("NODE_ENV", os.environ.get("APP_ENV", "development"))
        if env == "production":
            raise ValueError(
                f"[config] Missing required secret: {key}. "
                "Set it in the Secrets panel before deploying."
            )
        print(f"[config] WARNING: {key} is not configured (placeholder or empty).")
        return ""

    return value


def _optional(key: str, fallback: str = "") -> str:
    """Returns the env var value or a fallback if missing/placeholder."""
    value = os.environ.get(key, "")
    if not value or value.startswith("your_"):
        return fallback
    return value


# ── Config dataclass ──────────────────────────────────────────────────────────

@dataclass
class AppConfig:
    """
    Central configuration object for the AI Receptionist backend.
    Instantiate once at startup via `load_config()`.
    """

    # ── AI ────────────────────────────────────────────────────────────────────
    gemini_api_key: str = field(default_factory=lambda: _require("GEMINI_API_KEY"))
    eleven_labs_api_key: str = field(default_factory=lambda: _require("ELEVEN_LABS_API_KEY"))

    # ── Twilio ────────────────────────────────────────────────────────────────
    twilio_account_sid: str = field(default_factory=lambda: _require("TWILIO_ACCOUNT_SID"))
    twilio_auth_token: str = field(default_factory=lambda: _require("TWILIO_AUTH_TOKEN"))
    twilio_phone_number: str = field(default_factory=lambda: _optional("TWILIO_PHONE_NUMBER", "+1234567890"))

    # ── SendGrid ──────────────────────────────────────────────────────────────
    sendgrid_api_key: str = field(default_factory=lambda: _require("SENDGRID_API_KEY"))
    sendgrid_from_email: str = field(default_factory=lambda: _optional("SENDGRID_FROM_EMAIL", "noreply@ai-booking.app"))
    sendgrid_from_name: str = field(default_factory=lambda: _optional("SENDGRID_FROM_NAME", "AI Booking Assistant"))

    # ── WhatsApp Business ─────────────────────────────────────────────────────
    whatsapp_token: str = field(default_factory=lambda: _require("WHATSAPP_TOKEN"))
    whatsapp_business_id: str = field(default_factory=lambda: _require("WHATSAPP_BUSINESS_ID"))
    whatsapp_phone_id: str = field(default_factory=lambda: _require("WHATSAPP_PHONE_ID"))

    # ── App ───────────────────────────────────────────────────────────────────
    app_url: str = field(default_factory=lambda: _optional("NEXT_PUBLIC_APP_URL", "http://localhost:3000"))
    webhook_secret: str = field(default_factory=lambda: _optional("WEBHOOK_SECRET", "dev-secret"))
    default_business_id: str = field(default_factory=lambda: _optional("DEFAULT_BUSINESS_ID", "twilight-lake-0344"))

    # ── Fiduciary Mandate ─────────────────────────────────────────────────────
    mandate_version: str = "1.0"

    # ── Guard Contract ────────────────────────────────────────────────────────
    no_show_threshold: int = 2       # flag as "at_risk" after N no-shows
    block_threshold: int = 3         # block client after N no-shows
    penalty_amount_eur: float = 30.0 # penalty per no-show in EUR

    def is_configured(self, service: str) -> bool:
        """
        Returns True if the given service has a real (non-placeholder) API key.

        Args:
            service: one of "gemini", "eleven_labs", "twilio", "sendgrid", "whatsapp"
        """
        checks = {
            "gemini":      bool(self.gemini_api_key),
            "eleven_labs": bool(self.eleven_labs_api_key),
            "twilio":      bool(self.twilio_account_sid) and bool(self.twilio_auth_token),
            "sendgrid":    bool(self.sendgrid_api_key),
            "whatsapp":    bool(self.whatsapp_token) and bool(self.whatsapp_phone_id),
        }
        return checks.get(service, False)

    def integration_status(self) -> dict:
        """Returns a dict of service → configured (bool) for all integrations."""
        return {
            "gemini":      self.is_configured("gemini"),
            "eleven_labs": self.is_configured("eleven_labs"),
            "twilio":      self.is_configured("twilio"),
            "sendgrid":    self.is_configured("sendgrid"),
            "whatsapp":    self.is_configured("whatsapp"),
        }

    def fiduciary_system_prompt(self, business_name: str, business_id: Optional[str] = None) -> str:
        """
        Returns the Fiduciary Mandate system prompt to inject into every AI call.
        Mirrors the TypeScript version in src/lib/multi-tenant.ts.
        """
        bid = business_id or self.default_business_id
        return (
            f"MANDATO FIDUCIARIO — ISTRUZIONI OPERATIVE VINCOLANTI\n"
            f"=====================================================\n"
            f"Sei l'assistente AI esclusivo di \"{business_name}\" (ID: {bid}).\n"
            f"Operi sotto Mandato Fiduciario versione {self.mandate_version}.\n\n"
            f"OBBLIGHI:\n"
            f"1. Agisci ESCLUSIVAMENTE nell'interesse di \"{business_name}\".\n"
            f"2. Non condividere MAI dati, prenotazioni o informazioni di altri clienti o attività.\n"
            f"3. Mantieni la riservatezza assoluta su tutti i dati del business.\n"
            f"4. Applica le penali del Guard Contract per i no-show (vedi sotto).\n"
            f"5. Conferma sempre le prenotazioni via email e WhatsApp quando disponibili.\n\n"
            f"GUARD CONTRACT — POLITICA NO-SHOW:\n"
            f"- Dopo {self.no_show_threshold} no-show, il cliente viene segnalato come \"a rischio\".\n"
            f"- Dopo {self.block_threshold} no-show, il cliente viene bloccato automaticamente.\n"
            f"- La penale standard è di €{self.penalty_amount_eur:.0f} per no-show.\n"
            f"- Comunica sempre la politica no-show al momento della prenotazione.\n\n"
            f"CANALI GESTITI: Telefono (ElevenLabs), Email (SendGrid), WhatsApp (Meta Business API)."
        )


# ── Singleton ─────────────────────────────────────────────────────────────────

def load_config() -> AppConfig:
    """
    Loads and validates the application configuration from environment variables.
    Call once at startup; reuse the returned object throughout the application.
    """
    return AppConfig()


# Module-level singleton — import `cfg` directly for convenience.
cfg: AppConfig = load_config()


# ── CLI self-test ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=== AI Receptionist — Config Self-Test ===")
    print(f"Business ID  : {cfg.default_business_id}")
    print(f"App URL      : {cfg.app_url}")
    print(f"Mandate v    : {cfg.mandate_version}")
    print()
    print("Integration status:")
    for service, ok in cfg.integration_status().items():
        status = "✅ configured" if ok else "⚠️  NOT configured"
        print(f"  {service:<14} {status}")
    print()
    print("Fiduciary system prompt preview:")
    print(cfg.fiduciary_system_prompt("Salone Bella", cfg.default_business_id)[:300] + "...")
    print("==========================================")
