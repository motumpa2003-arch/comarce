import type { Theme, ThemeColors, ThemeLayout, ThemeShape, ThemeTypography } from "../types/content";

/**
 * Theme presets. Every storefront surface reads colour, type and shape from
 * CSS custom properties, so switching a preset restyles the entire shop with
 * no component changes and no redeploy.
 */

export const OBSIDIAN_COLORS: ThemeColors = {
  obsidian: "#080908",
  primary: "#063F32",
  primaryHover: "#0A5A48",
  accent: "#C9A227",
  ivory: "#F4F0E7",
  surface: "#FFFFFF",
  surfaceMuted: "#FAF8F3",
  border: "#E4DFD3",
  text: "#12140F",
  textMuted: "#6E7268",
  textInverse: "#F4F0E7",
  success: "#1F7A5C",
  warning: "#B4791B",
  danger: "#A62B2B",
  sale: "#C2410C",
};

const BASE_TYPOGRAPHY: ThemeTypography = {
  displayFamily: "var(--stack-display)",
  bodyFamily: "var(--stack-body)",
  displayWeight: 400,
  displayTracking: "0.02em",
  displayTransform: "uppercase",
  baseSize: "15px",
};

const BASE_SHAPE: ThemeShape = {
  radiusSm: "2px",
  radiusMd: "4px",
  radiusLg: "8px",
  buttonRadius: "2px",
  cardRadius: "4px",
  borderWidth: "1px",
};

const BASE_LAYOUT: ThemeLayout = {
  containerWidth: "1400px",
  sectionSpacing: "96px",
  productGridColumns: 4,
  productCardStyle: "editorial",
  headerStyle: "solid",
  headerSticky: true,
  footerStyle: "editorial",
  announcementBar: true,
};

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  industries: string[];
  colors: ThemeColors;
  typography: ThemeTypography;
  shape: ThemeShape;
  layout: ThemeLayout;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "obsidian",
    name: "Obsidian",
    description: "Editorial black, emerald and gold. Luxury fashion and premium multi-category.",
    industries: ["fashion", "jewelry", "general"],
    colors: OBSIDIAN_COLORS,
    typography: BASE_TYPOGRAPHY,
    shape: BASE_SHAPE,
    layout: BASE_LAYOUT,
  },
  {
    id: "halo",
    name: "Halo",
    description: "Cool graphite and electric blue with tight grids. Built for electronics.",
    industries: ["electronics"],
    colors: {
      ...OBSIDIAN_COLORS,
      obsidian: "#0B1016",
      primary: "#12507E",
      primaryHover: "#186399",
      accent: "#4FA3E3",
      ivory: "#F3F5F8",
      surfaceMuted: "#F7F9FB",
      border: "#DCE3EB",
      text: "#0F1519",
      textMuted: "#63707C",
      sale: "#D14343",
    },
    typography: { ...BASE_TYPOGRAPHY, displayTransform: "none", displayWeight: 600, displayTracking: "-0.01em" },
    shape: { ...BASE_SHAPE, radiusSm: "6px", radiusMd: "10px", radiusLg: "16px", buttonRadius: "8px", cardRadius: "12px" },
    layout: { ...BASE_LAYOUT, productGridColumns: 4, productCardStyle: "classic", footerStyle: "columns" },
  },
  {
    id: "petal",
    name: "Petal",
    description: "Warm blush and plum with soft edges. Beauty, wellness and personal care.",
    industries: ["beauty"],
    colors: {
      ...OBSIDIAN_COLORS,
      obsidian: "#2A1620",
      primary: "#8C3A5C",
      primaryHover: "#A54670",
      accent: "#D9A15B",
      ivory: "#FBF3F1",
      surfaceMuted: "#FDF7F6",
      border: "#EEDCD9",
      text: "#241419",
      textMuted: "#7C6169",
      sale: "#C0446A",
    },
    typography: { ...BASE_TYPOGRAPHY, displayTransform: "none", displayTracking: "0.01em" },
    shape: { ...BASE_SHAPE, radiusSm: "8px", radiusMd: "14px", radiusLg: "24px", buttonRadius: "999px", cardRadius: "18px" },
    layout: { ...BASE_LAYOUT, productGridColumns: 4, productCardStyle: "classic" },
  },
  {
    id: "harvest",
    name: "Harvest",
    description: "Fresh green and cream, dense grids and fast scanning. Grocery and essentials.",
    industries: ["grocery", "pets"],
    colors: {
      ...OBSIDIAN_COLORS,
      obsidian: "#12261A",
      primary: "#2F7A44",
      primaryHover: "#38914F",
      accent: "#E0A82E",
      ivory: "#F5F7F0",
      surfaceMuted: "#F9FBF5",
      border: "#DDE5D3",
      text: "#14200F",
      textMuted: "#5F6B57",
      sale: "#D2691E",
    },
    typography: { ...BASE_TYPOGRAPHY, displayTransform: "none", displayWeight: 600 },
    shape: { ...BASE_SHAPE, radiusSm: "6px", radiusMd: "10px", radiusLg: "14px", buttonRadius: "6px", cardRadius: "10px" },
    layout: { ...BASE_LAYOUT, productGridColumns: 5, productCardStyle: "compact", sectionSpacing: "64px" },
  },
  {
    id: "atelier",
    name: "Atelier",
    description: "Warm clay, oak and stone. Furniture, home and considered living.",
    industries: ["home", "furniture"],
    colors: {
      ...OBSIDIAN_COLORS,
      obsidian: "#221D18",
      primary: "#6B4F33",
      primaryHover: "#836242",
      accent: "#C08B4E",
      ivory: "#F6F1E9",
      surfaceMuted: "#FAF6F0",
      border: "#E6DCCC",
      text: "#221C15",
      textMuted: "#77695A",
      sale: "#A8552B",
    },
    typography: BASE_TYPOGRAPHY,
    shape: { ...BASE_SHAPE, radiusSm: "3px", radiusMd: "6px", radiusLg: "10px", buttonRadius: "3px", cardRadius: "6px" },
    layout: { ...BASE_LAYOUT, productGridColumns: 3, productCardStyle: "editorial", sectionSpacing: "112px" },
  },
  {
    id: "velocity",
    name: "Velocity",
    description: "High-contrast ink and signal orange. Sports, outdoor and performance.",
    industries: ["sports"],
    colors: {
      ...OBSIDIAN_COLORS,
      obsidian: "#0D0D0D",
      primary: "#16302B",
      primaryHover: "#1F443C",
      accent: "#F26430",
      ivory: "#F2F2EF",
      surfaceMuted: "#F7F7F4",
      border: "#DFDFD8",
      text: "#101010",
      textMuted: "#6A6A63",
      sale: "#E23D28",
    },
    typography: { ...BASE_TYPOGRAPHY, displayWeight: 700, displayTracking: "0.04em" },
    shape: { ...BASE_SHAPE, radiusSm: "2px", radiusMd: "4px", radiusLg: "6px", buttonRadius: "2px", cardRadius: "2px" },
    layout: { ...BASE_LAYOUT, productGridColumns: 4, productCardStyle: "overlay" },
  },
];

export function getPreset(id: string): ThemePreset {
  return THEME_PRESETS.find((p) => p.id === id) ?? THEME_PRESETS[0]!;
}

export function presetForIndustry(industry: string): ThemePreset {
  return THEME_PRESETS.find((p) => p.industries.includes(industry)) ?? THEME_PRESETS[0]!;
}

/** Projects a theme into the CSS custom properties the storefront reads. */
export function themeToCssVars(theme: Pick<Theme, "colors" | "typography" | "shape" | "layout">): Record<string, string> {
  const { colors, typography, shape, layout } = theme;
  return {
    "--c-obsidian": colors.obsidian,
    "--c-primary": colors.primary,
    "--c-primary-hover": colors.primaryHover,
    "--c-accent": colors.accent,
    "--c-ivory": colors.ivory,
    "--c-surface": colors.surface,
    "--c-surface-muted": colors.surfaceMuted,
    "--c-border": colors.border,
    "--c-text": colors.text,
    "--c-text-muted": colors.textMuted,
    "--c-text-inverse": colors.textInverse,
    "--c-success": colors.success,
    "--c-warning": colors.warning,
    "--c-danger": colors.danger,
    "--c-sale": colors.sale,
    "--font-display-family": typography.displayFamily,
    "--font-body-family": typography.bodyFamily,
    "--font-display-weight": String(typography.displayWeight),
    "--font-display-tracking": typography.displayTracking,
    "--font-display-transform": typography.displayTransform,
    "--font-base-size": typography.baseSize,
    "--radius-sm": shape.radiusSm,
    "--radius-md": shape.radiusMd,
    "--radius-lg": shape.radiusLg,
    "--radius-button": shape.buttonRadius,
    "--radius-card": shape.cardRadius,
    "--border-width": shape.borderWidth,
    "--container-width": layout.containerWidth,
    "--section-spacing": layout.sectionSpacing,
  };
}

export function cssVarsToStyleString(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([key, value]) => `${key}:${value}`)
    .join(";");
}
