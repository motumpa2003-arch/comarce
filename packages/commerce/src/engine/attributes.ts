import type { AttributeDefinition, AttributeInputType, AttributeOption } from "../types/catalog";
import type { Industry } from "../types/tenancy";

/**
 * Industry attribute presets.
 *
 * These are seed data for the merchant's attribute library, not engine
 * constants — a merchant can add, rename or delete any of them, and the
 * catalogue, PLP facets and PDP spec tables follow automatically.
 */

type AttributeSeed = {
  key: string;
  label: string;
  inputType: AttributeInputType;
  unit?: string;
  options?: AttributeOption[];
  variantDefining?: boolean;
  filterable?: boolean;
  displayInSpecs?: boolean;
  searchable?: boolean;
};

export const COLOR_OPTIONS: AttributeOption[] = [
  { value: "black", label: "Black", swatch: "#111111" },
  { value: "obsidian", label: "Obsidian", swatch: "#080908" },
  { value: "white", label: "White", swatch: "#FFFFFF" },
  { value: "ivory", label: "Ivory", swatch: "#F4F0E7" },
  { value: "emerald", label: "Emerald", swatch: "#063F32" },
  { value: "olive", label: "Olive", swatch: "#5A6141" },
  { value: "sand", label: "Sand", swatch: "#C9B294" },
  { value: "tan", label: "Tan", swatch: "#A97F52" },
  { value: "grey", label: "Grey", swatch: "#8A8D88" },
  { value: "charcoal", label: "Charcoal", swatch: "#3A3D3B" },
  { value: "navy", label: "Navy", swatch: "#1E2A44" },
  { value: "burgundy", label: "Burgundy", swatch: "#5E1F2A" },
  { value: "gold", label: "Gold", swatch: "#C9A227" },
  { value: "silver", label: "Silver", swatch: "#C4C7C9" },
  { value: "rose", label: "Rose", swatch: "#C98A8A" },
  { value: "blue", label: "Blue", swatch: "#2F6FB0" },
];

const opts = (...values: string[]): AttributeOption[] =>
  values.map((v) => ({ value: v.toLowerCase().replace(/\s+/g, "-"), label: v }));

export const INDUSTRY_ATTRIBUTES: Record<Industry, AttributeSeed[]> = {
  fashion: [
    { key: "color", label: "Colour", inputType: "color", options: COLOR_OPTIONS, variantDefining: true },
    { key: "size", label: "Size", inputType: "select", options: opts("XS", "S", "M", "L", "XL", "XXL"), variantDefining: true },
    { key: "fit", label: "Fit", inputType: "select", options: opts("Slim", "Regular", "Relaxed", "Oversized") },
    { key: "fabric", label: "Fabric", inputType: "select", options: opts("Cotton", "Linen", "Wool", "Silk", "Denim", "Leather", "Blend") },
    { key: "pattern", label: "Pattern", inputType: "select", options: opts("Solid", "Striped", "Checked", "Printed", "Textured") },
    { key: "gender", label: "Gender", inputType: "select", options: opts("Men", "Women", "Unisex", "Kids") },
    { key: "occasion", label: "Occasion", inputType: "select", options: opts("Casual", "Formal", "Party", "Workwear", "Athleisure") },
    { key: "care", label: "Care", inputType: "text", filterable: false },
  ],
  electronics: [
    { key: "color", label: "Colour", inputType: "color", options: COLOR_OPTIONS, variantDefining: true },
    { key: "storage", label: "Storage", inputType: "select", options: opts("64GB", "128GB", "256GB", "512GB", "1TB", "2TB"), variantDefining: true },
    { key: "ram", label: "RAM", inputType: "select", options: opts("4GB", "8GB", "12GB", "16GB", "32GB") },
    { key: "processor", label: "Processor", inputType: "text" },
    { key: "screen_size", label: "Screen size", inputType: "number", unit: "in" },
    { key: "battery", label: "Battery", inputType: "text" },
    { key: "connectivity", label: "Connectivity", inputType: "multiselect", options: opts("Wi-Fi 6", "Bluetooth 5.3", "5G", "NFC", "USB-C", "Thunderbolt") },
    { key: "warranty_months", label: "Warranty", inputType: "number", unit: "months" },
  ],
  beauty: [
    { key: "shade", label: "Shade", inputType: "color", options: opts("Porcelain", "Ivory", "Beige", "Sand", "Honey", "Caramel", "Espresso"), variantDefining: true },
    { key: "volume", label: "Volume", inputType: "select", options: opts("15ml", "30ml", "50ml", "100ml", "200ml"), variantDefining: true },
    { key: "skin_type", label: "Skin type", inputType: "multiselect", options: opts("Oily", "Dry", "Combination", "Sensitive", "Normal") },
    { key: "finish", label: "Finish", inputType: "select", options: opts("Matte", "Dewy", "Satin", "Glossy", "Natural") },
    { key: "concern", label: "Concern", inputType: "multiselect", options: opts("Acne", "Ageing", "Pigmentation", "Hydration", "Dullness") },
    { key: "key_ingredient", label: "Key ingredient", inputType: "select", options: opts("Hyaluronic acid", "Niacinamide", "Vitamin C", "Retinol", "Salicylic acid", "Ceramides") },
    { key: "vegan", label: "Vegan", inputType: "boolean" },
  ],
  home: [
    { key: "color", label: "Colour", inputType: "color", options: COLOR_OPTIONS, variantDefining: true },
    { key: "material", label: "Material", inputType: "select", options: opts("Cotton", "Linen", "Ceramic", "Glass", "Stainless steel", "Bamboo", "Jute"), variantDefining: false },
    { key: "room", label: "Room", inputType: "select", options: opts("Living room", "Bedroom", "Kitchen", "Bathroom", "Study", "Outdoor") },
    { key: "size", label: "Size", inputType: "select", options: opts("Single", "Double", "Queen", "King", "Small", "Medium", "Large"), variantDefining: true },
    { key: "care", label: "Care", inputType: "text", filterable: false },
  ],
  furniture: [
    { key: "material", label: "Material", inputType: "select", options: opts("Solid wood", "Engineered wood", "Metal", "Rattan", "Marble", "Fabric", "Leather"), variantDefining: true },
    { key: "finish", label: "Finish", inputType: "color", options: opts("Walnut", "Oak", "Teak", "Matte black", "Natural", "White"), variantDefining: true },
    { key: "width_cm", label: "Width", inputType: "number", unit: "cm" },
    { key: "height_cm", label: "Height", inputType: "number", unit: "cm" },
    { key: "depth_cm", label: "Depth", inputType: "number", unit: "cm" },
    { key: "seating", label: "Seating", inputType: "select", options: opts("1 seater", "2 seater", "3 seater", "L shaped") },
    { key: "assembly", label: "Assembly", inputType: "select", options: opts("Pre-assembled", "Carpenter assembly", "DIY") },
    { key: "room", label: "Room", inputType: "select", options: opts("Living room", "Bedroom", "Dining", "Study", "Outdoor") },
  ],
  sports: [
    { key: "color", label: "Colour", inputType: "color", options: COLOR_OPTIONS, variantDefining: true },
    { key: "size", label: "Size", inputType: "select", options: opts("6", "7", "8", "9", "10", "11", "S", "M", "L", "XL"), variantDefining: true },
    { key: "sport", label: "Sport", inputType: "select", options: opts("Running", "Training", "Cricket", "Football", "Yoga", "Cycling", "Hiking", "Swimming") },
    { key: "level", label: "Level", inputType: "select", options: opts("Beginner", "Intermediate", "Pro") },
    { key: "material", label: "Material", inputType: "select", options: opts("Mesh", "Knit", "Leather", "Neoprene", "Alloy", "Carbon") },
    { key: "gender", label: "Gender", inputType: "select", options: opts("Men", "Women", "Unisex") },
  ],
  grocery: [
    { key: "weight", label: "Pack size", inputType: "select", options: opts("100g", "250g", "500g", "1kg", "2kg", "5kg"), variantDefining: true },
    { key: "brand_origin", label: "Origin", inputType: "select", options: opts("India", "Italy", "Sri Lanka", "Colombia", "Ethiopia", "Vietnam") },
    { key: "diet", label: "Dietary", inputType: "multiselect", options: opts("Vegan", "Gluten free", "Sugar free", "High protein", "Keto") },
    { key: "organic", label: "Organic", inputType: "boolean" },
    { key: "shelf_life_days", label: "Shelf life", inputType: "number", unit: "days" },
    { key: "packaging", label: "Packaging", inputType: "select", options: opts("Pouch", "Jar", "Tin", "Box", "Bottle") },
  ],
  jewelry: [
    { key: "metal", label: "Metal", inputType: "select", options: opts("Gold 18K", "Gold 22K", "Rose gold", "Sterling silver", "Platinum", "Stainless steel"), variantDefining: true },
    { key: "stone", label: "Stone", inputType: "select", options: opts("Diamond", "Emerald", "Ruby", "Sapphire", "Pearl", "None") },
    { key: "size", label: "Size", inputType: "select", options: opts("12", "14", "16", "18", "20"), variantDefining: true },
    { key: "weight_g", label: "Weight", inputType: "number", unit: "g" },
    { key: "certification", label: "Certification", inputType: "select", options: opts("BIS Hallmark", "IGI", "GIA", "None") },
    { key: "occasion", label: "Occasion", inputType: "select", options: opts("Everyday", "Wedding", "Festive", "Gifting") },
  ],
  books: [
    { key: "format", label: "Format", inputType: "select", options: opts("Hardcover", "Paperback", "Ebook", "Audiobook"), variantDefining: true },
    { key: "language", label: "Language", inputType: "select", options: opts("English", "Hindi", "Bengali", "Tamil", "Marathi") },
    { key: "genre", label: "Genre", inputType: "select", options: opts("Fiction", "Non-fiction", "Business", "Self help", "Biography", "Design", "Science") },
    { key: "pages", label: "Pages", inputType: "number" },
    { key: "publisher", label: "Publisher", inputType: "text" },
  ],
  pets: [
    { key: "pet", label: "Pet", inputType: "select", options: opts("Dog", "Cat", "Bird", "Fish", "Small pet") },
    { key: "life_stage", label: "Life stage", inputType: "select", options: opts("Puppy", "Kitten", "Adult", "Senior") },
    { key: "weight", label: "Pack size", inputType: "select", options: opts("400g", "1.2kg", "3kg", "7kg", "10kg"), variantDefining: true },
    { key: "breed_size", label: "Breed size", inputType: "select", options: opts("Small", "Medium", "Large") },
    { key: "diet", label: "Dietary", inputType: "multiselect", options: opts("Grain free", "High protein", "Sensitive stomach", "Veterinary") },
  ],
  general: [
    { key: "color", label: "Colour", inputType: "color", options: COLOR_OPTIONS, variantDefining: true },
    { key: "size", label: "Size", inputType: "select", options: opts("S", "M", "L", "XL"), variantDefining: true },
    { key: "material", label: "Material", inputType: "text" },
  ],
};

export function buildAttributeDefinitions(storeId: string, industries: Industry[]): AttributeDefinition[] {
  const seen = new Set<string>();
  const defs: AttributeDefinition[] = [];
  let position = 0;

  for (const industry of industries) {
    for (const seed of INDUSTRY_ATTRIBUTES[industry] ?? []) {
      const id = `attr_${industry}_${seed.key}`;
      if (seen.has(seed.key)) continue;
      seen.add(seed.key);
      defs.push({
        id,
        storeId,
        key: seed.key,
        label: seed.label,
        inputType: seed.inputType,
        unit: seed.unit,
        options: seed.options,
        variantDefining: seed.variantDefining ?? false,
        filterable: seed.filterable ?? seed.inputType !== "text",
        displayInSpecs: seed.displayInSpecs ?? true,
        searchable: seed.searchable ?? true,
        required: false,
        categoryIds: [],
        industry,
        position: position++,
      });
    }
  }
  return defs;
}

/** Cartesian product of the variant-defining attribute values. */
export function generateVariantMatrix(
  optionSets: { key: string; values: string[] }[],
): Record<string, string>[] {
  return optionSets.reduce<Record<string, string>[]>(
    (acc, set) =>
      acc.flatMap((combo) => set.values.map((value) => ({ ...combo, [set.key]: value }))),
    [{}],
  );
}

export function variantTitleFrom(
  options: Record<string, string>,
  definitions: AttributeDefinition[],
): string {
  return Object.entries(options)
    .map(([key, value]) => {
      const def = definitions.find((d) => d.key === key);
      const option = def?.options?.find((o) => o.value === value);
      return option?.label ?? value;
    })
    .join(" / ");
}
