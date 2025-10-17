import { Building2 } from "lucide-react";

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

  // Quando o usuário adicionar logo.png no public/, descomente a linha abaixo e remova o fallback
  // return <img src="/logo.png" alt="SnapDoor" className={`${sizeClasses[size]} ${className}`} />;

  // Fallback com logo SVG personalizado
  if (variant === "icon-only") {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg ${className}`}>
        <Building2 className={`${iconSizes[size]} text-white`} />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-1.5">
        <Building2 className={`${iconSizes[size]} text-white`} />
      </div>
      <span className={`font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${textSizes[size]}`}>
        SnapDoor
      </span>
    </div>
  );
}
