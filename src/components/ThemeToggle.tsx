import { useCallback } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "#/components/ui/button";
import { useTheme } from "#/components/theme-provider";
import { useWebHaptics } from "web-haptics/react";
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
  const { trigger: haptic } = useWebHaptics();

  const toggleTheme = useCallback(() => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    haptic("light");
    applyThemeWithTransition(next);
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
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  );
}
