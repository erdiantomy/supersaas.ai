import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Problem } from "./scenes/Scene2Problem";
import { Scene3Agents } from "./scenes/Scene3Agents";
import { Scene4Process } from "./scenes/Scene4Process";
import { Scene5CTA } from "./scenes/Scene5CTA";
import { COLORS } from "./styles";

loadSpaceGrotesk();
loadInter();

export const MainVideo: React.FC = () => {
  const frame = useCurrentFrame();

  // Persistent animated background
  const bgPulse = interpolate(Math.sin(frame * 0.02), [-1, 1], [0.03, 0.08]);
  const bgX = interpolate(Math.sin(frame * 0.008), [-1, 1], [30, 70]);
  const bgY = interpolate(Math.cos(frame * 0.006), [-1, 1], [30, 70]);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Persistent radial glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at ${bgX}% ${bgY}%, ${COLORS.primary}${Math.round(bgPulse * 255).toString(16).padStart(2, "0")} 0%, transparent 60%)`,
        }}
      />

      {/* Grid overlay */}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
          opacity: 0.5,
        }}
      />

      {/* Floating orbs */}
      {[0, 1, 2].map((i) => {
        const x = interpolate(
          Math.sin(frame * 0.01 + i * 2.1),
          [-1, 1],
          [10 + i * 25, 30 + i * 25]
        );
        const y = interpolate(
          Math.cos(frame * 0.012 + i * 1.7),
          [-1, 1],
          [20, 80]
        );
        const colors = [COLORS.primary, COLORS.accent, COLORS.purple];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: 300 + i * 100,
              height: 300 + i * 100,
              borderRadius: "50%",
              background: colors[i],
              opacity: 0.04,
              filter: "blur(120px)",
            }}
          />
        );
      })}

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={165}>
          <Scene1Hook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene2Problem />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 25 })}
        />
        <TransitionSeries.Sequence durationInFrames={180}>
          <Scene3Agents />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 25 })}
        />
        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene4Process />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={170}>
          <Scene5CTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
