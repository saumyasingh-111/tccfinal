import React from "react";

interface BrandLogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "badge" | "horizontal";
  showSubtitle?: boolean;
  alt?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = "",
  size = "md",
  variant = "badge",
  showSubtitle = false,
  alt = "The Classic Crush Bakery & Café",
}) => {
  const sizeMap = {
    xs: "w-8 h-8",
    sm: "w-10 h-10",
    md: "w-11 h-11 sm:w-14 sm:h-14 lg:w-16 lg:h-16",
    lg: "w-16 h-16 sm:w-20 sm:h-20",
    xl: "w-24 h-24 sm:w-28 sm:h-28",
  };

  const logoImg = (
    <img
      src="/tcc-logo-512.png"
      srcSet="/tcc-logo-256.png 256w, /tcc-logo-512.png 512w, /tcc-logo-official.png 1024w"
      sizes="(max-width: 640px) 44px, (max-width: 1024px) 60px, 64px"
      alt={alt}
      className={`rounded-full object-contain shrink-0 aspect-square select-none transition-transform duration-300 group-hover:scale-[1.02] shadow-xs ${sizeMap[size]}`}
      loading="eager"
      width={size === "xs" ? 32 : size === "sm" ? 44 : size === "md" ? 64 : size === "lg" ? 80 : 112}
      height={size === "xs" ? 32 : size === "sm" ? 44 : size === "md" ? 64 : size === "lg" ? 80 : 112}
    />
  );

  if (variant === "badge" && showSubtitle) {
    return (
      <div className={`inline-flex items-center gap-3 ${className}`}>
        {logoImg}
        <div className="flex flex-col text-left">
          <span className="font-serif text-lg sm:text-xl font-bold tracking-[0.14em] uppercase text-[#0F3A23] leading-tight">
            The Classic Crush
          </span>
          <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.32em] font-semibold text-[#6E776F]">
            Bakery &amp; Café
          </span>
        </div>
      </div>
    );
  }

  return <div className={`inline-block ${className}`}>{logoImg}</div>;
};
