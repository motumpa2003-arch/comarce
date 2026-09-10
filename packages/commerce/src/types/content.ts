import type { ID, ISODate, SEORecord } from "./primitives";

/* ------------------------------ Theming ----------------------------- */

/**
 * A theme is pure data. The storefront renders it by projecting these
 * tokens into CSS custom properties, so a merchant can restyle the whole
 * shop without a redeploy and without touching component code.
 */
export interface ThemeColors {
  /** Deep neutral used for editorial/dark sections, header and footer. */
  obsidian: string;
  /** Primary brand colour: CTAs, active states, links. */
  primary: string;
  primaryHover: string;
  /** Metallic/accent colour for premium detailing and badges. */
  accent: string;
  /** Light page ground for product-forward sections. */
  ivory: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  text: string;
  textMuted: string;
  textInverse: string;
  success: string;
  warning: string;
  danger: string;
  sale: string;
}

export interface ThemeTypography {
  displayFamily: string;
  bodyFamily: string;
  displayWeight: number;
  displayTracking: string;
  displayTransform: "none" | "uppercase";
  baseSize: string;
}

export interface ThemeShape {
  radiusSm: string;
  radiusMd: string;
  radiusLg: string;
  buttonRadius: string;
  cardRadius: string;
  borderWidth: string;
}

export interface ThemeLayout {
  containerWidth: string;
  sectionSpacing: string;
  productGridColumns: 3 | 4 | 5;
  productCardStyle: "editorial" | "classic" | "compact" | "overlay";
  headerStyle: "transparent" | "solid" | "bordered";
  headerSticky: boolean;
  footerStyle: "editorial" | "minimal" | "columns";
  announcementBar: boolean;
}

export interface Theme {
  id: ID;
  storeId: ID;
  name: string;
  preset: string;
  description: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  shape: ThemeShape;
  layout: ThemeLayout;
  updatedAt: ISODate;
}

/* --------------------------- Page builder --------------------------- */

export type SectionType =
  | "hero"
  | "video_hero"
  | "promo_strip"
  | "category_grid"
  | "product_grid"
  | "carousel"
  | "collection_feature"
  | "editorial_split"
  | "lookbook"
  | "testimonial"
  | "review_wall"
  | "faq"
  | "newsletter"
  | "countdown"
  | "brand_story"
  | "trust_bar"
  | "logo_cloud"
  | "recently_viewed"
  | "recommendations"
  | "rich_text"
  | "image_mosaic"
  | "custom_html";

export interface PageSection {
  id: ID;
  type: SectionType;
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  body?: string;
  image?: string;
  images?: string[];
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  /** Data binding: which slice of the catalogue this section renders. */
  source?: {
    kind: "collection" | "category" | "brand" | "manual" | "flag" | "recommendation";
    value?: string;
    limit?: number;
  };
  settings?: Record<string, string | number | boolean>;
  visible: boolean;
  position: number;
}

export interface StorePage {
  id: ID;
  storeId: ID;
  title: string;
  slug: string;
  type: "home" | "landing" | "static" | "policy";
  sections: PageSection[];
  status: "published" | "draft";
  seo: SEORecord;
  updatedAt: ISODate;
}

/* ---------------------------- Navigation ---------------------------- */

export interface NavigationItem {
  id: ID;
  label: string;
  href: string;
  description?: string;
  image?: string;
  badge?: string;
  children?: NavigationItem[];
}

export interface NavigationMenu {
  id: ID;
  storeId: ID;
  handle: "main" | "footer_shop" | "footer_support" | "footer_company" | "mobile";
  name: string;
  items: NavigationItem[];
}

/* ------------------------------- Blog ------------------------------- */

export interface BlogPost {
  id: ID;
  storeId: ID;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover: string;
  category: string;
  tags: string[];
  authorName: string;
  authorAvatar: string;
  readMinutes: number;
  status: "published" | "draft";
  publishedAt: ISODate;
  seo: SEORecord;
}

export interface FAQItem {
  id: ID;
  storeId: ID;
  question: string;
  answer: string;
  category: string;
  position: number;
}
