import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {
      // ignore write errors (private mode)
    }
  }, [dark]);

  useEffect(() => {
    try {
      const pref = localStorage.getItem("theme");
      if (pref === "dark") setDark(true);
    } catch {
      // ignore read errors (private mode)
    }
  }, []);

  return (
    <Button variant="outline" size="icon" aria-label="Toggle theme" onClick={() => setDark((v) => !v)}>
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
