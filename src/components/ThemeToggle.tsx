import { useCallback, useEffect, useRef, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "#/components/ui/button";

type ThemeMode = "light" | "dark" | "auto";

function getInitialMode(): ThemeMode {
  if (typeof window === "undefined") return "auto";
  const stored = window.localStorage.getItem("theme");
  if (stored === "light" || stored === "dark" || stored === "auto")
    return stored;
  return "auto";
}

function applyThemeMode(mode: ThemeMode, win: Window = window) {
  const prefersDark = win.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = mode === "auto" ? (prefersDark ? "dark" : "light") : mode;
  const root = win.document.documentElement;

  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.setAttribute("data-theme", resolved);
  root.style.colorScheme = resolved;
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("auto");
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const initialMode = getInitialMode();
    setMode(initialMode);
    applyThemeMode(initialMode);
  }, []);

  // Listen for system preference changes when in auto mode
  useEffect(() => {
    if (mode !== "auto") return;
    const win = ref.current?.ownerDocument.defaultView ?? window;
    const media = win.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyThemeMode("auto", win);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [mode]);

  // For button click — three-way cycle: light → dark → auto
  const cycleMode = useCallback(() => {
    const win = ref.current?.ownerDocument.defaultView ?? window;
    setMode((prev) => {
      const next: ThemeMode =
        prev === "light" ? "dark" : prev === "dark" ? "auto" : "light";
      applyThemeMode(next, win);
      win.localStorage.setItem("theme", next);
      return next;
    });
  }, []);

  // For Ctrl+D — binary toggle: resolves auto first, then flips
  const toggleDark = useCallback(() => {
    const win = ref.current?.ownerDocument.defaultView ?? window;
    setMode((prev) => {
      const prefersDark = win.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      const resolved =
        prev === "auto" ? (prefersDark ? "dark" : "light") : prev;
      const next: ThemeMode = resolved === "dark" ? "light" : "dark";
      applyThemeMode(next, win);
      win.localStorage.setItem("theme", next);
      return next;
    });
  }, []);

  useEffect(() => {
    const win = ref.current?.ownerDocument.defaultView ?? window;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "d") {
        e.preventDefault();
        toggleDark();
      }
    };
    win.addEventListener("keydown", onKeyDown);
    return () => win.removeEventListener("keydown", onKeyDown);
  }, [toggleDark]);

  const label =
    mode === "auto"
      ? "Theme: auto (system). Click to switch to light."
      : `Theme: ${mode}. Click to switch.`;

  const Icon = mode === "light" ? Sun : mode === "dark" ? Moon : Monitor;

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      onClick={cycleMode}
      aria-label={label}
      title={label}
    >
      <Icon className="h-5 w-5" />
    </Button>
  );
}
