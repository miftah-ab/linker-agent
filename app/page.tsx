import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Linker — LinkedIn Presence on Autopilot",
  description:
    "Linker monitors your LinkedIn niche, surfaces real opportunities, and publishes authentic content in your voice — without you lifting a finger.",
};

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

export default function LandingPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)" }}>

      {/* ── Nav ── */}
      <header style={{
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        background: "var(--bg)",
        zIndex: 50,
      }}>
        <div style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "0 24px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em" }}>
            Linker
          </span>

          <nav style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <a href="#how" style={{ fontSize: 14, color: "var(--text-muted)", textDecoration: "none" }}>
              How it works
            </a>
            <a href="#features" style={{ fontSize: 14, color: "var(--text-muted)", textDecoration: "none" }}>
              Features
            </a>
            <a href="#pricing" style={{ fontSize: 14, color: "var(--text-muted)", textDecoration: "none" }}>
              Pricing
            </a>
            <Link
              href="/api/v1/auth/linkedin"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                background: "var(--accent)",
                color: "#fff",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <LinkedInIcon />
              Connect LinkedIn
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "96px 24px 80px" }}>
        <div style={{ maxWidth: 680 }}>
          <p style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--accent)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 20,
          }}>
            LinkedIn Presence Agent
          </p>

          <h1 style={{
            fontSize: "clamp(38px, 5vw, 60px)",
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            marginBottom: 24,
            color: "var(--text)",
          }}>
            Your LinkedIn,<br />
            running on autopilot.
          </h1>

          <p style={{
            fontSize: 18,
            color: "var(--text-muted)",
            lineHeight: 1.65,
            marginBottom: 40,
            maxWidth: 520,
          }}>
            Linker watches your niche around the clock, finds the moments worth
            posting about, writes in your voice, and publishes — with or without
            you in the loop.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <Link
              href="/api/v1/auth/linkedin"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 22px",
                background: "var(--accent)",
                color: "#fff",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <LinkedInIcon />
              Get started — it&apos;s free
            </Link>
            <a
              href="#how"
              style={{
                fontSize: 14,
                color: "var(--text-muted)",
                textDecoration: "none",
                borderBottom: "1px solid var(--border)",
                paddingBottom: 1,
              }}
            >
              See how it works →
            </a>
          </div>

          <p style={{ marginTop: 16, fontSize: 13, color: "var(--text-faint)" }}>
            No email. No password. Just your LinkedIn — takes under 2 minutes.
          </p>
        </div>

        {/* Stats row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 1,
          marginTop: 72,
          background: "var(--border-subtle)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          overflow: "hidden",
        }}>
          {[
            { value: "10×", label: "faster than manual posting" },
            { value: "24/7", label: "niche monitoring" },
            { value: "100%", label: "your voice, always" },
            { value: "0", label: "fake posts, ever" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "var(--bg-subtle)",
                padding: "28px 24px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-faint)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divider ── */}
      <div style={{ borderTop: "1px solid var(--border)" }} />

      {/* ── How it works ── */}
      <section id="how" style={{ maxWidth: 1080, margin: "0 auto", padding: "80px 24px" }}>
        <p style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text-muted)",
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          marginBottom: 40,
        }}>
          How it works
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 48 }}>
          {[
            {
              n: "1",
              title: "Connect LinkedIn",
              body: "Authorize in 30 seconds. Linker reads your profile, past posts, and niche to build a model of who you are professionally.",
            },
            {
              n: "2",
              title: "Connect Telegram",
              body: "Your command line. Approve drafts, get strategic nudges, and control your agent — all from your phone, no dashboard needed.",
            },
            {
              n: "3",
              title: "Linker runs for you",
              body: "Your agent monitors, drafts, and publishes continuously. You focus on the actual work. Linker handles the presence.",
            },
          ].map((step) => (
            <div key={step.n}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "var(--bg-raised)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                color: "var(--text-muted)",
                marginBottom: 16,
              }}>
                {step.n}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 10, letterSpacing: "-0.01em" }}>
                {step.title}
              </h3>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.65 }}>
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divider ── */}
      <div style={{ borderTop: "1px solid var(--border)" }} />

      {/* ── Features ── */}
      <section id="features" style={{ maxWidth: 1080, margin: "0 auto", padding: "80px 24px" }}>
        <p style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text-muted)",
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          marginBottom: 40,
        }}>
          What Linker does
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--border-subtle)" }}>
          {[
            {
              title: "Professional Brain",
              body: "Linker builds a living model of your expertise, voice, audience, and goals — and uses it to make every post unmistakably yours. Not a generic AI voice. Yours.",
            },
            {
              title: "Opportunity Engine",
              body: "Monitors your niche around the clock and surfaces only the signals worth acting on. Trending conversations, relevant discussions, moments your audience cares about.",
            },
            {
              title: "Autonomous Publishing",
              body: "Drafts, critiques, schedules, and publishes with your approval — or runs fully autonomously when you trust the system. You control how much is on autopilot.",
            },
            {
              title: "Telegram Control Center",
              body: "No dashboard required. Review drafts, approve posts, and steer your agent's direction right inside Telegram. Works from anywhere.",
            },
            {
              title: "Performance Intelligence",
              body: "Tracks what resonates and feeds that back into your Brain. Your content compounds over time — each week better than the last.",
            },
            {
              title: "Zero fabrication, ever",
              body: "No invented achievements. No hollow buzzwords. Every post is grounded in your actual work and real evidence. Authentic or nothing.",
            },
          ].map((f) => (
            <div
              key={f.title}
              style={{
                background: "var(--bg)",
                padding: "36px 36px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <h3 style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 10,
                letterSpacing: "-0.01em",
              }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7 }}>
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divider ── */}
      <div style={{ borderTop: "1px solid var(--border)" }} />

      {/* ── Pricing ── */}
      <section id="pricing" style={{ maxWidth: 1080, margin: "0 auto", padding: "80px 24px" }}>
        <p style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text-muted)",
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          marginBottom: 40,
        }}>
          Pricing
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 760 }}>
          {/* Free */}
          <div style={{
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 32,
          }}>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>Free</p>
            <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 4 }}>$0</div>
            <p style={{ fontSize: 13, color: "var(--text-faint)", marginBottom: 28 }}>No credit card required</p>

            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {[
                "Professional Brain setup",
                "Opportunity scanning",
                "Draft generation",
                "Telegram integration",
                "3 scheduled posts / month",
              ].map((item) => (
                <li key={item} style={{ fontSize: 14, color: "var(--text-muted)", display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "var(--text-faint)", marginTop: 1 }}>—</span>
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/api/v1/auth/linkedin"
              style={{
                display: "block",
                textAlign: "center",
                padding: "10px 0",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                color: "var(--text)",
                textDecoration: "none",
              }}
            >
              Get started free
            </Link>
          </div>

          {/* Pro */}
          <div style={{
            border: "1px solid var(--accent)",
            borderRadius: 12,
            padding: 32,
            position: "relative",
          }}>
            <div style={{
              position: "absolute",
              top: -11,
              left: 20,
              background: "var(--accent)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 20,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}>
              Most popular
            </div>

            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>Linker Pro</p>
            <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 4 }}>$19</div>
            <p style={{ fontSize: 13, color: "var(--text-faint)", marginBottom: 28 }}>per month</p>

            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {[
                "Everything in Free",
                "Autonomous publishing mode",
                "Unlimited scheduled posts",
                "Advanced opportunity engine",
                "Full content analytics",
                "Priority Telegram updates",
                "MCP access",
              ].map((item) => (
                <li key={item} style={{ fontSize: 14, color: "var(--text-muted)", display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "var(--text-faint)", marginTop: 1 }}>—</span>
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/api/v1/auth/linkedin"
              style={{
                display: "block",
                textAlign: "center",
                padding: "10px 0",
                background: "var(--accent)",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                color: "#fff",
                textDecoration: "none",
              }}
            >
              Start with Pro
            </Link>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div style={{ borderTop: "1px solid var(--border)" }} />

      {/* ── Final CTA ── */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "96px 24px" }}>
        <div style={{ maxWidth: 560 }}>
          <h2 style={{
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
            marginBottom: 20,
          }}>
            You do the work.<br />
            Linker tells the world.
          </h2>
          <p style={{ fontSize: 17, color: "var(--text-muted)", lineHeight: 1.65, marginBottom: 36 }}>
            Stop grinding LinkedIn. Connect once and let your agent build
            your presence — every day, in your voice, without the noise.
          </p>
          <Link
            href="/api/v1/auth/linkedin"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "13px 24px",
              background: "var(--accent)",
              color: "#fff",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <LinkedInIcon />
            Connect LinkedIn — free
          </Link>
          <p style={{ marginTop: 12, fontSize: 13, color: "var(--text-faint)" }}>
            Free plan available · No credit card · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "28px 0" }}>
        <div style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 13,
          color: "var(--text-faint)",
        }}>
          <span style={{ fontWeight: 600, color: "var(--text-muted)" }}>Linker</span>
          <div style={{ display: "flex", gap: 24 }}>
            <span>© 2026</span>
            <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Privacy</a>
            <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
