import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type StatTone = "emerald" | "red" | "blue" | "amber" | "neutral";

const toneStyles: Record<StatTone, { bg: string; fg: string }> = {
  emerald: { bg: "bg-[#E1F5EE]", fg: "text-[#0F6E56]" },
  red: { bg: "bg-[#FDECEC]", fg: "text-[#B3261E]" },
  blue: { bg: "bg-[#E6EFFE]", fg: "text-[#1E4FC4]" },
  amber: { bg: "bg-[#FDF1DC]", fg: "text-[#A06410]" },
  neutral: { bg: "bg-[#F0F0F0]", fg: "text-[#4A4A4A]" },
};

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  tone?: StatTone;
}

export function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  tone = "neutral",
}: StatCardProps) {
  const styles = toneStyles[tone];
  return (
    <Card className="gap-0 py-4">
      <div className="px-4">
        <div
          className={cn(
            "flex items-center justify-center rounded-full",
            styles.bg
          )}
          style={{ width: 36, height: 36 }}
        >
          <Icon className={cn("h-4 w-4", styles.fg)} strokeWidth={2} />
        </div>
      </div>
      <div className="mt-3 px-4">
        <p
          className="text-secondary"
          style={{ fontSize: 12, fontWeight: 400 }}
        >
          {label}
        </p>
        <p
          className="tabular-nums mt-0.5"
          style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.2 }}
        >
          {value}
        </p>
        {subtitle ? (
          <p
            className="text-tertiary mt-1"
            style={{ fontSize: 11, fontWeight: 400 }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
