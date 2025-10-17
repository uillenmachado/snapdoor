interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "full" | "icon-only";
}

export function Logo({ className = "", size = "md", variant = "full" }: LogoProps) {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10",
    xl: "h-12"
  };

  const iconSizes = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-10 w-10"
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl"
  };

  // Logo com favicon.svg
  if (variant === "icon-only") {
    return (
      <img 
        src="/favicon.svg" 
        alt="SnapDoor" 
        className={`${iconSizes[size]} ${className}`} 
      />
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src="/favicon.svg" 
        alt="snapdoor" 
        className={iconSizes[size]} 
      />
      <span className={`font-bold text-primary ${textSizes[size]}`}>
        snapdoor
      </span>
    </div>
  );
}
