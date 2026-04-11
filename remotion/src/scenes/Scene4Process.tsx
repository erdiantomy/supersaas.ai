import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../styles";

const steps = [
  { num: "01", title: "Describe Your Problem", time: "5 min", color: "#42A5F5" },
  { num: "02", title: "AI Proposes Solution", time: "48 hrs", color: "#B388FF" },
  { num: "03", title: "Negotiate & Agree", time: "Real-time", color: COLORS.primary },
  { num: "04", title: "Agents Build It", time: "2-6 weeks", color: "#FFB74D" },
  { num: "05", title: "Deploy & Evolve", time: "Continuous", color: "#FF5252" },
];

export const Scene4Process: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title
  const titleSpring = spring({ frame, fps, config: { damping: 20, stiffness: 150 } });
  const titleOp = interpolate(titleSpring, [0, 0.5], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(titleSpring, [0, 1], [40, 0]);

  return (
    <AbsoluteFill style={{ padding: "0 120px", justifyContent: "center" }}>
      {/* Title */}
      <div
        style={{
          marginBottom: 70,
          textAlign: "center",
          transform: `translateY(${titleY}px)`,
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
          How It Works
        </div>
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 56,
            fontWeight: 700,
            color: COLORS.white,
          }}
        >
          100% Autonomous Journey
        </div>
      </div>

      {/* Timeline */}
      <div style={{ display: "flex", gap: 24, position: "relative" }}>
        {/* Progress line */}
        <div
          style={{
            position: "absolute",
            top: 44,
            left: 40,
            right: 40,
            height: 2,
            background: "rgba(255,255,255,0.06)",
            borderRadius: 1,
          }}
        >
          <div
            style={{
              width: `${interpolate(frame, [30, 120], [0, 100], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.accent})`,
              borderRadius: 1,
              boxShadow: `0 0 15px ${COLORS.primary}40`,
            }}
          />
        </div>

        {steps.map((step, i) => {
          const delay = 20 + i * 18;
          const sSpring = spring({
            frame: frame - delay,
            fps,
            config: { damping: 15, stiffness: 160 },
          });
          const sY = interpolate(sSpring, [0, 1], [60, 0]);
          const sOp = interpolate(sSpring, [0, 0.4], [0, 1], { extrapolateRight: "clamp" });

          // Number scale pop
          const numScale = interpolate(
            spring({ frame: frame - delay - 5, fps, config: { damping: 8, stiffness: 300 } }),
            [0, 1],
            [0, 1]
          );

          return (
            <div
              key={i}
              style={{
                flex: 1,
                textAlign: "center",
                transform: `translateY(${sY}px)`,
                opacity: sOp,
              }}
            >
              {/* Number circle */}
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: "50%",
                  background: `${step.color}15`,
                  border: `2px solid ${step.color}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  transform: `scale(${numScale})`,
                  boxShadow: `0 0 30px ${step.color}15`,
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 28,
                    fontWeight: 700,
                    color: step.color,
                  }}
                >
                  {step.num}
                </span>
              </div>

              <div
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 20,
                  fontWeight: 700,
                  color: COLORS.white,
                  marginBottom: 8,
                }}
              >
                {step.title}
              </div>
              <div
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 16,
                  color: step.color,
                  fontWeight: 600,
                }}
              >
                {step.time}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
