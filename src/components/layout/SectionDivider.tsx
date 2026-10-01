import React from "react";

type DividerVariant = "curve" | "wave" | "tilt" | "arc";

interface SectionDividerProps {
  /** Tailwind fill-* class for the SVG path (matches the NEXT section's background) */
  fillClass: string;
  /** Tailwind bg-* class for the container (matches the PREVIOUS section's background) */
  bgClass: string;
  /** Shape variant for visual variety between transitions */
  variant?: DividerVariant;
  /** Flip the shape horizontally for alternating transitions */
  flip?: boolean;
  className?: string;
}

const paths: Record<DividerVariant, string> = {
  curve: "M0,0 C360,96 1080,96 1440,0 L1440,96 L0,96 Z",
  wave: "M0,48 C360,96 720,0 1080,48 C1260,96 1380,96 1440,48 L1440,96 L0,96 Z",
  tilt: "M0,96 L1440,0 L1440,96 Z",
  arc: "M0,0 Q720,128 1440,0 L1440,96 L0,96 Z",
};

export const SectionDivider: React.FC<SectionDividerProps> = ({
  fillClass,
  bgClass,
  variant = "curve",
  flip = false,
  className = "",
}) => {
  return (
    <div
      className={`relative w-full leading-[0] -mt-px ${bgClass} ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 96"
        preserveAspectRatio="none"
        className={`block w-full h-12 sm:h-16 lg:h-24 ${flip ? "scale-x-[-1]" : ""}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={paths[variant]} className={fillClass} />
      </svg>
    </div>
  );
};
