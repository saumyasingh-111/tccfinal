import React, { useId } from "react";

interface AwningStripProps {
  className?: string;
  variant?: "dark-on-cream" | "cream-on-dark" | "inverted";
  height?: number;
}

/**
 * The Signature Classic Crush Awning Valence Trim
 * Inspired by the artisanal bakery awning seen in the approved reference
 * (Page 1 header and Menu cover)
 */
export const AwningStrip: React.FC<AwningStripProps> = ({
  className = "",
  variant = "dark-on-cream",
  height = 12,
}) => {
  const patternId = useId();
  const isDarkOnCream = variant === "dark-on-cream";
  const tabColor = isDarkOnCream ? "#0F3A23" : "#FAF6F0";

  return (
    <div
      className={`w-full overflow-hidden select-none pointer-events-none ${className}`}
      aria-hidden="true"
      style={{ height: `${height}px` }}
    >
      <svg
        className="w-full h-full block"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={patternId}
            width="14"
            height={height}
            patternUnits="userSpaceOnUse"
          >
            {/* Elegant vertical awning tab hanging with rounded bottom */}
            <rect
              x="2"
              y="0"
              width="8"
              height={height}
              rx="2"
              ry="2"
              fill={tabColor}
            />
          </pattern>
        </defs>
        <rect width="100%" height={height} fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
};
