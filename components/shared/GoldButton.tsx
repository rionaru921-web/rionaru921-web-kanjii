import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface GoldButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

const sizeClasses: Record<NonNullable<GoldButtonProps["size"]>, string> = {
  sm: "text-sm py-2 px-4 gap-1.5",
  md: "text-sm py-3 px-6 gap-2",
  lg: "text-base py-4 px-8 gap-2.5",
};

const variantClasses: Record<NonNullable<GoldButtonProps["variant"]>, string> = {
  solid:
    "bg-gold-gradient text-white font-bold shadow-gold hover:brightness-110 hover:shadow-gold-lg",
  outline:
    "border border-gold/40 text-ink hover:border-gold hover:bg-gold/5",
  ghost: "text-ink-secondary hover:text-gold",
};

export default function GoldButton({
  children,
  href,
  onClick,
  type = "button",
  variant = "solid",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  fullWidth = false,
  disabled = false,
  className = "",
}: GoldButtonProps) {
  const classes = `inline-flex items-center justify-center rounded-full transition-all duration-200 ${sizeClasses[size]} ${variantClasses[variant]} ${
    fullWidth ? "w-full" : ""
  } ${disabled ? "opacity-40 pointer-events-none" : ""} ${className}`;

  const content = (
    <>
      {Icon && iconPosition === "left" && <Icon size={size === "lg" ? 20 : 16} />}
      {children}
      {Icon && iconPosition === "right" && <Icon size={size === "lg" ? 20 : 16} />}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {content}
    </button>
  );
}
