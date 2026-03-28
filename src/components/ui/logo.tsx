import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export function Logo({ className, iconOnly = false }: LogoProps) {
  if (iconOnly) {
    return (
      <div className={cn("flex items-center", className)}>
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          aria-label="ESG ON"
        >
          {/* Play-triangle inside "O" */}
          <circle cx="12" cy="12" r="10" stroke="hsl(var(--green-400))" strokeWidth="2.5" fill="none" />
          <polygon points="10,7 18,12 10,17" fill="hsl(var(--green-400))" />
        </svg>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      <span className="text-xl font-extrabold tracking-tight text-foreground">
        ESG
      </span>
      <svg
        viewBox="0 0 70 32"
        className="h-7 w-auto"
        fill="none"
        aria-label="ON"
      >
        {/* "O" with play triangle */}
        <circle cx="14" cy="16" r="11.5" stroke="hsl(var(--green-400))" strokeWidth="3" fill="none" />
        <polygon points="11,9 22,16 11,23" fill="hsl(var(--green-400))" />
        {/* "N" */}
        <text
          x="32"
          y="23"
          className="fill-[hsl(var(--green-400))]"
          style={{ fontSize: "24px", fontWeight: 800, fontFamily: "var(--font-pretendard), system-ui, sans-serif" }}
        >
          N
        </text>
      </svg>
    </div>
  );
}
