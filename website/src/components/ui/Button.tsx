import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "ghost" | "ink" | "flame" | "line";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 whitespace-nowrap select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  ghost: "bg-transparent text-ink-700 hover:text-ink-900 px-[1.1rem] py-[0.65rem] text-[0.92rem]",
  ink: "bg-ink-900 text-paper hover:bg-ink-700 active:translate-y-[1px] px-[1.3rem] py-3 text-[0.92rem]",
  flame:
    "bg-flame text-white hover:bg-flame-dark hover:-translate-y-[1px] active:translate-y-0 shadow-[0_1px_3px_rgba(28,25,23,0.05),0_12px_32px_-12px_rgba(28,25,23,0.10)] px-6 py-[0.95rem] text-base",
  line: "bg-transparent text-ink-900 border-[1.5px] border-ink-900 hover:bg-ink-900 hover:text-paper px-6 py-[0.95rem] text-base",
};

type ButtonOwnProps = {
  variant?: Variant;
  block?: boolean;
  children: ReactNode;
  className?: string;
};

type ButtonAsButton = ButtonOwnProps &
  Omit<ComponentProps<"button">, "className" | "children"> & {
    href?: undefined;
  };

type ButtonAsLink = ButtonOwnProps &
  Omit<ComponentProps<typeof Link>, "className" | "children" | "href"> & {
    href: string;
  };

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const {
    variant = "ink",
    block = false,
    children,
    className,
    ...rest
  } = props as ButtonOwnProps & { href?: string };
  const classes = cn(base, variants[variant], block && "w-full", className);

  if ("href" in rest && rest.href) {
    return (
      <Link {...(rest as ComponentProps<typeof Link>)} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button
      {...(rest as ComponentProps<"button">)}
      className={classes}
    >
      {children}
    </button>
  );
}
