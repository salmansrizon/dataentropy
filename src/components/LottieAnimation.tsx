import React, { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { DotLottieReact, type DotLottie } from "@lottiefiles/dotlottie-react";

interface LottieAnimationProps {
  src: string;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  style?: React.CSSProperties;
  playOnHover?: boolean;
  speed?: number;
}

/**
 * Plays only while on screen (and never under reduced motion), so several
 * Lotties on one page don't all animate at once or burn CPU off-screen.
 * Hidden (display:none) instances never intersect, so they stay paused too.
 */
const LottieAnimation = ({
  src,
  loop = true,
  autoplay = true,
  className,
  style,
  playOnHover = false,
  speed = 1,
}: LottieAnimationProps) => {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-10% 0px" });
  const [player, setPlayer] = useState<DotLottie | null>(null);

  useEffect(() => {
    if (!player || playOnHover) return;
    if (autoplay && inView && !reduceMotion) player.play();
    else player.pause();
  }, [player, inView, autoplay, reduceMotion, playOnHover]);

  return (
    <div ref={ref} className={`lottie-soft-edges ${className ?? ""}`} style={style}>
      <DotLottieReact
        src={src}
        loop={loop}
        autoplay={false}
        playOnHover={playOnHover && !reduceMotion}
        dotLottieRefCallback={setPlayer}
        speed={speed}
      />
    </div>
  );
};

export default LottieAnimation;
