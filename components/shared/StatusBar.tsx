import { StatusBar as RNStatusBar } from "react-native";
import { Colors } from "../../constants/colors";

type Variant = "dark" | "light";

interface AppStatusBarProps {
  variant: Variant;
}

export function AppStatusBar({ variant }: AppStatusBarProps) {
  return (
    <RNStatusBar
      translucent
      backgroundColor={
        variant === "dark" ? Colors.primaryDark : Colors.background
      }
      barStyle={variant === "dark" ? "light-content" : "dark-content"}
    />
  );
}
