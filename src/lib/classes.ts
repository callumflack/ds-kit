import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Keep in sync with `src/styles/tokens-semantic.css` + `src/styles/tailwind-aliases.css`.
// tailwind-merge v3 already treats color names broadly and t-shirt text/radius scales (xs…9xl);
// extend only custom semantic text sizes, radii, and spacing keys not covered by defaults.
const customTwMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "pill",
        "fine",
        "compact",
        "small",
        "body",
        "button",
        "large",
        "xlarge",
        "heading",
        "subtitle",
        "title",
        "display",
        "hero",
      ],
      radius: ["soft", "button", "card", "squish", "dialog"],
      spacing: [
        "em",
        "lh",
        "inset",
        "nav",
        "header",
        "tab",
        "banner",
        "bar",
        "button",
        "button-xs",
        "frame",
        "container",
        "prose",
        "panel",
        "gap",
        "small",
        "minor",
        "mid",
        "major",
        "super",
        "w4",
        "w5",
        "w6",
        "w8",
        "w10",
        "w12",
        "w16",
        "w18",
        "w20",
        "w24",
        "w28",
        "w32",
        "w36",
        "w42",
        "w48",
        "w64",
        "w72",
        "w96",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs));
}
