export const themeIds = [
  "obsidian",
  "turquoise-tide",
  "cyber-neon",
  "aurora-glass",
  "minimal-studio",
  "atelier",
  "folio",
  "signal",
  "sunset-blaze",
  "ocean-depth",
  "royal-purple",
  "cherry-blossom",
  "bauhaus-pop",
  "forest-mist",
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
    id: "turquoise-tide",
    name: "Turquoise Tide",
    description:
      "Deep lagoon surfaces, crystalline turquoise light, and calm flowing depth.",
    mode: "dark",
    accent: "#2dd4bf",
    surface: "#08201e",
    personality: "Refreshing",
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
  {
    id: "atelier",
    name: "Atelier",
    description:
      "Warm crafted surfaces, archival neutrals, and considered typographic detail.",
    mode: "dark",
    accent: "#c4a574",
    surface: "#121110",
    personality: "Refined",
  },
  {
    id: "folio",
    name: "Folio",
    description:
      "Crisp editorial structure, generous margins, and confident teal accents.",
    mode: "light",
    accent: "#0f766e",
    surface: "#ffffff",
    personality: "Editorial",
  },
  {
    id: "signal",
    name: "Signal",
    description:
      "High-velocity contrast, luminous indicators, and responsive technical rhythm.",
    mode: "dark",
    accent: "#39ffb4",
    surface: "#0a1020",
    personality: "Kinetic",
  },
  {
    id: "sunset-blaze",
    name: "Sunset Blaze",
    description:
      "Molten amber highlights, dramatic depth, and heat-charged visual contrast.",
    mode: "dark",
    accent: "#f59e0b",
    surface: "#1a0f0a",
    personality: "Intense",
  },
  {
    id: "ocean-depth",
    name: "Ocean Depth",
    description:
      "Layered marine tones, radiant cyan, and spacious atmospheric depth.",
    mode: "dark",
    accent: "#22d3ee",
    surface: "#0a1628",
    personality: "Immersive",
  },
  {
    id: "royal-purple",
    name: "Royal Purple",
    description:
      "Velvet-dark surfaces, luminous violet, and polished ceremonial depth.",
    mode: "dark",
    accent: "#c084fc",
    surface: "#130d1f",
    personality: "Opulent",
  },
  {
    id: "cherry-blossom",
    name: "Cherry Blossom",
    description:
      "Delicate blush layers, precise rose accents, and calm open composition.",
    mode: "light",
    accent: "#e11d48",
    surface: "#fef7f7",
    personality: "Serene",
  },
  {
    id: "bauhaus-pop",
    name: "Bauhaus Pop",
    description:
      "Geometric clarity, primary-form energy, and playful modernist structure.",
    mode: "light",
    accent: "#e6392f",
    surface: "#fffdf3",
    personality: "Bold",
  },
  {
    id: "forest-mist",
    name: "Forest Mist",
    description:
      "Moss-lit depth, softened woodland layers, and grounded natural contrast.",
    mode: "dark",
    accent: "#bef264",
    surface: "#101a15",
    personality: "Organic",
  },
] as const;

export const defaultTheme: ThemeId = "turquoise-tide";
