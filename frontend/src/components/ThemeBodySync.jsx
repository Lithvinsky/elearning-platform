import { useEffect } from "react";
import { useSelector } from "react-redux";

const THEME_COLOR_LIGHT = "#f8fafc";
const THEME_COLOR_DARK = "#0f172a";

/** Keeps body class, color-scheme, and theme-color in sync with Redux on every route (including /login). */
export function ThemeBodySync() {
  const theme = useSelector((state) => state.auth.theme);

  useEffect(() => {
    const isDark = theme === "dark";
    document.body.classList.toggle("theme-dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";

    const meta = document.getElementById("theme-color-meta");
    if (meta) {
      meta.setAttribute("content", isDark ? THEME_COLOR_DARK : THEME_COLOR_LIGHT);
    }
  }, [theme]);

  return null;
}
