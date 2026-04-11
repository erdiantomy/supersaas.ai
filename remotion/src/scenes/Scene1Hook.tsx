import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";
import { COLORS, FONTS } from "../styles";

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo fade-in + scale
  const logoOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  const logoScale = spring({ frame, fps, config: { damping: 15, stiffness: 60, mass: 1.8 } });

  // Logo fade-out to make room for text
  const logoFadeOut = interpolate(frame, [60, 80], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Text reveals after logo
  const superText = "SUPERSAAS";
  const tagline = ".AI";

  const textOpacity = interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Tagline slides in
  const tagX = interpolate(
    spring({ frame: frame - 95, fps, config: { damping: 20, stiffness: 200 } }),
    [0, 1],
    [100, 0]
  );
  const tagOpacity = interpolate(frame, [95, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Subtitle reveal
  const subY = interpolate(
    spring({ frame: frame - 105, fps, config: { damping: 20, stiffness: 150 } }),
    [0, 1],
    [60, 0]
  );
  const subOpacity = interpolate(frame, [105, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Stats stagger in
  const stats = [
    { val: "10×", label: "Faster" },
    { val: "80%", label: "Cheaper" },
    { val: "92%", label: "Automation" },
  ];

  // Glitch line
  const glitchOpacity = interpolate(
    frame,
    [75, 76, 77, 78],
    [0, 0.8, 0, 0.3],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Logo intro */}
      <div
        style={{
          position: "absolute",
          opacity: logoOpacity * logoFadeOut,
          transform: `scale(${interpolate(logoScale, [0, 1], [0.5, 1])})`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Img
          src={staticFile("images/logo.png")}
          style={{
            width: 500,
            height: "auto",
            filter: `drop-shadow(0 0 60px ${COLORS.primary}60)`,
          }}
        />
      </div>

      {/* Horizontal glitch line */}
      <div
        style={{
          position: "absolute",
          top: "48%",
          left: 0,
          right: 0,
          height: 2,
          background: COLORS.primary,
          opacity: glitchOpacity,
          boxShadow: `0 0 30px ${COLORS.primary}`,
        }}
      />

      {/* Main logo text */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          opacity: textOpacity,
        }}
      >
        <div style={{ display: "flex" }}>
          {superText.split("").map((char, i) => {
            const charSpring = spring({
              frame: frame - 75 - i * 2,
              fps,
              config: { damping: 12, stiffness: 200 },
            });
            const y = interpolate(charSpring, [0, 1], [80, 0]);
            const charOpacity = interpolate(charSpring, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });
            return (
              <span
                key={i}
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 130,
                  fontWeight: 700,
                  color: COLORS.white,
                  transform: `translateY(${y}px)`,
                  opacity: charOpacity,
                  display: "inline-block",
                  letterSpacing: "-0.02em",
                }}
              >
                {char}
              </span>
            );
          })}
        </div>
        <span
          style={{
            fontFamily: FONTS.display,
            fontSize: 130,
            fontWeight: 700,
            color: COLORS.primary,
            transform: `translateX(${tagX}px)`,
            opacity: tagOpacity,
            textShadow: `0 0 40px ${COLORS.primary}80`,
          }}
        >
          {tagline}
        </span>
      </div>

      {/* Subtitle */}
      <div
        style={{
          marginTop: 30,
          transform: `translateY(${subY}px)`,
          opacity: subOpacity,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 36,
            color: COLORS.muted,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          AI Agents That Build Your Entire Business
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          gap: 100,
          marginTop: 80,
        }}
      >
        {stats.map((s, i) => {
          const sSpring = spring({
            frame: frame - 120 - i * 10,
            fps,
            config: { damping: 15, stiffness: 180 },
          });
          const sY = interpolate(sSpring, [0, 1], [50, 0]);
          const sOpacity = interpolate(sSpring, [0, 0.5], [0, 1], { extrapolateRight: "clamp" });
          return (
            <div
              key={i}
              style={{
                textAlign: "center",
                transform: `translateY(${sY}px)`,
                opacity: sOpacity,
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 72,
                  fontWeight: 700,
                  color: COLORS.primary,
                  textShadow: `0 0 20px ${COLORS.primary}40`,
                }}
              >
                {s.val}
              </div>
              <div
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 20,
                  color: COLORS.muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginTop: 4,
                }}
              >
                {s.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
