import {
  getPreset,
  type BlogPost,
  type Category,
  type Collection,
  type FAQItem,
  type NavigationItem,
  type NavigationMenu,
  type PageSection,
  type StorePage,
  type Theme,
} from "@obsidian/commerce";
import { EDITORIAL, PORTRAITS, avatarImg, img } from "../images";
import { Rng, slugify } from "../rng";

export function buildTheme(storeId: string, presetId: string, referenceDate: Date): Theme {
  const preset = getPreset(presetId);
  return {
    id: `theme_${storeId}`,
    storeId,
    name: preset.name,
    preset: preset.id,
    description: preset.description,
    colors: { ...preset.colors },
    typography: { ...preset.typography },
    shape: { ...preset.shape },
    layout: { ...preset.layout },
    updatedAt: referenceDate.toISOString(),
  };
}

/* ---------------------------- Home page ----------------------------- */

export function buildHomePage(
  storeId: string,
  storeName: string,
  collections: Collection[],
  referenceDate: Date,
): StorePage {
  const col = (slug: string) => collections.find((c) => c.slug === slug)?.id;

  const sections: PageSection[] = [
    {
      id: "sec_hero",
      type: "hero",
      eyebrow: "Discover a better way to shop",
      title: "Anything for a brighter tomorrow.",
      subtitle: "Premium products. Trusted brands. Seamless shopping. All in one place.",
      image: img(EDITORIAL.heroWoman, 1800, 1100),
      images: [
        img(EDITORIAL.heroWoman, 1800, 1100),
        img(EDITORIAL.heroFashion, 1800, 1100),
        img(EDITORIAL.heroStreet, 1800, 1100),
      ],
      ctaLabel: "Shop now",
      ctaHref: "/shop",
      secondaryCtaLabel: "Explore categories",
      secondaryCtaHref: "/categories",
      settings: { autoplayMs: 6500, overlayWord: "A more meaningful tomorrow" },
      visible: true,
      position: 0,
    },
    {
      id: "sec_promo",
      type: "promo_strip",
      settings: {
        tone: "obsidian",
        messages:
          "Free delivery over ₹2,000 | 30-day returns, no questions | Authenticity guaranteed on every brand | New drops every Thursday",
      },
      visible: true,
      position: 1,
    },
    {
      id: "sec_categories",
      type: "category_grid",
      eyebrow: "Shop by category",
      title: "Everything you need. All in one place.",
      ctaLabel: "View all categories",
      ctaHref: "/categories",
      source: { kind: "category", limit: 10 },
      visible: true,
      position: 1,
    },
    {
      id: "sec_trust",
      type: "trust_bar",
      visible: true,
      position: 2,
    },
    {
      id: "sec_editorial",
      type: "editorial_split",
      eyebrow: "New season",
      title: "The Autumn Edit",
      body: "Style that moves with you. Structured outerwear, warm neutrals and the accessories that finish them.",
      image: img(EDITORIAL.heroMan, 1200, 1400),
      images: [
        img(EDITORIAL.heroMan, 1000, 1250),
        img(EDITORIAL.interiorRoom, 1000, 700),
        img(EDITORIAL.deskTech, 1000, 700),
      ],
      ctaLabel: "Explore collection",
      ctaHref: `/collection/the-autumn-edit`,
      source: { kind: "collection", value: col("the-autumn-edit"), limit: 3 },
      visible: true,
      position: 3,
    },
    {
      id: "sec_collection_feature",
      type: "collection_feature",
      eyebrow: "This week's edit",
      title: "Everyday Essentials",
      body: "The pieces that earn their place — chosen for how often you will actually reach for them, not how loud they are.",
      image: img(EDITORIAL.heroShopping, 1200, 1500),
      ctaLabel: "Shop the edit",
      source: { kind: "collection", value: col("everyday-essentials"), limit: 10 },
      visible: true,
      position: 5,
    },
    {
      id: "sec_mosaic",
      type: "image_mosaic",
      eyebrow: "Browse the floor",
      title: "Where would you like to start?",
      subtitle: "Every aisle, one tap away.",
      visible: true,
      position: 7,
    },
    {
      id: "sec_new",
      type: "product_grid",
      eyebrow: "New arrivals",
      title: "Fresh finds. Bigger possibilities.",
      ctaLabel: "View all",
      ctaHref: "/shop?sort=newest",
      source: { kind: "flag", value: "isNew", limit: 12 },
      settings: { columns: 6, showTabs: true },
      visible: true,
      position: 4,
    },
    {
      id: "sec_adventure",
      type: "lookbook",
      eyebrow: "Gear up",
      title: "For new adventures",
      body: "Premium outdoor and sports gear for every journey.",
      image: img(EDITORIAL.outdoorHiker, 1900, 1000),
      images: [
        img(EDITORIAL.outdoorPack, 600, 600),
        img(EDITORIAL.outdoorRange, 600, 600),
        img(EDITORIAL.outdoorForest, 600, 600),
      ],
      ctaLabel: "Shop sports",
      ctaHref: "/category/sports-fitness",
      settings: { quote: "Not just products. A brighter tomorrow for a better you." },
      visible: true,
      position: 5,
    },
    {
      id: "sec_film",
      type: "video_hero",
      eyebrow: "The making of",
      title: "Built to be kept.",
      subtitle:
        "Three workshops, four materials and a refusal to cut the corner nobody would notice. Watch how a season comes together.",
      image: img(EDITORIAL.heroCouple, 1900, 1100),
      ctaLabel: "Shop the film",
      ctaHref: "/shop?sort=newest",
      secondaryCtaLabel: "Read the journal",
      secondaryCtaHref: "/journal",
      visible: true,
      position: 10,
    },
    {
      id: "sec_trending",
      type: "carousel",
      eyebrow: "Trending now",
      title: "What everyone is buying",
      ctaLabel: "View all",
      ctaHref: "/shop?sort=popularity",
      source: { kind: "recommendation", value: "trending", limit: 12 },
      visible: true,
      position: 6,
    },
    {
      id: "sec_recommended",
      type: "recommendations",
      eyebrow: "Picked for you",
      title: "Because you looked at these",
      ctaLabel: "See more",
      ctaHref: "/shop",
      source: { kind: "recommendation", value: "personalised", limit: 12 },
      settings: { layout: "rail" },
      visible: true,
      position: 12,
    },
    {
      id: "sec_brands",
      type: "logo_cloud",
      eyebrow: "Top brands",
      title: "Trusted by millions",
      ctaLabel: "View all brands",
      ctaHref: "/brands",
      visible: true,
      position: 7,
    },
    {
      id: "sec_brand_story",
      type: "brand_story",
      eyebrow: "House note",
      title: "Small batches, on purpose.",
      body: "We would rather make four hundred of something properly than four thousand of it quickly. Every maker we work with is named on the product page, every material is traceable to its mill, and nothing ships until it has survived a wash test none of us enjoy running.",
      image: img(EDITORIAL.interiorStyled, 1200, 1400),
      ctaLabel: "Meet the makers",
      ctaHref: "/journal",
      settings: {
        pillars:
          "Named makers on every product | Traceable materials | Repairs, not replacements | Carbon-neutral delivery",
      },
      visible: true,
      position: 15,
    },
    {
      id: "sec_deals",
      type: "countdown",
      eyebrow: "Limited time deals",
      title: "Ends in",
      body: "Rotating deals across every aisle. New drops every 24 hours.",
      image: img(EDITORIAL.heroStore, 1200, 800),
      ctaLabel: "Shop deals",
      ctaHref: "/deals",
      secondaryCtaLabel: "Buy gift card",
      secondaryCtaHref: "/gift-cards",
      settings: { endsInHours: 62 },
      visible: true,
      position: 8,
    },
    {
      id: "sec_reviews",
      type: "testimonial",
      eyebrow: "Loved by our customers",
      title: "Real stories. Real happiness.",
      ctaLabel: "View all reviews",
      ctaHref: "/reviews",
      visible: true,
      position: 9,
    },
    {
      id: "sec_review_wall",
      type: "review_wall",
      eyebrow: "Verified reviews",
      title: "What people actually say",
      subtitle: "Every review below is attached to a delivered order.",
      source: { limit: 9, kind: "manual" },
      visible: true,
      position: 18,
    },
    {
      id: "sec_faq",
      type: "faq",
      eyebrow: "Before you ask",
      title: "The questions we get most",
      ctaLabel: "All questions",
      ctaHref: "/faq",
      source: { kind: "manual", limit: 6 },
      visible: true,
      position: 19,
    },
    {
      id: "sec_recently_viewed",
      type: "recently_viewed",
      eyebrow: "Pick up where you left off",
      title: "Recently viewed",
      visible: true,
      position: 20,
    },
    {
      id: "sec_promise",
      type: "custom_html",
      title: "Our promise",
      body: "<p>Every order is packed by hand in Bengaluru and checked twice before it leaves the building.</p><ul><li><strong>Thirty days</strong> to change your mind, for any reason or none.</li><li><strong>Free return pickup</strong> from every serviceable pin code.</li><li><strong>Two-year repair</strong> on anything with a seam, a hinge or a clasp.</li></ul><p>If something goes wrong, one reply from us fixes it. That is the whole policy.</p>",
      visible: true,
      position: 21,
    },
    {
      id: "sec_newsletter",
      type: "newsletter",
      eyebrow: "Stay in the loop",
      title: "Get exclusive offers, new arrivals and more.",
      body: `Join ${storeName} and be the first to know.`,
      visible: true,
      position: 10,
    },
  ];

  return {
    id: `page_${storeId}_home`,
    storeId,
    title: "Home",
    slug: "home",
    type: "home",
    // Array order is the page order; positions are derived so inserting a
    // section never means renumbering every one below it by hand.
    sections: sections.map((section, index) => ({ ...section, position: index })),
    status: "published",
    seo: {
      title: `${storeName} — commerce for a brighter tomorrow`,
      description: "Shop premium products across fashion, electronics, home, beauty, sports and everyday essentials.",
    },
    updatedAt: referenceDate.toISOString(),
  };
}

export function buildStaticPages(storeId: string, storeName: string, referenceDate: Date): StorePage[] {
  const make = (title: string, slug: string, type: StorePage["type"], body: string): StorePage => ({
    id: `page_${storeId}_${slug}`,
    storeId,
    title,
    slug,
    type,
    sections: [
      {
        id: `sec_${slug}_body`,
        type: "rich_text",
        title,
        body,
        visible: true,
        position: 0,
      },
    ],
    status: "published",
    seo: { title: `${title} — ${storeName}`, description: body.slice(0, 150) },
    updatedAt: referenceDate.toISOString(),
  });

  return [
    make(
      "Our story",
      "our-story",
      "static",
      `${storeName} started with a simple frustration: buying well made things online was harder than it needed to be. Listings were thin, sizing was a guess and support disappeared after checkout.\n\nWe built the opposite. Every product page carries the specification you would actually ask about, every brand publishes where things are made, and every order is covered by a thirty-day window with no argument at the end of it.\n\nToday the platform carries more than fifty thousand products across sixteen categories, served from eight fulfilment locations, and it is used by merchants who care about the same things we do.`,
    ),
    make(
      "About us",
      "about",
      "static",
      `${storeName} is a multi-category retailer built on one idea: the product page should answer the question you would actually ask in a shop.

That means the specification a salesperson would quote, the measurement taken from the sample rather than the spec sheet, and a photograph of the thing itself rather than a mood. It means telling you when something is low on stock instead of letting you find out at checkout.

We employ 240 people across Bengaluru, Pune and eight fulfilment centres. Nobody here is paid a commission on what you buy, which is why our staff will tell you when the cheaper option is the better one.`,
    ),
    make(
      "Sustainability",
      "sustainability",
      "static",
      `We would rather publish an honest number than a comfortable one.

Eighty-one percent of our packaging is recycled fibre and none of it contains plastic tape. Every delivery inside India is carbon-neutral through verified offsets, which we know is the weakest form of the claim — the stronger one is that consolidating dispatch to the nearest fulfilment centre cut our per-parcel distance by 34% last year.

Where we fall short: return shipping is still the largest single part of our footprint, and our own worst category is fast-moving beauty, where small items travel long distances. We publish both numbers in the annual report rather than only the flattering ones.

Repair before replace is the policy on anything with a seam, a hinge or a clasp for two years. A product that stays in use is worth more than any offset we could buy.`,
    ),
    make(
      "Shipping information",
      "shipping",
      "policy",
      `Standard delivery is free on orders above ₹999 and takes four to six working days. Express delivery is ₹199 and arrives in two to three days. Same-day delivery is available in metro pincodes for orders placed before 12 PM.\n\nWe ship from the fulfilment centre closest to your delivery pincode. Tracking is sent by email and SMS the moment your parcel leaves the warehouse, and you can follow it live from your account.\n\nWe currently deliver to more than 19,000 pincodes across India. International shipping is available to selected countries at checkout.`,
    ),
    make(
      "Returns & refunds",
      "returns",
      "policy",
      `You can return most items within thirty days of delivery. Gold and Black loyalty members get sixty days.\n\nStart a return from your account, choose a reason, and pick refund, exchange or store credit. We arrange a free pickup within two working days in serviceable pincodes.\n\nRefunds are issued to the original payment method within five to seven working days of the item passing quality check. Store credit is instant. Items marked final sale, personalised products and opened consumables cannot be returned.`,
    ),
    make(
      "Privacy policy",
      "privacy",
      "policy",
      `We collect the minimum information needed to take an order, deliver it and support you afterwards: your name, contact details, delivery address and order history.\n\nWe do not sell personal data. Payment details are handled by our payment partners and never stored on our servers. Analytics is aggregated and does not identify individuals.\n\nYou can export or delete your data at any time from account settings, and you can opt out of marketing without losing access to transactional messages about your orders.`,
    ),
    make(
      "Terms of service",
      "terms",
      "policy",
      `These terms cover your use of the storefront, your account and any orders you place.\n\nPrices are inclusive of GST unless stated otherwise. We reserve the right to cancel an order where a listing carries a clear pricing error, and we will refund in full when that happens.\n\nAccounts are personal. Reselling, scraping the catalogue or automating checkout is not permitted. Disputes are governed by the laws of India with jurisdiction in Bengaluru.`,
    ),
    make(
      "Help centre",
      "help",
      "static",
      `Most questions are answered below. If yours is not, our support team replies within four working hours on weekdays.\n\nFor order issues, have your order number ready — it starts with OD and appears in your confirmation email. For payment questions, quote the reference beginning with pay_.\n\nYou can reach us by email, live chat from 9 AM to 9 PM IST, or WhatsApp for order tracking.`,
    ),
  ];
}

/* ---------------------------- Navigation ---------------------------- */

export function buildNavigation(
  storeId: string,
  categories: Category[],
  collections: Collection[],
): NavigationMenu[] {
  const topLevel = categories.filter((c) => c.level === 0);

  const categoryItems: NavigationItem[] = topLevel.map((parent) => ({
    id: `nav_${parent.id}`,
    label: parent.name,
    href: `/category/${parent.slug}`,
    image: parent.image,
    description: parent.description,
    children: categories
      .filter((c) => c.parentId === parent.id)
      .map((child) => ({
        id: `nav_${child.id}`,
        label: child.name,
        href: `/category/${child.slug}`,
      })),
  }));

  const main: NavigationMenu = {
    id: `nav_${storeId}_main`,
    storeId,
    handle: "main",
    name: "Main navigation",
    items: [
      {
        id: "nav_shop",
        label: "Shop",
        href: "/shop",
        children: categoryItems,
      },
      {
        id: "nav_collections",
        label: "Collections",
        href: "/collections",
        children: collections
          .filter((c) => c.featured)
          .slice(0, 8)
          .map((c) => ({
            id: `nav_${c.id}`,
            label: c.name,
            href: `/collection/${c.slug}`,
            description: c.headline,
            image: c.image,
          })),
      },
      {
        id: "nav_new",
        label: "New & trending",
        href: "/new-arrivals",
        children: [
          { id: "nav_new_arrivals", label: "New arrivals", href: "/new-arrivals", description: "Added in the last thirty days" },
          { id: "nav_trending", label: "Trending now", href: "/trending", description: "What is moving this week" },
          { id: "nav_bestsellers", label: "Bestsellers", href: "/bestsellers", description: "Ranked on units shipped" },
          { id: "nav_recommended", label: "Recommended for you", href: "/recommended", description: "Picked from your browsing" },
        ],
      },
      {
        id: "nav_deals",
        label: "Deals",
        href: "/deals",
        badge: "Hot",
        children: [
          { id: "nav_deals_hub", label: "All deals", href: "/deals", description: "Every discount and coupon" },
          { id: "nav_flash", label: "Flash sale", href: "/flash-sale", description: "Deepest cuts, live stock" },
          { id: "nav_gift_guide", label: "Gift guide", href: "/gift-guide", description: "Four stars and above" },
        ],
      },
      { id: "nav_brands", label: "Brands", href: "/brands" },
      { id: "nav_journal", label: "Journal", href: "/journal" },
      { id: "nav_gift", label: "Gift cards", href: "/gift-cards" },
    ],
  };

  const footerShop: NavigationMenu = {
    id: `nav_${storeId}_footer_shop`,
    storeId,
    handle: "footer_shop",
    name: "Footer — Shop",
    items: [
      { id: "f_all", label: "All categories", href: "/categories" },
      { id: "f_deals", label: "Deals", href: "/deals" },
      { id: "f_flash", label: "Flash sale", href: "/flash-sale" },
      { id: "f_new", label: "New arrivals", href: "/new-arrivals" },
      { id: "f_best", label: "Bestsellers", href: "/bestsellers" },
      { id: "f_trending", label: "Trending", href: "/trending" },
      { id: "f_giftguide", label: "Gift guide", href: "/gift-guide" },
      { id: "f_collections", label: "Collections", href: "/collections" },
      { id: "f_gift", label: "Gift cards", href: "/gift-cards" },
    ],
  };

  const footerSupport: NavigationMenu = {
    id: `nav_${storeId}_footer_support`,
    storeId,
    handle: "footer_support",
    name: "Footer — Customer care",
    items: [
      { id: "f_track", label: "Track order", href: "/track" },
      { id: "f_returns", label: "Returns & refunds", href: "/pages/returns" },
      { id: "f_size", label: "Size guide", href: "/size-guide" },
      { id: "f_help", label: "Help centre", href: "/pages/help" },
      { id: "f_ship", label: "Shipping info", href: "/pages/shipping" },
      { id: "f_stores", label: "Store locator", href: "/stores" },
      { id: "f_contact", label: "Contact us", href: "/contact" },
      { id: "f_faq", label: "FAQs", href: "/faq" },
    ],
  };

  const footerCompany: NavigationMenu = {
    id: `nav_${storeId}_footer_company`,
    storeId,
    handle: "footer_company",
    name: "Footer — Company",
    items: [
      { id: "f_about", label: "About us", href: "/pages/about" },
      { id: "f_story", label: "Our story", href: "/pages/our-story" },
      { id: "f_sustain", label: "Sustainability", href: "/pages/sustainability" },
      { id: "f_lookbook", label: "Lookbook", href: "/lookbook" },
      { id: "f_journal", label: "Journal", href: "/journal" },
      { id: "f_membership", label: "Membership", href: "/membership" },
      { id: "f_announcements", label: "Announcements", href: "/announcements" },
      { id: "f_privacy", label: "Privacy policy", href: "/pages/privacy" },
      { id: "f_terms", label: "Terms of service", href: "/pages/terms" },
      { id: "f_sell", label: "Sell on Obsidian", href: "/platform" },
      { id: "f_admin", label: "Merchant login", href: "/admin" },
    ],
  };

  return [main, footerShop, footerSupport, footerCompany];
}

/* ------------------------------- Blog ------------------------------- */

const BLOG_BLUEPRINTS = [
  { title: "How to build a capsule wardrobe that actually works", category: "Style", cover: EDITORIAL.heroFashion, excerpt: "Thirty pieces, four seasons, no decision fatigue. A practical method rather than a mood board." },
  { title: "Buying a laptop in 2026: what actually matters", category: "Tech", cover: EDITORIAL.deskTech, excerpt: "Ignore the marketing tiers. Here are the five specifications that change how a machine feels day to day." },
  { title: "A room-by-room guide to warm minimal lighting", category: "Home", cover: EDITORIAL.interiorRoom, excerpt: "Colour temperature, layering and why one bright ceiling light ruins a room." },
  { title: "The skincare routine you can actually keep", category: "Beauty", cover: EDITORIAL.heroWoman, excerpt: "Four products, two minutes, and the order that makes them work." },
  { title: "Packing for a two-day trek without overpacking", category: "Outdoors", cover: EDITORIAL.outdoorHiker, excerpt: "A tested list, weighed to the gram, with the three things people always forget." },
  { title: "What 'sustainable' should mean on a product page", category: "Sustainability", cover: EDITORIAL.outdoorForest, excerpt: "Materials, labour and repairability — the disclosures we ask every brand for." },
  { title: "Choosing a sofa you will still like in five years", category: "Home", cover: EDITORIAL.interiorStyled, excerpt: "Frame, foam, fabric and the measurements to take before you order." },
  { title: "Coffee at home: a beginner's brew guide", category: "Food", cover: EDITORIAL.heroShopping, excerpt: "Grind size, ratio and water temperature explained without the jargon." },
  { title: "Running shoes: how to pick by gait, not by brand", category: "Fitness", cover: EDITORIAL.heroStreet, excerpt: "Stack height, drop and cushioning, and why race shoes are the wrong daily trainer." },
  { title: "Behind the scenes at our Bengaluru fulfilment centre", category: "Inside", cover: EDITORIAL.heroStore, excerpt: "How an order becomes a parcel in under four hours." },
  { title: "Gifting guide: thoughtful picks under ₹2,500", category: "Gifting", cover: EDITORIAL.heroCouple, excerpt: "Twenty-four things worth giving, sorted by who you are buying for." },
  { title: "Understanding GST on your invoice", category: "Explainers", cover: EDITORIAL.heroMan, excerpt: "CGST, SGST, IGST and HSN codes — what each line on your bill means." },
];

const AUTHORS = ["Ananya Iyer", "Rahul Mehta", "Priya Nair", "Kabir Shah", "Divya Reddy"];

export function buildBlogPosts(storeId: string, referenceDate: Date): BlogPost[] {
  const rng = new Rng(`${storeId}:blog`);
  return BLOG_BLUEPRINTS.map((bp, index) => {
    const publishedAt = rng.pastDate(referenceDate, index * 9 + 2, index * 9 + 12);
    return {
      id: `post_${storeId}_${index}`,
      storeId,
      title: bp.title,
      slug: slugify(bp.title),
      excerpt: bp.excerpt,
      body: [
        bp.excerpt,
        "This guide is written from what we see in returns data, support tickets and the questions customers ask before they buy. It is deliberately practical: no trend forecasting, no aspirational photography standing in for information.",
        "Start with the constraint, not the product. Almost every bad purchase we see traces back to buying for an imagined version of the week rather than the actual one. Write down how often you will use the thing, and in what conditions.",
        "Then look at the specification that governs that use. For most categories, one or two numbers carry nearly all the outcome, and the rest is marketing. We list those numbers on every product page precisely so this decision takes minutes rather than evenings.",
        "Finally, check the repair and return path before you order. A product that can be fixed, refilled or re-soled is usually cheaper over three years than the one that cannot, even when it costs more today.",
      ].join("\n\n"),
      cover: img(bp.cover, 1400, 800),
      category: bp.category,
      tags: [bp.category.toLowerCase(), "guide", "obsidian"],
      authorName: rng.pick(AUTHORS),
      authorAvatar: avatarImg(rng.pick(PORTRAITS), 96),
      readMinutes: rng.int(4, 11),
      status: "published",
      publishedAt: publishedAt.toISOString(),
      seo: { title: bp.title, description: bp.excerpt },
    };
  });
}

/* -------------------------------- FAQ ------------------------------- */

const FAQ_BANK: { q: string; a: string; category: string }[] = [
  { q: "How long does delivery take?", a: "Standard delivery is four to six working days and free above ₹999. Express is two to three days, and same-day is available in metro pincodes for orders placed before noon.", category: "Shipping" },
  { q: "Can I track my order?", a: "Yes. Tracking is emailed and texted the moment your parcel is handed to the carrier, and you can follow it live from Account → Orders → Track.", category: "Shipping" },
  { q: "What is your return window?", a: "Thirty days from delivery for most items, sixty days for Gold and Black loyalty members. Final-sale items, personalised products and opened consumables are excluded.", category: "Returns" },
  { q: "How do refunds work?", a: "Once an item passes quality check, refunds go back to the original payment method within five to seven working days. Store credit is instant if you prefer it.", category: "Returns" },
  { q: "Which payment methods do you accept?", a: "UPI, credit and debit cards, net banking, wallets, buy-now-pay-later, gift cards, store credit and cash on delivery in serviceable pincodes.", category: "Payments" },
  { q: "Are prices inclusive of GST?", a: "Yes. Every displayed price includes GST, and your invoice breaks out CGST and SGST or IGST depending on your state.", category: "Payments" },
  { q: "Do you offer cash on delivery?", a: "Cash on delivery is available on most orders up to ₹20,000 in serviceable pincodes. It is not available on jewellery or personalised items.", category: "Payments" },
  { q: "Are the products authentic?", a: "Every product is sourced directly from the brand or an authorised distributor. Serial numbers and warranty cards are included where the brand issues them.", category: "Products" },
  { q: "How do I use a coupon code?", a: "Enter it in the coupon field on the cart or checkout page. One coupon applies per order unless the code is explicitly marked stackable.", category: "Offers" },
  { q: "How does the loyalty programme work?", a: "You earn one point per ₹100 spent, multiplied by your tier. Points are worth ₹1 each at checkout and never expire while your account is active.", category: "Offers" },
  { q: "Can I change my delivery address after ordering?", a: "Yes, until the order is packed. Open the order in your account and choose Change address, or contact support and we will update it for you.", category: "Orders" },
  { q: "How do I cancel an order?", a: "Orders can be cancelled from your account any time before dispatch. After dispatch, refuse delivery or raise a return once it arrives.", category: "Orders" },
];

export function buildFaqs(storeId: string): FAQItem[] {
  return FAQ_BANK.map((item, index) => ({
    id: `faq_${storeId}_${index}`,
    storeId,
    question: item.q,
    answer: item.a,
    category: item.category,
    position: index,
  }));
}
