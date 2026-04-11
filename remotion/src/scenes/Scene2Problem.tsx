import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../styles";

const problems = [
  { icon: "💸", text: "$50K+ wasted on agencies that ghost you" },
  { icon: "⏰", text: "6-12 months for an MVP that's already outdated" },
  { icon: "🔧", text: "4+ SaaS tools duct-taped together" },
  { icon: "😤", text: "Developers who don't understand your business" },
];

export const Scene2Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title
  const titleSpring = spring({ frame, fps, config: { damping: 20, stiffness: 150 } });
  const titleY = interpolate(titleSpring, [0, 1], [60, 0]);
  const titleOp = interpolate(titleSpring, [0, 0.5], [0, 1], { extrapolateRight: "clamp" });

  // Strike-through animation
  const strikeWidth = interpolate(frame, [20, 50], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", padding: "0 160px" }}>
      <div style={{ display: "flex", gap: 100 }}>
        {/* Left - Problem statement */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 18,
              color: COLORS.primary,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              marginBottom: 20,
              opacity: titleOp,
            }}
          >
            The Problem
          </div>
          <div
            style={{
              fontFamily: FONTS.display,
              fontSize: 64,
              fontWeight: 700,
              color: COLORS.white,
              lineHeight: 1.1,
              transform: `translateY(${titleY}px)`,
              opacity: titleOp,
            }}
          >
            Software agencies
            <br />
            are{" "}
            <span style={{ position: "relative", color: "#FF5252" }}>
              broken
              <div
                style={{
                  position: "absolute",
                  top: "55%",
                  left: 0,
                  width: `${strikeWidth}%`,
                  height: 4,
                  background: "#FF5252",
                  borderRadius: 2,
                }}
              />
            </span>
          </div>
        </div>

        {/* Right - Problem cards */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
          {problems.map((p, i) => {
            const cardSpring = spring({
              frame: frame - 30 - i * 12,
              fps,
              config: { damping: 18, stiffness: 160 },
            });
            const cardX = interpolate(cardSpring, [0, 1], [200, 0]);
            const cardOp = interpolate(cardSpring, [0, 0.4], [0, 1], { extrapolateRight: "clamp" });

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  padding: "24px 30px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 16,
                  transform: `translateX(${cardX}px)`,
                  opacity: cardOp,
                }}
              >
                <span style={{ fontSize: 36 }}>{p.icon}</span>
                <span
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: 22,
                    color: COLORS.white,
                    lineHeight: 1.4,
                  }}
                >
                  {p.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
