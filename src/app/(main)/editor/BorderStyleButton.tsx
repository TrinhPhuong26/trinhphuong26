import { Button } from "@/components/ui/button";
import { Circle, Square, Squircle } from "lucide-react";

export const BorderStyles = {
  SQUARE: "square",
  CIRCLE: "circle",
  SQUIRCLE: "squircle",
};

export type BorderStyle = "square" | "circle" | "squircle";

const borderStyles: BorderStyle[] = ["square", "circle", "squircle"];

interface BorderStyleButtonProps {
  borderStyle: BorderStyle | undefined;
  onChange: (style: BorderStyle) => void;
}

export default function BorderStyleButton({
  borderStyle,
  onChange,
}: BorderStyleButtonProps) {
  function handleClick() {
    const currentIndex = borderStyle ? borderStyles.indexOf(borderStyle) : 0;
    const nextIndex = (currentIndex + 1) % borderStyles.length;
    onChange(borderStyles[nextIndex]);
  }

  const Icon =
    borderStyle === "square"
      ? Square
      : borderStyle === "circle"
        ? Circle
        : Squircle;

  return (
    <Button
      variant="outline"
      size="icon"
      title="Change border style"
      onClick={handleClick}
    >
      <Icon className="size-5" />
    </Button>
  );
}
