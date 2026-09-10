import type { Brand, Category, Collection, Industry } from "@obsidian/commerce";
import { IMAGE_POOLS, EDITORIAL, img } from "../images";
import { Rng, slugify } from "../rng";
import type { ImagePoolKey } from "../images";

export interface CategoryBlueprint {
  name: string;
  industry: Industry;
  icon: string;
  pool: ImagePoolKey;
  children: { name: string; pool: ImagePoolKey }[];
}

export const CATEGORY_TREE: CategoryBlueprint[] = [
  {
    name: "Fashion & Apparel",
    industry: "fashion",
    icon: "shirt",
    pool: "jacket",
    children: [
      { name: "T-Shirts & Tops", pool: "tshirt" },
      { name: "Shirts", pool: "shirt" },
      { name: "Jackets & Outerwear", pool: "jacket" },
      { name: "Trousers & Denim", pool: "trousers" },
      { name: "Footwear", pool: "shoes" },
      { name: "Bags & Backpacks", pool: "bag" },
      { name: "Eyewear", pool: "eyewear" },
    ],
  },
  {
    name: "Electronics & Gadgets",
    industry: "electronics",
    icon: "cpu",
    pool: "laptop",
    children: [
      { name: "Mobile Phones", pool: "phone" },
      { name: "Laptops & Computers", pool: "laptop" },
      { name: "Headphones", pool: "headphones" },
      { name: "True Wireless Earbuds", pool: "earbuds" },
      { name: "Smart Watches", pool: "smartwatch" },
      { name: "Speakers & Audio", pool: "speaker" },
      { name: "Cameras", pool: "camera" },
      { name: "Televisions", pool: "television" },
    ],
  },
  {
    name: "Home & Living",
    industry: "home",
    icon: "lamp",
    pool: "decor",
    children: [
      { name: "Home Decor", pool: "decor" },
      { name: "Lighting", pool: "lighting" },
      { name: "Candles & Fragrance", pool: "candle" },
      { name: "Kitchen Appliances", pool: "appliance" },
    ],
  },
  {
    name: "Beauty & Personal Care",
    industry: "beauty",
    icon: "sparkles",
    pool: "skincare",
    children: [
      { name: "Skincare", pool: "skincare" },
      { name: "Fragrance", pool: "fragrance" },
      { name: "Makeup", pool: "makeup" },
    ],
  },
  {
    name: "Furniture",
    industry: "furniture",
    icon: "armchair",
    pool: "sofa",
    children: [
      { name: "Seating", pool: "seating" },
      { name: "Sofas & Lounge", pool: "sofa" },
      { name: "Study & Office", pool: "seating" },
    ],
  },
  {
    name: "Sports & Fitness",
    industry: "sports",
    icon: "dumbbell",
    pool: "fitness",
    children: [
      { name: "Training Gear", pool: "fitness" },
      { name: "Running", pool: "shoes" },
      { name: "Yoga & Recovery", pool: "fitness" },
      { name: "Outdoor & Hiking", pool: "bag" },
    ],
  },
  {
    name: "Grocery & Essentials",
    industry: "grocery",
    icon: "shopping-basket",
    pool: "coffee",
    children: [
      { name: "Coffee & Tea", pool: "coffee" },
      { name: "Fresh Produce", pool: "produce" },
      { name: "Pantry Staples", pool: "produce" },
    ],
  },
  {
    name: "Jewelry & Watches",
    industry: "jewelry",
    icon: "gem",
    pool: "jewelry",
    children: [
      { name: "Fine Jewellery", pool: "jewelry" },
      { name: "Watches", pool: "watch" },
    ],
  },
  {
    name: "Books & Media",
    industry: "books",
    icon: "book-open",
    pool: "books",
    children: [
      { name: "Design & Culture", pool: "books" },
      { name: "Business & Growth", pool: "books" },
    ],
  },
  {
    name: "Pet Supplies",
    industry: "pets",
    icon: "paw-print",
    pool: "pets",
    children: [
      { name: "Dog Essentials", pool: "pets" },
      { name: "Cat Essentials", pool: "pets" },
    ],
  },
];

export function buildCategories(storeId: string, industries: Industry[] | "all"): Category[] {
  const rng = new Rng(`${storeId}:categories`);
  const tree =
    industries === "all"
      ? CATEGORY_TREE
      : CATEGORY_TREE.filter((c) => industries.includes(c.industry));

  const categories: Category[] = [];
  let position = 0;

  for (const node of tree) {
    const parentId = `cat_${storeId}_${slugify(node.name)}`;
    const parent: Category = {
      id: parentId,
      storeId,
      name: node.name,
      slug: slugify(node.name),
      description: `Explore ${node.name.toLowerCase()} curated for a better everyday.`,
      parentId: null,
      path: [parentId],
      level: 0,
      image: img(rng.pick(IMAGE_POOLS[node.pool]), 900, 1100),
      icon: node.icon,
      industry: node.industry,
      productCount: 0,
      featured: true,
      position: position++,
      seo: {
        title: `${node.name} — shop online`,
        description: `Shop ${node.name.toLowerCase()} from trusted brands with free delivery and easy returns.`,
      },
    };
    categories.push(parent);

    for (const child of node.children) {
      const childId = `cat_${storeId}_${slugify(child.name)}`;
      categories.push({
        id: childId,
        storeId,
        name: child.name,
        slug: slugify(child.name),
        description: `${child.name} selected for quality, fit and finish.`,
        parentId,
        path: [parentId, childId],
        level: 1,
        image: img(rng.pick(IMAGE_POOLS[child.pool]), 700, 700),
        industry: node.industry,
        productCount: 0,
        featured: false,
        position: position++,
        seo: {
          title: `${child.name} — ${node.name}`,
          description: `Browse ${child.name.toLowerCase()} with verified reviews and authentic products.`,
        },
      });
    }
  }
  return categories;
}

/* ------------------------------- Brands ----------------------------- */

interface BrandBlueprint {
  name: string;
  origin: string;
  industries: Industry[];
  description: string;
}

export const BRAND_BLUEPRINTS: BrandBlueprint[] = [
  { name: "Nexora", origin: "Bengaluru, India", industries: ["electronics"], description: "Precision consumer technology built around long battery life and quiet design." },
  { name: "Velmont", origin: "Milan, Italy", industries: ["fashion"], description: "Tailored essentials cut from mills that have run for four generations." },
  { name: "Auric", origin: "Jaipur, India", industries: ["jewelry"], description: "Hallmarked fine jewellery, hand-finished in small batches." },
  { name: "Terralux", origin: "Copenhagen, Denmark", industries: ["home", "furniture"], description: "Warm minimal lighting and objects for considered interiors." },
  { name: "Fyn", origin: "Amsterdam, Netherlands", industries: ["furniture"], description: "Flat-pack furniture engineered to be repaired, not replaced." },
  { name: "Lumière", origin: "Paris, France", industries: ["beauty"], description: "Dermatologist-tested skincare with short, legible ingredient lists." },
  { name: "Stryde", origin: "Portland, USA", industries: ["sports"], description: "Performance footwear and kit tested by trail and track athletes." },
  { name: "Haven", origin: "Kochi, India", industries: ["home", "grocery"], description: "Everyday home and pantry goods sourced from small producers." },
  { name: "Northbound", origin: "Reykjavík, Iceland", industries: ["fashion", "sports"], description: "Weatherproof layers for cities that get cold and stay wet." },
  { name: "Kanto", origin: "Osaka, Japan", industries: ["electronics"], description: "Audio equipment tuned for reference-flat listening." },
  { name: "Solene", origin: "Barcelona, Spain", industries: ["beauty", "fashion"], description: "Fragrance and accessories built around Mediterranean botanicals." },
  { name: "Ferro", origin: "Turin, Italy", industries: ["furniture", "home"], description: "Steel and stone furniture with visible, honest joinery." },
  { name: "Bloomkraft", origin: "Pune, India", industries: ["home", "beauty"], description: "Small-batch candles, oils and home fragrance." },
  { name: "Grainhouse", origin: "Coorg, India", industries: ["grocery"], description: "Single-estate coffee, spices and pantry staples." },
  { name: "Pace & Co.", origin: "Manchester, UK", industries: ["sports", "fashion"], description: "Training essentials that survive four sessions a week." },
  { name: "Orinoco", origin: "Bogotá, Colombia", industries: ["grocery"], description: "Direct-trade coffee and cacao from smallholder farms." },
  { name: "Meridian", origin: "Geneva, Switzerland", industries: ["jewelry"], description: "Mechanical watches with serviceable in-house movements." },
  { name: "Papermill", origin: "Kolkata, India", industries: ["books"], description: "Independent publishing house for design, culture and long-form reporting." },
  { name: "Woolf & Bark", origin: "Melbourne, Australia", industries: ["pets"], description: "Veterinary-formulated pet nutrition and durable gear." },
  { name: "Atlas Optics", origin: "Seoul, South Korea", industries: ["electronics", "fashion"], description: "Optics and eyewear with obsessive coating engineering." },
  { name: "Corda", origin: "Lisbon, Portugal", industries: ["fashion"], description: "Woven bags and leather goods from a family atelier." },
  { name: "Verity", origin: "Auckland, New Zealand", industries: ["beauty", "grocery"], description: "Clean-label wellness with full supply-chain disclosure." },
  { name: "Ironwood", origin: "Dehradun, India", industries: ["furniture", "sports"], description: "Solid timber pieces and gym equipment built to outlast trends." },
  { name: "Lumen Labs", origin: "Tel Aviv, Israel", industries: ["electronics", "beauty"], description: "Device-led skincare and diagnostics." },
  { name: "Saga", origin: "Oslo, Norway", industries: ["home", "books"], description: "Print, textiles and objects rooted in Nordic craft." },
];

export function buildBrands(storeId: string, industries: Industry[] | "all"): Brand[] {
  const rng = new Rng(`${storeId}:brands`);
  const pool =
    industries === "all"
      ? BRAND_BLUEPRINTS
      : BRAND_BLUEPRINTS.filter((b) => b.industries.some((i) => industries.includes(i)));

  return pool.map((blueprint, index) => ({
    id: `brand_${storeId}_${slugify(blueprint.name)}`,
    storeId,
    name: blueprint.name,
    slug: slugify(blueprint.name),
    logo: img(rng.pick(IMAGE_POOLS.decor), 200, 200),
    cover: img(rng.pick([EDITORIAL.heroStore, EDITORIAL.heroFashion, EDITORIAL.interiorStyled]), 1600, 700),
    description: blueprint.description,
    origin: blueprint.origin,
    industries: blueprint.industries,
    productCount: 0,
    featured: index < 8,
    rating: rng.float(4.1, 4.9, 1),
  }));
}

/* ----------------------------- Collections -------------------------- */

interface CollectionBlueprint {
  name: string;
  headline: string;
  description: string;
  image: string;
  featured: boolean;
}

export const COLLECTION_BLUEPRINTS: CollectionBlueprint[] = [
  { name: "The Autumn Edit", headline: "Layers that carry the season", description: "Warm neutrals, structured outerwear and the accessories that finish them.", image: EDITORIAL.heroFashion, featured: true },
  { name: "New Arrivals", headline: "Fresh finds, bigger possibilities", description: "Everything that landed in the last thirty days, across every aisle.", image: EDITORIAL.heroShopping, featured: true },
  { name: "Bestsellers", headline: "What everyone is buying", description: "The pieces our customers keep coming back for.", image: EDITORIAL.heroStore, featured: true },
  { name: "Under ₹2,000", headline: "Small spend, real upgrade", description: "Considered picks that stay under two thousand rupees.", image: EDITORIAL.heroStreet, featured: true },
  { name: "Work & Productivity", headline: "Gear for what's next", description: "Desk, device and travel essentials for people who ship.", image: EDITORIAL.deskTech, featured: true },
  { name: "Weekend & Adventure", headline: "Explore more", description: "Packs, layers and tools for two days away from a screen.", image: EDITORIAL.outdoorHiker, featured: true },
  { name: "Home Upgrade", headline: "Spaces that inspire", description: "Furniture, lighting and objects that change how a room feels.", image: EDITORIAL.interiorRoom, featured: true },
  { name: "Wellness & Beauty", headline: "Look good. Feel better.", description: "Skincare, fragrance and rituals worth keeping.", image: EDITORIAL.heroWoman, featured: true },
  { name: "Tech Lifestyle", headline: "Smarter living", description: "Audio, wearables and the small devices that remove friction.", image: EDITORIAL.deskTech, featured: false },
  { name: "Gifting Edit", headline: "Give something meant", description: "Curated by price band so you can stop scrolling.", image: EDITORIAL.heroCouple, featured: false },
  { name: "Sustainable Choices", headline: "For a greener planet", description: "Products from makers with published material and labour standards.", image: EDITORIAL.outdoorForest, featured: false },
  { name: "Everyday Essentials", headline: "Simplify your day", description: "The repeat-purchase shelf: pantry, care and basics.", image: EDITORIAL.heroShopping, featured: false },
  { name: "Premium Picks", headline: "Worth the upgrade", description: "Higher spend, longer life, better materials.", image: EDITORIAL.heroMan, featured: false },
  { name: "Limited Drops", headline: "Here briefly", description: "Short-run releases and collaborations.", image: EDITORIAL.heroStreet, featured: false },
  { name: "Clearance", headline: "Last chance", description: "Final pieces at their final price.", image: EDITORIAL.heroStore, featured: false },
];

export function buildCollections(storeId: string, referenceDate: Date): Collection[] {
  const rng = new Rng(`${storeId}:collections`);
  return COLLECTION_BLUEPRINTS.map((blueprint) => {
    const startsAt = rng.pastDate(referenceDate, 10, 120);
    const endsAt = rng.futureDate(referenceDate, 20, 180);
    return {
      id: `col_${storeId}_${slugify(blueprint.name)}`,
      storeId,
      name: blueprint.name,
      slug: slugify(blueprint.name),
      headline: blueprint.headline,
      description: blueprint.description,
      image: img(blueprint.image, 1400, 900),
      type: "manual" as const,
      rules: [],
      productIds: [],
      featured: blueprint.featured,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      seo: {
        title: `${blueprint.name} — ${blueprint.headline}`,
        description: blueprint.description,
      },
    };
  });
}
