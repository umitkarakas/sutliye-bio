import type { CSSProperties } from "react";
import type { BrandTheme } from "@/lib/types";

type CssVariableStyle = CSSProperties & Record<`--${string}`, string>;

const LEGACY_BRAND_THEME: BrandTheme = {
  primaryColor: "#b5532f",
  secondaryColor: "#8e4026",
  backgroundColor: "#f5ecdf"
};

export const DEFAULT_BRAND_THEME: BrandTheme = {
  primaryColor: "#ba0814",
  secondaryColor: "#dc6f79",
  backgroundColor: "#efb7bd"
};

export function normalizeHexColor(value: string | null | undefined, fallback: string) {
  const trimmedValue = String(value ?? "").trim();

  if (!trimmedValue) {
    return fallback;
  }

  const normalizedValue = trimmedValue.startsWith("#") ? trimmedValue : `#${trimmedValue}`;

  if (!/^#([0-9a-fA-F]{6})$/.test(normalizedValue)) {
    return fallback;
  }

  return normalizedValue.toLowerCase();
}

export function createBrandTheme(theme?: Partial<BrandTheme> | null): BrandTheme {
  const resolvedTheme = {
    primaryColor: normalizeHexColor(theme?.primaryColor, DEFAULT_BRAND_THEME.primaryColor),
    secondaryColor: normalizeHexColor(theme?.secondaryColor, DEFAULT_BRAND_THEME.secondaryColor),
    backgroundColor: normalizeHexColor(theme?.backgroundColor, DEFAULT_BRAND_THEME.backgroundColor)
  };

  const usesLegacyDefaults =
    (resolvedTheme.primaryColor === LEGACY_BRAND_THEME.primaryColor ||
      resolvedTheme.primaryColor === "#b55330") &&
    resolvedTheme.secondaryColor === LEGACY_BRAND_THEME.secondaryColor &&
    resolvedTheme.backgroundColor === LEGACY_BRAND_THEME.backgroundColor;

  if (usesLegacyDefaults) {
    return DEFAULT_BRAND_THEME;
  }

  return resolvedTheme;
}

export function brandThemeMatchesDefault(theme?: Partial<BrandTheme> | null) {
  const resolvedTheme = createBrandTheme(theme);

  return (
    resolvedTheme.primaryColor === DEFAULT_BRAND_THEME.primaryColor &&
    resolvedTheme.secondaryColor === DEFAULT_BRAND_THEME.secondaryColor &&
    resolvedTheme.backgroundColor === DEFAULT_BRAND_THEME.backgroundColor
  );
}

export function brandThemeToCssVariables(theme?: Partial<BrandTheme> | null): CSSProperties {
  const resolvedTheme = createBrandTheme(theme);

  return {
    "--brand-primary": resolvedTheme.primaryColor,
    "--brand-secondary": resolvedTheme.secondaryColor,
    "--brand-background": resolvedTheme.backgroundColor
  } as CssVariableStyle;
}
