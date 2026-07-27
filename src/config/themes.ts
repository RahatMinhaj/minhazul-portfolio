export const themeIds = [
  "obsidian",
  "cyber-neon",
  "aurora-glass",
  "minimal-studio",
] as const;

export type ThemeId = (typeof themeIds)[number];

export type ThemeDefinition = {
  id: ThemeId;
  name: string;
  description: string;
  mode: "dark" | "light";
  accent: string;
  surface: string;
  personality: string;
};

export const themeDefinitions: readonly ThemeDefinition[] = [
  {
    id: "obsidian",
    name: "Obsidian Developer",
    description: "Graphite surfaces, precise grids, and restrained green glow.",
    mode: "dark",
    accent: "#58e6b0",
    surface: "#0d1211",
    personality: "Measured",
  },
  {
    id: "cyber-neon",
    name: "Cyber Neon",
    description: "Circuit-like structure with electric cyan and violet energy.",
    mode: "dark",
    accent: "#27e7ff",
    surface: "#0d1020",
    personality: "Kinetic",
  },
  {
    id: "aurora-glass",
    name: "Aurora Glass",
    description: "Soft spectral color, luminous depth, and frosted surfaces.",
    mode: "dark",
    accent: "#a7f3d0",
    surface: "#182137",
    personality: "Fluid",
  },
  {
    id: "minimal-studio",
    name: "Minimal Studio",
    description: "Editorial typography, clean spacing, and quiet contrast.",
    mode: "light",
    accent: "#14532d",
    surface: "#ffffff",
    personality: "Quiet",
  },
] as const;

export const defaultTheme: ThemeId = "obsidian";
