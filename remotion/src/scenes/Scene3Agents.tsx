import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence } from "remotion";
import { COLORS, FONTS } from "../styles";

const agents = [
  { name: "Discovery Agent", desc: "Maps every workflow in 72hrs", color: "#42A5F5", icon: "🔍" },
  { name: "Architect Agent", desc: "Designs schemas & APIs in 48hrs", color: "#B388FF", icon: "🏗️" },
  { name: "Builder Swarm", desc: "12 agents coding in parallel", color: COLORS.primary, icon: "⚡" },
  { name: "QA Agent", desc: "847 automated tests per project", color: "#FFB74D", icon: "🛡️" },
];

export const Scene3Agents: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title
  const titleSpring = spring({ frame, fps, config: { damping: 20, stiffness: 150 } });
  const titleScale = interpolate(titleSpring, [0, 1], [0.8, 1]);
  const titleOp = interpolate(titleSpring, [0, 0.5], [0, 1], { extrapolateRight: "clamp" });

  // Central hub pulse
  const pulse = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.9, 1.1]);
  const hubOp = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Connection lines
  const lineProgress = interpolate(frame, [60, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 80,
          textAlign: "center",
          width: "100%",
          transform: `scale(${titleScale})`,
          opacity: titleOp,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 18,
            color: COLORS.primary,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            marginBottom: 16,
          }}
        >
          Our Solution
        </div>
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 60,
            fontWeight: 700,
            color: COLORS.white,
          }}
        >
          The{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #00E676, #00BCD4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Agent Orchestra
          </span>
        </div>
      </div>

      {/* Central hub */}
      <div
        style={{
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.primary}30 0%, transparent 70%)`,
          border: `2px solid ${COLORS.primary}60`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${pulse})`,
          opacity: hubOp,
          boxShadow: `0 0 60px ${COLORS.primary}30`,
        }}
      >
        <span
          style={{
            fontFamily: FONTS.display,
            fontSize: 18,
            fontWeight: 700,
            color: COLORS.primary,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          ORCHESTRA
        </span>
      </div>

      {/* Agent cards in orbital positions */}
      {agents.map((agent, i) => {
        const angle = (i * Math.PI * 2) / 4 - Math.PI / 2;
        const radius = 320;
        const cx = Math.cos(angle) * radius;
        const cy = Math.sin(angle) * radius;

        const cardSpring = spring({
          frame: frame - 60 - i * 15,
          fps,
          config: { damping: 14, stiffness: 120 },
        });
        const cardScale = interpolate(cardSpring, [0, 1], [0, 1]);
        const cardOp = interpolate(cardSpring, [0, 0.4], [0, 1], { extrapolateRight: "clamp" });

        // Subtle orbital drift
        const drift = interpolate(Math.sin(frame * 0.03 + i), [-1, 1], [-8, 8]);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `calc(50% + ${cx}px - 130px)`,
              top: `calc(50% + ${cy}px - 55px)`,
              width: 260,
              padding: "20px 24px",
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${agent.color}30`,
              borderRadius: 16,
              transform: `scale(${cardScale}) translateY(${drift}px)`,
              opacity: cardOp,
              boxShadow: `0 0 30px ${agent.color}10`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 28 }}>{agent.icon}</span>
              <span
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 18,
                  fontWeight: 700,
                  color: agent.color,
                }}
              >
                {agent.name}
              </span>
            </div>
            <div
              style={{
                fontFamily: FONTS.body,
                fontSize: 15,
                color: COLORS.muted,
                lineHeight: 1.4,
              }}
            >
              {agent.desc}
            </div>
          </div>
        );
      })}

      {/* Connection lines (SVG) */}
      <svg
        style={{ position: "absolute", width: "100%", height: "100%", pointerEvents: "none" }}
        viewBox="0 0 1920 1080"
      >
        {agents.map((agent, i) => {
          const angle = (i * Math.PI * 2) / 4 - Math.PI / 2;
          const radius = 320;
          const cx = 960 + Math.cos(angle) * radius;
          const cy = 540 + Math.sin(angle) * radius;
          return (
            <line
              key={i}
              x1={960}
              y1={540}
              x2={960 + (cx - 960) * lineProgress}
              y2={540 + (cy - 540) * lineProgress}
              stroke={agent.color}
              strokeWidth={1.5}
              strokeDasharray="6 6"
              opacity={0.3 * lineProgress}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
