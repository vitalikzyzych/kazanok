import { Button } from "primereact/button";

import { THEME_LABELS, type ThemeMode, useTheme } from "@/hooks";
import { FluentIcon, type IconName } from "@/ui";

const ICONS: Record<ThemeMode, IconName> = {
  system: "DarkTheme",
  light: "WeatherSunny",
  dark: "WeatherMoon",
};

/** System, light, dark, in turn. */
const ThemeButton = () => {
  const [mode, cycle] = useTheme();
  return (
    <Button
      rounded
      text
      icon={<FluentIcon name={ICONS[mode]} />}
      onClick={cycle}
      aria-label={THEME_LABELS[mode]}
      title={THEME_LABELS[mode]}
      className="btn-icon"
    />
  );
};

export default ThemeButton;
