import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../styles";

export const Scene5CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Dramatic scale reveal
  const mainSpring = spring({ frame, fps, config: { damping: 12, stiffness: 60, mass: 2 } });
  const mainScale = interpolate(mainSpring, [0, 1], [0.6, 1]);
  const mainOp = interpolate(mainSpring, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });

  // Price cards stagger
  const plans = [
    { name: "Launch", price: "$12K", detail: "one-time", features: ["5 core modules", "4-week delivery", "Full source code"] },
    { name: "Scale", price: "$25K", detail: "+ $2K/mo", features: ["20 modules", "12+ agents", "AI monitoring"], featured: true },
    { name: "Enterprise", price: "Custom", detail: "dedicated fleet", features: ["Unlimited", "On-premise", "99.9% SLA"] },
  ];

  // Bottom tagline
  const tagSpring = spring({ frame: frame - 90, fps, config: { damping: 20, stiffness: 150 } });
  const tagY = interpolate(tagSpring, [0, 1], [40, 0]);
  const tagOp = interpolate(tagSpring, [0, 0.5], [0, 1], { extrapolateRight: "clamp" });

  // Pulsing CTA glow
  const ctaGlow = interpolate(Math.sin(frame * 0.1), [-1, 1], [20, 50]);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Title */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 60,
          transform: `scale(${mainScale})`,
          opacity: mainOp,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 64,
            fontWeight: 700,
            color: COLORS.white,
            lineHeight: 1.15,
            marginBottom: 16,
          }}
        >
          Start Building{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #00E676, #00BCD4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Today
          </span>
        </div>
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 24,
            color: COLORS.muted,
          }}
        >
          Zero risk. Full ownership. AI-powered delivery.
        </div>
      </div>

      {/* Price cards */}
      <div style={{ display: "flex", gap: 32 }}>
        {plans.map((plan, i) => {
          const cardSpring = spring({
            frame: frame - 30 - i * 12,
            fps,
            config: { damping: 16, stiffness: 140 },
          });
          const cardY = interpolate(cardSpring, [0, 1], [80, 0]);
          const cardOp = interpolate(cardSpring, [0, 0.4], [0, 1], { extrapolateRight: "clamp" });

          return (
            <div
              key={i}
              style={{
                width: 320,
                padding: "36px 32px",
                background: plan.featured
                  ? "rgba(0,230,118,0.06)"
                  : "rgba(255,255,255,0.03)",
                border: plan.featured
                  ? `2px solid ${COLORS.primary}40`
                  : "1px solid rgba(255,255,255,0.06)",
                borderRadius: 20,
                transform: `translateY(${cardY}px)`,
                opacity: cardOp,
                boxShadow: plan.featured
                  ? `0 0 40px ${COLORS.primary}15`
                  : "none",
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 16,
                  color: COLORS.muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  marginBottom: 12,
                }}
              >
                {plan.name}
              </div>
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 48,
                  fontWeight: 700,
                  color: plan.featured ? COLORS.primary : COLORS.white,
                  marginBottom: 4,
                }}
              >
                {plan.price}
              </div>
              <div
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 14,
                  color: COLORS.muted,
                  marginBottom: 24,
                }}
              >
                {plan.detail}
              </div>
              {plan.features.map((f, fi) => (
                <div
                  key={fi}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: plan.featured ? COLORS.primary : COLORS.muted,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: FONTS.body,
                      fontSize: 15,
                      color: COLORS.white,
                    }}
                  >
                    {f}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Bottom tagline */}
      <div
        style={{
          marginTop: 60,
          textAlign: "center",
          transform: `translateY(${tagY}px)`,
          opacity: tagOp,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 28,
            fontWeight: 700,
            color: COLORS.primary,
            textShadow: `0 0 ${ctaGlow}px ${COLORS.primary}60`,
          }}
        >
          supersaas.ai
        </div>
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 18,
            color: COLORS.muted,
            marginTop: 8,
          }}
        >
          The future of software is autonomous.
        </div>
      </div>
    </AbsoluteFill>
  );
};
