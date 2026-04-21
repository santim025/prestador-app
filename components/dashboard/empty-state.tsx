import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <Card className="py-12">
      <div className="flex flex-col items-center justify-center text-center px-6">
        <div
          className="flex items-center justify-center rounded-full bg-[#F0F0F0]"
          style={{ width: 48, height: 48 }}
        >
          <Icon className="h-5 w-5 text-[#8A8A8A]" strokeWidth={1.75} />
        </div>
        <p
          className="mt-3"
          style={{ fontSize: 14, fontWeight: 500 }}
        >
          {title}
        </p>
        {description ? (
          <p
            className="text-secondary mt-1 max-w-xs"
            style={{ fontSize: 13, fontWeight: 400 }}
          >
            {description}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
