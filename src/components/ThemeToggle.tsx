import { useCallback } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "#/components/ui/button";
import { useTheme } from "#/components/theme-provider";
import { useHaptics } from "#/hooks/use-haptics";
import type { Theme } from "#/lib/theme";

function applyThemeMode(theme: Theme, win: Window = window) {
  const root = win.document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;
}

function applyThemeWithTransition(theme: Theme, win: Window = window) {
  if (!win.document.startViewTransition) {
    applyThemeMode(theme, win);
    return;
  }
  win.document.startViewTransition(() => applyThemeMode(theme, win));
}

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { haptic } = useHaptics();

  const toggleTheme = useCallback(() => {
    const next = theme === "light" ? "dark" : "light";
    applyThemeWithTransition(next);
    setTheme(next);
    haptic("light");
  }, [theme, setTheme, haptic]);

  const label =
    theme === "dark" ? "Switch to light theme" : "Switch to dark theme";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}
