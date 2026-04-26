"use client";

import * as React from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const order = ["system", "light", "dark"] as const;
type Mode = (typeof order)[number];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const current: Mode = (theme as Mode) ?? "system";
  const next = (): Mode => {
    const i = order.indexOf(current);
    return order[(i + 1) % order.length];
  };

  const Icon = current === "light" ? Sun : current === "dark" ? Moon : Monitor;
  const label =
    current === "light" ? "浅色" : current === "dark" ? "深色" : "跟随系统";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`切换主题（当前：${label}）`}
      title={`主题：${label}`}
      onClick={() => setTheme(next())}
      suppressHydrationWarning
    >
      {mounted ? <Icon /> : <Monitor />}
    </Button>
  );
}
