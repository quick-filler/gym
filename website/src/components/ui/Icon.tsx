import { cn } from "@/lib/utils";

export type IconName =
  | "arrow-right"
  | "arrow-left"
  | "arrow-up-right"
  | "check"
  | "x"
  | "plus"
  | "minus"
  | "search"
  | "bell"
  | "calendar"
  | "clock"
  | "users"
  | "user"
  | "money"
  | "credit"
  | "dumbbell"
  | "phone"
  | "chart"
  | "trending"
  | "pie"
  | "spark"
  | "shield"
  | "lock"
  | "mail"
  | "pin"
  | "zap"
  | "settings"
  | "grid"
  | "list"
  | "filter"
  | "download"
  | "upload"
  | "edit"
  | "trash"
  | "more"
  | "home"
  | "instagram"
  | "whatsapp"
  | "eye"
  | "eye-off"
  | "link"
  | "globe"
  | "palette";

type Size = "sm" | "md" | "lg" | "xl";

const sizeClass: Record<Size, string> = {
  sm: "icon",
  md: "icon",
  lg: "icon icon-lg",
  xl: "icon icon-xl",
};

export function Icon({
  name,
  size = "md",
  className,
  "aria-label": ariaLabel,
}: {
  name: IconName;
  size?: Size;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <svg
      className={cn(sizeClass[size], className)}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      <use href={`/icons.svg#i-${name}`} />
    </svg>
  );
}
