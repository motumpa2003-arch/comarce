import type {
  AppNotification,
  Customer,
  Order,
  Product,
  ProductQuestion,
  Review,
  SupportTicket,
} from "@obsidian/commerce";
import { Rng } from "../rng";
import {
  REVIEW_BODIES_MIXED,
  REVIEW_BODIES_NEGATIVE,
  REVIEW_BODIES_POSITIVE,
  REVIEW_TITLES,
  SUPPORT_SUBJECTS,
} from "./people";

export function buildReviews({
  storeId,
  products,
  customers,
  referenceDate,
  count,
}: {
  storeId: string;
  products: Product[];
  customers: Customer[];
  referenceDate: Date;
  count: number;
}): Review[] {
  const rng = new Rng(`${storeId}:reviews`);
  if (!products.length || !customers.length) return [];

  // Weight review volume toward products that actually sell.
  const weighted = products.map((p) => [p, Math.max(1, Math.round(p.rating.count / 40))] as const);

  const reviews: Review[] = [];
  for (let i = 0; i < count; i++) {
    const product = rng.weighted(weighted);
    const customer = rng.pick(customers);
    const rating = rng.weighted<1 | 2 | 3 | 4 | 5>([[5, 58], [4, 24], [3, 10], [2, 5], [1, 3]]);
    const body =
      rating >= 4 ? rng.pick(REVIEW_BODIES_POSITIVE)
      : rating === 3 ? rng.pick(REVIEW_BODIES_MIXED)
      : rng.pick(REVIEW_BODIES_NEGATIVE);

    const createdAt = rng.pastDate(referenceDate, 1, 320);
    const hasReply = rating <= 3 ? rng.bool(0.7) : rng.bool(0.18);

    reviews.push({
      id: `rev_${storeId}_${String(i).padStart(4, "0")}`,
      storeId,
      productId: product.id,
      productName: product.name,
      productImage: product.media[0]?.url ?? "",
      customerId: customer.id,
      customerName: `${customer.firstName} ${customer.lastName.charAt(0)}.`,
      customerAvatar: customer.avatar,
      rating,
      title: rng.pick(REVIEW_TITLES),
      body,
      images: rng.bool(0.22) ? rng.sample(product.media.map((m) => m.url), rng.int(1, 2)) : [],
      verifiedPurchase: rng.bool(0.86),
      helpfulCount: rng.int(0, 240),
      reportCount: rng.bool(0.04) ? rng.int(1, 4) : 0,
      status: rng.weighted([["approved", 88], ["pending", 8], ["flagged", 2], ["rejected", 2]]),
      merchantReply: hasReply
        ? {
            body:
              rating <= 3
                ? "Thank you for the honest feedback — we have shared this with the product team and our support team will reach out about a replacement."
                : "Really glad this worked out for you. Thank you for taking the time to write.",
            author: "Obsidian Support",
            createdAt: new Date(createdAt.getTime() + 86400000 * rng.int(1, 4)).toISOString(),
          }
        : undefined,
      createdAt: createdAt.toISOString(),
    });
  }

  reviews.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  return reviews;
}

const QUESTION_BANK = [
  "Does this come with a warranty, and what does it cover?",
  "Is the sizing true to the chart or should I size up?",
  "How long does delivery usually take to a tier-2 city?",
  "Is this the latest version or the previous generation?",
  "Can I return this if the colour is not what I expected?",
  "Does the price include GST?",
  "Is there a cash on delivery option for this item?",
  "What is in the box exactly?",
];

const ANSWER_BANK = [
  "Yes — two years of manufacturer warranty covering defects, handled through our support team.",
  "It runs true to size for most people. If you are between sizes we would suggest going up.",
  "Typically four to six working days to tier-2 cities, and we send tracking as soon as it ships.",
  "This is the current generation. The previous one is listed separately and clearly marked.",
  "Absolutely — thirty days, no questions asked, provided the tags are intact.",
  "Yes, all displayed prices are inclusive of GST and the invoice breaks it out.",
];

export function buildQuestions({
  storeId,
  products,
  customers,
  referenceDate,
  count,
}: {
  storeId: string;
  products: Product[];
  customers: Customer[];
  referenceDate: Date;
  count: number;
}): ProductQuestion[] {
  const rng = new Rng(`${storeId}:questions`);
  if (!products.length) return [];

  return Array.from({ length: count }, (_, i) => {
    const product = rng.pick(products);
    const customer = customers.length ? rng.pick(customers) : undefined;
    const createdAt = rng.pastDate(referenceDate, 2, 200);
    const answerCount = rng.weighted([[1, 70], [2, 22], [0, 8]]);
    return {
      id: `qst_${storeId}_${i}`,
      storeId,
      productId: product.id,
      customerName: customer ? `${customer.firstName} ${customer.lastName.charAt(0)}.` : "A shopper",
      question: rng.pick(QUESTION_BANK),
      answers: Array.from({ length: answerCount }, (_, a) => ({
        id: `ans_${storeId}_${i}_${a}`,
        body: rng.pick(ANSWER_BANK),
        author: a === 0 ? "Obsidian Support" : "Verified buyer",
        authorType: (a === 0 ? "merchant" : "customer") as "merchant" | "customer",
        helpfulCount: rng.int(0, 60),
        createdAt: new Date(createdAt.getTime() + 86400000 * (a + 1)).toISOString(),
      })),
      createdAt: createdAt.toISOString(),
    };
  });
}

export function buildNotifications({
  storeId,
  orders,
  products,
  referenceDate,
  audience,
  count,
}: {
  storeId: string;
  orders: Order[];
  products: Product[];
  referenceDate: Date;
  audience: "customer" | "merchant";
  count: number;
}): AppNotification[] {
  const rng = new Rng(`${storeId}:notifications:${audience}`);

  type Template = {
    event: AppNotification["event"];
    title: string;
    category: AppNotification["category"];
    icon: string;
  };

  const merchantTemplates: Template[] = [
    { event: "order_created", title: "New order received", category: "orders", icon: "shopping-bag" },
    { event: "payment_success", title: "Payment captured", category: "orders", icon: "credit-card" },
    { event: "low_stock", title: "Low stock warning", category: "inventory", icon: "package" },
    { event: "review_received", title: "New review posted", category: "updates", icon: "star" },
    { event: "new_customer", title: "New customer signed up", category: "updates", icon: "user-plus" },
    { event: "abandoned_cart", title: "Cart abandoned", category: "offers", icon: "shopping-cart" },
    { event: "payment_failed", title: "Payment failed", category: "orders", icon: "alert-triangle" },
  ];

  const customerTemplates: Template[] = [
    { event: "order_shipped", title: "Your order has shipped", category: "orders", icon: "truck" },
    { event: "order_delivered", title: "Order delivered", category: "orders", icon: "check-circle" },
    { event: "price_drop", title: "Price drop alert", category: "offers", icon: "trending-down" },
    { event: "back_in_stock", title: "Back in stock", category: "updates", icon: "package-check" },
    { event: "campaign", title: "Flat 50% off fashion", category: "offers", icon: "tag" },
    { event: "return_approved", title: "Return approved", category: "orders", icon: "rotate-ccw" },
  ];

  const templates: Template[] = audience === "merchant" ? merchantTemplates : customerTemplates;

  return Array.from({ length: count }, (_, i) => {
    const template = rng.pick(templates);
    const order = orders.length ? rng.pick(orders) : undefined;
    const product = products.length ? rng.pick(products) : undefined;

    const body =
      template.event === "low_stock"
        ? `${product?.name ?? "A product"} is down to ${rng.int(1, 9)} units at BLR-FC1.`
        : template.event === "price_drop"
          ? `${product?.name ?? "An item"} on your wishlist is now ${rng.int(8, 45)}% cheaper.`
          : template.event === "campaign"
            ? "Two days left on the festive edit. Shop before it ends."
            : order
              ? `Order #${order.orderNumber} — ${order.itemCount} item${order.itemCount > 1 ? "s" : ""}, ₹${Math.round(order.total / 100).toLocaleString("en-IN")}.`
              : "Tap to see the details.";

    return {
      id: `ntf_${storeId}_${audience}_${i}`,
      storeId,
      audience,
      event: template.event,
      title: template.title,
      body,
      icon: template.icon,
      actionUrl: order ? (audience === "merchant" ? `/admin/orders/${order.id}` : `/account/orders/${order.id}`) : undefined,
      read: rng.bool(0.45),
      createdAt: rng.pastDate(referenceDate, 0, 30).toISOString(),
      category: template.category,
    };
  }).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function buildSupportTickets({
  storeId,
  customers,
  orders,
  referenceDate,
  count,
}: {
  storeId: string;
  customers: Customer[];
  orders: Order[];
  referenceDate: Date;
  count: number;
}): SupportTicket[] {
  const rng = new Rng(`${storeId}:tickets`);
  if (!customers.length) return [];

  const agents = ["Priya Nair", "Rahul Mehta", "Ananya Iyer", "Kabir Shah"];

  return Array.from({ length: count }, (_, i) => {
    const customer = rng.pick(customers);
    const order = orders.length && rng.bool(0.75) ? rng.pick(orders) : undefined;
    const createdAt = rng.pastDate(referenceDate, 0, 120);
    const status = rng.weighted<SupportTicket["status"]>([
      ["resolved", 52],
      ["open", 20],
      ["pending", 16],
      ["closed", 12],
    ]);
    const messageCount = rng.int(1, 4);

    return {
      id: `tkt_${storeId}_${i}`,
      storeId,
      reference: `TKT-${9000 + i}`,
      customerId: customer.id,
      customerName: `${customer.firstName} ${customer.lastName}`,
      customerEmail: customer.email,
      subject: rng.pick(SUPPORT_SUBJECTS),
      category: rng.weighted<SupportTicket["category"]>([
        ["order", 30], ["shipping", 22], ["return", 18], ["payment", 12], ["product", 10], ["account", 5], ["other", 3],
      ]),
      priority: rng.weighted<SupportTicket["priority"]>([["normal", 55], ["high", 24], ["low", 15], ["urgent", 6]]),
      status,
      assigneeName: status === "open" && rng.bool(0.4) ? undefined : rng.pick(agents),
      orderNumber: order?.orderNumber,
      messages: Array.from({ length: messageCount }, (_, m) => ({
        id: `msg_${storeId}_${i}_${m}`,
        author: m % 2 === 0 ? `${customer.firstName} ${customer.lastName}` : rng.pick(agents),
        authorType: (m % 2 === 0 ? "customer" : "agent") as "customer" | "agent",
        body:
          m % 2 === 0
            ? "Hi — I placed this order last week and wanted to check on the status. Could you take a look when you get a chance?"
            : "Thanks for reaching out. I have checked your order and shared an update below. Let me know if anything is still unclear.",
        createdAt: new Date(createdAt.getTime() + m * 3600000 * rng.int(1, 14)).toISOString(),
      })),
      createdAt: createdAt.toISOString(),
      updatedAt: new Date(createdAt.getTime() + messageCount * 3600000 * 6).toISOString(),
      firstResponseMinutes: rng.int(4, 720),
    };
  }).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
