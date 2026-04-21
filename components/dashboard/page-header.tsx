import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  action?: ReactNode;
}

export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1
        className="text-[20px] tracking-tight"
        style={{ fontWeight: 500 }}
      >
        {title}
      </h1>
      {action ? <div className="flex items-center gap-2">{action}</div> : null}
    </div>
  );
}
