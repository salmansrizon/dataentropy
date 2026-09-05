import React from "react";
import { useReducedMotion } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

interface LottieAnimationProps {
  src: string;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  style?: React.CSSProperties;
  playOnHover?: boolean;
  speed?: number;
}

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
  return (
    <div className={className} style={style}>
      <DotLottieReact
        src={src}
        loop={loop}
        autoplay={autoplay && !reduceMotion}
        playOnHover={playOnHover && !reduceMotion}
        key={String(reduceMotion)}
        speed={speed}
      />
    </div>
  );
};

export default LottieAnimation;
