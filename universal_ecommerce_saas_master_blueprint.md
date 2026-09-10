# Universal Ecommerce SaaS — 600+ Screen Master Implementation Blueprint

> **Purpose:** Build a universal, multi-tenant commerce operating system with premium storefronts, merchant operations, SaaS administration, customer mobile, and merchant mobile. The default visual theme follows the premium black × emerald × gold direction and editorial commerce patterns from the supplied reference material, while remaining an original product.

**Planned UI screens:** 696+ across web and mobile applications.

## 0. Product Charter

The platform is **category-agnostic**. Clothing is a theme/use case, not the data model. Products use dynamic attributes and variants, so the same commerce core can support apparel, electronics, beauty, grocery, furniture, sports, jewelry, books, automotive and other categories.

### Applications

| Application | Primary users | Core purpose |
|---|---|---|
| Customer Web | shoppers | discovery, purchase, account and support |
| Merchant Admin | store owners/staff | catalog, orders, inventory, customers, marketing, analytics |
| Super Admin | SaaS operator | tenants, billing, platform operations, risk, support |
| Customer Mobile | shoppers | native-feeling mobile commerce |
| Merchant Mobile | merchants/staff | fast operational control from phone |

## 1. Design System

### Default premium theme

| Token | Value | Usage |
|---|---|---|
| Obsidian | `#080908` | headers, dark editorial sections, footer |
| Emerald | `#063F32` | primary brand/CTA/active states |
| Luxury Gold | `#C9A227` | premium accents, badges, dividers |
| Ivory | `#F4F0E7` | light surfaces and product areas |
| Soft Gray | `#A7AAA4` | secondary metadata |

Typography: editorial display serif + modern sans-serif. Avoid excessive rounding, heavy shadows and noisy gradients. Prioritize imagery → product → typography → CTA → supporting metadata.

### Responsive rules

- Desktop: 4–5 product columns where appropriate; wide editorial layouts.
- Tablet: 2–3 columns; condensed navigation; side drawer filters.
- Mobile: 2-column product grids; bottom-sheet filters/sort; sticky purchase CTA; swipe galleries; bottom navigation where useful.
- All layouts must handle small phones through ultrawide desktop without horizontal overflow.

## 2. Screen Inventory

The inventory below is designed to exceed **696 screens**. Each numbered screen is a backlog item, route candidate, QA target and design target.

### Customer Web Store

**Screen target: 180+**

#### Home & Discovery — 24 screens

**Purpose:** Store discovery, campaign merchandising and conversion.

**Default UI sections:** Announcement bar → Responsive header → Hero/campaign area → Category discovery → Featured products → Trust/benefits → Editorial → Newsletter/footer

**Primary actions:** Shop category, Open product, Save wishlist, Add to cart, Open search, Open account, Open cart

**Reusable modals/sheets:** Quick view, Search overlay, Newsletter opt-in, Location/shipping selector

**Common filters:** Category, Collection, Campaign, Availability

**Primary data:** Store, Theme, Navigation, Campaign, Collection, Product, Customer

| # | Screen | Key UI / behavior |
|---:|---|---|
| 1 | **Homepage** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 2 | **Homepage Mobile** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 3 | **Search Overlay** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 4 | **Mega Menu** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 5 | **Campaign Landing** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 6 | **New Arrivals** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 7 | **Best Sellers** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 8 | **Trending** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 9 | **Featured Collection** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 10 | **Shop by Category** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 11 | **Shop by Style** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 12 | **Gift Guide** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 13 | **Recently Viewed** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 14 | **Recommended For You** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 15 | **Deals Hub** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 16 | **Flash Sale** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 17 | **Membership/VIP** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 18 | **Store Locator** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 19 | **Announcement Center** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 20 | **Wishlist Preview** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 21 | **Quick View** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 22 | **Newsletter** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 23 | **Brand Promise** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 24 | **Footer Directory** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |

#### Catalog, Category & Search — 42 screens

**Purpose:** Category browsing, filtering, sorting and search intent.

**Default UI sections:** Breadcrumb → Category intro → Filter rail/drawer → Sort → Product grid → Pagination/load more → SEO content

**Primary actions:** Filter, Clear filters, Sort, View product, Add to cart, Save wishlist, Share

**Reusable modals/sheets:** Filter drawer, Sort sheet, Size/attribute guide, Share sheet

**Common filters:** Price, Brand, Category, Attributes, Rating, Availability, Discount, Collection

**Primary data:** Category, Product, Variant, Attribute, Brand, Collection, SearchQuery

| # | Screen | Key UI / behavior |
|---:|---|---|
| 25 | **All Products** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 26 | **Category Landing** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 27 | **Subcategory** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 28 | **Search Results** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 29 | **Search Suggestions** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 30 | **Search No Results** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 31 | **Filtered Results** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 32 | **Sale Listing** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 33 | **Brand Listing** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 34 | **Collection Listing** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 35 | **Compare Products** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 36 | **Recently Viewed** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 37 | **Saved Searches** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 38 | **Product Grid** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 39 | **List View** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 40 | **Category SEO Page** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 41 | **Filter Drawer** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 42 | **Sort Sheet** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 43 | **Attribute Guide** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 44 | **Price Guide** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 45 | **Availability Results** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 46 | **Back-in-Stock Results** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 47 | **Clearance** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 48 | **New In** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 49 | **Under Price X** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 50 | **Giftable Products** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 51 | **Trending Searches** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 52 | **Popular Categories** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 53 | **Brand Directory** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 54 | **Category Comparison** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 55 | **Category FAQ** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 56 | **Category Editorial** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 57 | **Search by SKU** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 58 | **Barcode Search** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 59 | **Visual Search** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 60 | **Voice Search** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 61 | **Personalized Results** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 62 | **Recommended Results** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 63 | **Collection Results** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 64 | **Campaign Results** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 65 | **Pagination State** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 66 | **Loading State** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |

#### Product Discovery & Product Detail — 38 screens

**Purpose:** High-conversion product evaluation and purchase initiation.

**Default UI sections:** Gallery/video → Product identity → Rating/reviews → Price/offer → Variants → Quantity → Delivery → Description → Specifications → Policies → Recommendations → Reviews/Q&A

**Primary actions:** Select variant, Change quantity, Add to cart, Buy now, Wishlist, Compare, Share, Write review

**Reusable modals/sheets:** Full-screen gallery, Quick view, Size/attribute guide, Review form, Share sheet, Notify-me

**Common filters:** Variant availability, Price, Rating, Recommendation type

**Primary data:** Product, ProductVariant, Inventory, Review, Question, Recommendation, Coupon, ShipmentRate

| # | Screen | Key UI / behavior |
|---:|---|---|
| 67 | **Product Detail** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 68 | **Product Detail Mobile** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 69 | **Image Gallery** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 70 | **Fullscreen Gallery** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 71 | **Video Viewer** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 72 | **Variant Selector** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 73 | **Attribute Selector** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 74 | **Size Guide** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 75 | **Material Guide** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 76 | **Care Guide** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 77 | **Delivery Checker** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 78 | **Store Pickup** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 79 | **Notify Me** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 80 | **Quick View** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 81 | **Compare Product** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 82 | **Product Q&A** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 83 | **Reviews** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 84 | **Review Detail** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 85 | **Write Review** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 86 | **Review With Photo** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 87 | **Review Moderation Prompt** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 88 | **Frequently Bought Together** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 89 | **Complete the Look** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 90 | **Similar Products** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 91 | **Recently Viewed Products** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 92 | **Bundle Builder** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 93 | **Gift Wrap** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 94 | **Personalization** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 95 | **Preorder** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 96 | **Backorder** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 97 | **Subscription Purchase** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 98 | **Digital Download** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 99 | **Warranty** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 100 | **Protection Plan** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 101 | **Product Specs** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 102 | **Product Features** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 103 | **Shipping Policy** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 104 | **Return Policy** | Dense data or product content, contextual actions, validation, confirmation feedback. |

#### Cart & Checkout — 28 screens

**Purpose:** Cart optimization, address selection, shipping and payment completion.

**Default UI sections:** Cart items → Recommendations → Coupon/gift card → Shipping estimator → Address → Delivery → Payment → Order review → Confirmation

**Primary actions:** Update qty, Remove, Move to wishlist, Apply coupon, Choose address, Choose shipping, Pay, Place order

**Reusable modals/sheets:** Coupon picker, Address form, Payment confirmation, Terms/policy, Failed payment

**Common filters:** Eligible shipping methods, Payment methods, Promotions

**Primary data:** Cart, CartItem, Customer, Address, Coupon, Order, Payment, Shipment

| # | Screen | Key UI / behavior |
|---:|---|---|
| 105 | **Cart Drawer** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 106 | **Cart Page** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 107 | **Empty Cart** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 108 | **Cart With Coupon** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 109 | **Cart Shipping Goal** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 110 | **Cart Recommendations** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 111 | **Checkout Contact** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 112 | **Checkout Address** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 113 | **Address Book** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 114 | **Checkout Delivery** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 115 | **Delivery Slot** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 116 | **Checkout Payment** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 117 | **Saved Payment Methods** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 118 | **UPI Payment** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 119 | **Card Payment** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 120 | **Net Banking** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 121 | **Wallet Payment** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 122 | **COD** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 123 | **Gift Card** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 124 | **Store Credit** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 125 | **Order Review** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 126 | **Payment Processing** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 127 | **Payment Failed** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 128 | **Payment Retry** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 129 | **Order Confirmation** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 130 | **Guest Checkout** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 131 | **Express Checkout** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 132 | **Checkout Login** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |

#### Account, Orders & Support — 34 screens

**Purpose:** Customer self-service after sign-in and after purchase.

**Default UI sections:** Profile → Orders → Order detail → Tracking → Returns → Wishlist → Addresses → Payment methods → Loyalty → Notifications → Support

**Primary actions:** Edit profile, View order, Track, Return, Exchange, Buy again, Write review, Contact support

**Reusable modals/sheets:** Edit profile, Address form, Return request, Cancellation confirmation, Delete account

**Common filters:** Order status, Date, Return status, Notification type

**Primary data:** Customer, Order, OrderItem, Shipment, Return, Refund, Review, LoyaltyLedger, SupportTicket

| # | Screen | Key UI / behavior |
|---:|---|---|
| 133 | **Account Home** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 134 | **Profile** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 135 | **Security** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 136 | **Addresses** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 137 | **Payment Methods** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 138 | **Wishlist** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 139 | **Orders** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 140 | **Order Detail** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 141 | **Invoice** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 142 | **Order Tracking** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 143 | **Shipment Detail** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 144 | **Cancel Order** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 145 | **Return Request** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 146 | **Return Status** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 147 | **Exchange Request** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 148 | **Refund Status** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 149 | **Buy Again** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 150 | **Reviews** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 151 | **Loyalty Wallet** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 152 | **Rewards** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 153 | **Referral** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 154 | **Notifications** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 155 | **Preferences** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 156 | **Support Center** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 157 | **FAQ** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 158 | **Contact Support** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 159 | **Support Ticket** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 160 | **Ticket Detail** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 161 | **Report Problem** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 162 | **Privacy Controls** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 163 | **Data Export** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 164 | **Delete Account** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 165 | **Login** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 166 | **Signup** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |

#### Content, Campaigns & Brand — 14 screens

**Purpose:** Customer-facing brand storytelling, collections and offers.

**Default UI sections:** Campaign hero → Collection story → Product merchandising → Editorial content → Offer blocks → FAQ → Newsletter

**Primary actions:** Explore collection, Shop campaign, Read article, Subscribe, Share

**Reusable modals/sheets:** Newsletter, Share, Video/lightbox

**Common filters:** Collection, Campaign, Article category

**Primary data:** Collection, Campaign, Page, BlogPost, Product, Promotion

| # | Screen | Key UI / behavior |
|---:|---|---|
| 167 | **About Brand** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 168 | **Our Story** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 169 | **Sustainability** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 170 | **Journal** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 171 | **Article Detail** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 172 | **Campaign Detail** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 173 | **Collection Story** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 174 | **Lookbook** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 175 | **Gift Guide** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 176 | **Size Guide** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 177 | **Shipping Policy** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 178 | **Returns Policy** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 179 | **Privacy Policy** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 180 | **Terms** | Dense data or product content, contextual actions, validation, confirmation feedback. |

### Merchant Admin

**Screen target: 312+**

#### Dashboard & Analytics — 28 screens

**Purpose:** Merchant performance, KPIs, trends and operational alerts.

**Default UI sections:** KPI cards → Revenue chart → Orders chart → Funnel → Top products → Top categories → Customer growth → Inventory alerts → Recent orders

**Primary actions:** Change period, Compare period, Export, Open report, Drill down

**Reusable modals/sheets:** Metric definition, Export options, Date range picker

**Common filters:** Date, Channel, Region, Category, Product, Customer segment

**Primary data:** Order, OrderItem, Customer, Product, InventoryMovement, AnalyticsEvent

| # | Screen | Key UI / behavior |
|---:|---|---|
| 181 | **Dashboard & Analytics Screen 001** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 182 | **Dashboard & Analytics Screen 002** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 183 | **Dashboard & Analytics Screen 003** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 184 | **Dashboard & Analytics Screen 004** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 185 | **Dashboard & Analytics Screen 005** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 186 | **Dashboard & Analytics Screen 006** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 187 | **Dashboard & Analytics Screen 007** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 188 | **Dashboard & Analytics Screen 008** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 189 | **Dashboard & Analytics Screen 009** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 190 | **Dashboard & Analytics Screen 010** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 191 | **Dashboard & Analytics Screen 011** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 192 | **Dashboard & Analytics Screen 012** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 193 | **Dashboard & Analytics Screen 013** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 194 | **Dashboard & Analytics Screen 014** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 195 | **Dashboard & Analytics Screen 015** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 196 | **Dashboard & Analytics Screen 016** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 197 | **Dashboard & Analytics Screen 017** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 198 | **Dashboard & Analytics Screen 018** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 199 | **Dashboard & Analytics Screen 019** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 200 | **Dashboard & Analytics Screen 020** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 201 | **Dashboard & Analytics Screen 021** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 202 | **Dashboard & Analytics Screen 022** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 203 | **Dashboard & Analytics Screen 023** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 204 | **Dashboard & Analytics Screen 024** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 205 | **Dashboard & Analytics Screen 025** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 206 | **Dashboard & Analytics Screen 026** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 207 | **Dashboard & Analytics Screen 027** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 208 | **Dashboard & Analytics Screen 028** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |

#### Catalog & Merchandising — 52 screens

**Purpose:** Universal catalog management for any product type.

**Default UI sections:** Product table → Bulk actions → Product editor → Variants → Attributes → Media → Pricing → SEO → Collections → Publishing

**Primary actions:** Create, Edit, Duplicate, Archive, Publish, Bulk edit, Import, Export, Preview

**Reusable modals/sheets:** Product form, Variant builder, Attribute selector, Media picker, Bulk edit, Delete/archive confirmation

**Common filters:** Status, Category, Brand, Collection, Inventory, Price, Created date, Tags

**Primary data:** Product, ProductVariant, AttributeDefinition, Brand, Category, Collection, MediaAsset, PriceList

| # | Screen | Key UI / behavior |
|---:|---|---|
| 209 | **Catalog & Merchandising Screen 001** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 210 | **Catalog & Merchandising Screen 002** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 211 | **Catalog & Merchandising Screen 003** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 212 | **Catalog & Merchandising Screen 004** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 213 | **Catalog & Merchandising Screen 005** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 214 | **Catalog & Merchandising Screen 006** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 215 | **Catalog & Merchandising Screen 007** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 216 | **Catalog & Merchandising Screen 008** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 217 | **Catalog & Merchandising Screen 009** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 218 | **Catalog & Merchandising Screen 010** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 219 | **Catalog & Merchandising Screen 011** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 220 | **Catalog & Merchandising Screen 012** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 221 | **Catalog & Merchandising Screen 013** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 222 | **Catalog & Merchandising Screen 014** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 223 | **Catalog & Merchandising Screen 015** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 224 | **Catalog & Merchandising Screen 016** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 225 | **Catalog & Merchandising Screen 017** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 226 | **Catalog & Merchandising Screen 018** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 227 | **Catalog & Merchandising Screen 019** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 228 | **Catalog & Merchandising Screen 020** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 229 | **Catalog & Merchandising Screen 021** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 230 | **Catalog & Merchandising Screen 022** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 231 | **Catalog & Merchandising Screen 023** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 232 | **Catalog & Merchandising Screen 024** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 233 | **Catalog & Merchandising Screen 025** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 234 | **Catalog & Merchandising Screen 026** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 235 | **Catalog & Merchandising Screen 027** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 236 | **Catalog & Merchandising Screen 028** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 237 | **Catalog & Merchandising Screen 029** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 238 | **Catalog & Merchandising Screen 030** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 239 | **Catalog & Merchandising Screen 031** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 240 | **Catalog & Merchandising Screen 032** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 241 | **Catalog & Merchandising Screen 033** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 242 | **Catalog & Merchandising Screen 034** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 243 | **Catalog & Merchandising Screen 035** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 244 | **Catalog & Merchandising Screen 036** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 245 | **Catalog & Merchandising Screen 037** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 246 | **Catalog & Merchandising Screen 038** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 247 | **Catalog & Merchandising Screen 039** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 248 | **Catalog & Merchandising Screen 040** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 249 | **Catalog & Merchandising Screen 041** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 250 | **Catalog & Merchandising Screen 042** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 251 | **Catalog & Merchandising Screen 043** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 252 | **Catalog & Merchandising Screen 044** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 253 | **Catalog & Merchandising Screen 045** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 254 | **Catalog & Merchandising Screen 046** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 255 | **Catalog & Merchandising Screen 047** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 256 | **Catalog & Merchandising Screen 048** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 257 | **Catalog & Merchandising Screen 049** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 258 | **Catalog & Merchandising Screen 050** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 259 | **Catalog & Merchandising Screen 051** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 260 | **Catalog & Merchandising Screen 052** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |

#### Inventory & Warehousing — 28 screens

**Purpose:** Stock visibility, movements, replenishment and warehouse operations.

**Default UI sections:** Inventory KPIs → Stock table → Warehouse selector → Movement ledger → Transfers → Purchase orders → Suppliers → Low-stock alerts

**Primary actions:** Adjust stock, Transfer, Receive, Create purchase order, Export, Set reorder rule

**Reusable modals/sheets:** Stock adjustment, Transfer form, Receive shipment, Purchase order form, Reorder rule

**Common filters:** Warehouse, SKU, Product, Stock status, Supplier, Movement type

**Primary data:** Inventory, InventoryMovement, Warehouse, StockTransfer, PurchaseOrder, Supplier, ReorderRule

| # | Screen | Key UI / behavior |
|---:|---|---|
| 261 | **Inventory & Warehousing Screen 001** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 262 | **Inventory & Warehousing Screen 002** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 263 | **Inventory & Warehousing Screen 003** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 264 | **Inventory & Warehousing Screen 004** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 265 | **Inventory & Warehousing Screen 005** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 266 | **Inventory & Warehousing Screen 006** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 267 | **Inventory & Warehousing Screen 007** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 268 | **Inventory & Warehousing Screen 008** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 269 | **Inventory & Warehousing Screen 009** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 270 | **Inventory & Warehousing Screen 010** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 271 | **Inventory & Warehousing Screen 011** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 272 | **Inventory & Warehousing Screen 012** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 273 | **Inventory & Warehousing Screen 013** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 274 | **Inventory & Warehousing Screen 014** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 275 | **Inventory & Warehousing Screen 015** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 276 | **Inventory & Warehousing Screen 016** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 277 | **Inventory & Warehousing Screen 017** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 278 | **Inventory & Warehousing Screen 018** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 279 | **Inventory & Warehousing Screen 019** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 280 | **Inventory & Warehousing Screen 020** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 281 | **Inventory & Warehousing Screen 021** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 282 | **Inventory & Warehousing Screen 022** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 283 | **Inventory & Warehousing Screen 023** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 284 | **Inventory & Warehousing Screen 024** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 285 | **Inventory & Warehousing Screen 025** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 286 | **Inventory & Warehousing Screen 026** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 287 | **Inventory & Warehousing Screen 027** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 288 | **Inventory & Warehousing Screen 028** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |

#### Orders, Fulfillment & Returns — 42 screens

**Purpose:** Order operations from payment confirmation through delivery and returns.

**Default UI sections:** Order queue → Order detail → Fulfillment → Shipment → Return/RMA → Refund → Timeline → Customer communication

**Primary actions:** Confirm, Pack, Ship, Print label, Cancel, Approve return, Refund, Exchange, Add note

**Reusable modals/sheets:** Status change, Refund, Return approval, Address change, Shipment booking, Internal note

**Common filters:** Status, Payment status, Fulfillment, Date, Customer, Channel, Warehouse

**Primary data:** Order, OrderItem, Payment, Shipment, Return, Refund, OrderStatusHistory

| # | Screen | Key UI / behavior |
|---:|---|---|
| 289 | **Orders, Fulfillment & Returns Screen 001** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 290 | **Orders, Fulfillment & Returns Screen 002** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 291 | **Orders, Fulfillment & Returns Screen 003** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 292 | **Orders, Fulfillment & Returns Screen 004** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 293 | **Orders, Fulfillment & Returns Screen 005** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 294 | **Orders, Fulfillment & Returns Screen 006** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 295 | **Orders, Fulfillment & Returns Screen 007** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 296 | **Orders, Fulfillment & Returns Screen 008** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 297 | **Orders, Fulfillment & Returns Screen 009** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 298 | **Orders, Fulfillment & Returns Screen 010** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 299 | **Orders, Fulfillment & Returns Screen 011** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 300 | **Orders, Fulfillment & Returns Screen 012** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 301 | **Orders, Fulfillment & Returns Screen 013** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 302 | **Orders, Fulfillment & Returns Screen 014** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 303 | **Orders, Fulfillment & Returns Screen 015** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 304 | **Orders, Fulfillment & Returns Screen 016** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 305 | **Orders, Fulfillment & Returns Screen 017** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 306 | **Orders, Fulfillment & Returns Screen 018** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 307 | **Orders, Fulfillment & Returns Screen 019** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 308 | **Orders, Fulfillment & Returns Screen 020** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 309 | **Orders, Fulfillment & Returns Screen 021** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 310 | **Orders, Fulfillment & Returns Screen 022** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 311 | **Orders, Fulfillment & Returns Screen 023** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 312 | **Orders, Fulfillment & Returns Screen 024** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 313 | **Orders, Fulfillment & Returns Screen 025** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 314 | **Orders, Fulfillment & Returns Screen 026** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 315 | **Orders, Fulfillment & Returns Screen 027** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 316 | **Orders, Fulfillment & Returns Screen 028** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 317 | **Orders, Fulfillment & Returns Screen 029** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 318 | **Orders, Fulfillment & Returns Screen 030** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 319 | **Orders, Fulfillment & Returns Screen 031** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 320 | **Orders, Fulfillment & Returns Screen 032** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 321 | **Orders, Fulfillment & Returns Screen 033** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 322 | **Orders, Fulfillment & Returns Screen 034** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 323 | **Orders, Fulfillment & Returns Screen 035** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 324 | **Orders, Fulfillment & Returns Screen 036** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 325 | **Orders, Fulfillment & Returns Screen 037** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 326 | **Orders, Fulfillment & Returns Screen 038** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 327 | **Orders, Fulfillment & Returns Screen 039** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 328 | **Orders, Fulfillment & Returns Screen 040** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 329 | **Orders, Fulfillment & Returns Screen 041** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 330 | **Orders, Fulfillment & Returns Screen 042** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |

#### Customers & CRM — 22 screens

**Purpose:** Customer profiles, segmentation, retention and support context.

**Default UI sections:** Customer list → Profile → Order history → Segments → Tags → Notes → Communication → LTV/cohort metrics

**Primary actions:** Create customer, Edit, Tag, Segment, Send message, View orders, Issue store credit

**Reusable modals/sheets:** Customer form, Segment builder, Send message, Store credit, Delete/anonymize

**Common filters:** Segment, Spend, Order count, Last order, Location, Tags, Consent

**Primary data:** Customer, Address, Order, Segment, CustomerTag, Consent, SupportTicket

| # | Screen | Key UI / behavior |
|---:|---|---|
| 331 | **Customers & CRM Screen 001** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 332 | **Customers & CRM Screen 002** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 333 | **Customers & CRM Screen 003** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 334 | **Customers & CRM Screen 004** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 335 | **Customers & CRM Screen 005** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 336 | **Customers & CRM Screen 006** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 337 | **Customers & CRM Screen 007** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 338 | **Customers & CRM Screen 008** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 339 | **Customers & CRM Screen 009** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 340 | **Customers & CRM Screen 010** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 341 | **Customers & CRM Screen 011** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 342 | **Customers & CRM Screen 012** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 343 | **Customers & CRM Screen 013** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 344 | **Customers & CRM Screen 014** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 345 | **Customers & CRM Screen 015** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 346 | **Customers & CRM Screen 016** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 347 | **Customers & CRM Screen 017** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 348 | **Customers & CRM Screen 018** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 349 | **Customers & CRM Screen 019** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 350 | **Customers & CRM Screen 020** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 351 | **Customers & CRM Screen 021** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 352 | **Customers & CRM Screen 022** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |

#### Marketing, Promotions & Loyalty — 28 screens

**Purpose:** Coupons, campaigns, promotions, loyalty and lifecycle automation.

**Default UI sections:** Campaign list → Promotion editor → Coupon manager → Loyalty → Referral → Abandoned cart → Audience → Performance

**Primary actions:** Create campaign, Create coupon, Schedule, Pause, Duplicate, Send test, View results

**Reusable modals/sheets:** Coupon form, Audience builder, Campaign composer, Schedule picker, Promotion rules

**Common filters:** Campaign, Status, Audience, Channel, Date, Promotion type

**Primary data:** Campaign, Coupon, Promotion, AudienceSegment, LoyaltyProgram, LoyaltyLedger, Referral

| # | Screen | Key UI / behavior |
|---:|---|---|
| 353 | **Marketing, Promotions & Loyalty Screen 001** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 354 | **Marketing, Promotions & Loyalty Screen 002** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 355 | **Marketing, Promotions & Loyalty Screen 003** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 356 | **Marketing, Promotions & Loyalty Screen 004** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 357 | **Marketing, Promotions & Loyalty Screen 005** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 358 | **Marketing, Promotions & Loyalty Screen 006** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 359 | **Marketing, Promotions & Loyalty Screen 007** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 360 | **Marketing, Promotions & Loyalty Screen 008** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 361 | **Marketing, Promotions & Loyalty Screen 009** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 362 | **Marketing, Promotions & Loyalty Screen 010** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 363 | **Marketing, Promotions & Loyalty Screen 011** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 364 | **Marketing, Promotions & Loyalty Screen 012** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 365 | **Marketing, Promotions & Loyalty Screen 013** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 366 | **Marketing, Promotions & Loyalty Screen 014** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 367 | **Marketing, Promotions & Loyalty Screen 015** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 368 | **Marketing, Promotions & Loyalty Screen 016** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 369 | **Marketing, Promotions & Loyalty Screen 017** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 370 | **Marketing, Promotions & Loyalty Screen 018** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 371 | **Marketing, Promotions & Loyalty Screen 019** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 372 | **Marketing, Promotions & Loyalty Screen 020** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 373 | **Marketing, Promotions & Loyalty Screen 021** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 374 | **Marketing, Promotions & Loyalty Screen 022** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 375 | **Marketing, Promotions & Loyalty Screen 023** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 376 | **Marketing, Promotions & Loyalty Screen 024** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 377 | **Marketing, Promotions & Loyalty Screen 025** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 378 | **Marketing, Promotions & Loyalty Screen 026** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 379 | **Marketing, Promotions & Loyalty Screen 027** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 380 | **Marketing, Promotions & Loyalty Screen 028** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |

#### Content & Storefront Builder — 30 screens

**Purpose:** No-code/low-code storefront customization and content publishing.

**Default UI sections:** Theme gallery → Theme settings → Visual page builder → Section library → Navigation → Pages → Blog → SEO → Preview/publish

**Primary actions:** Choose theme, Edit, Add section, Reorder, Preview, Publish, Schedule publish, Duplicate

**Reusable modals/sheets:** Section picker, Media library, Page settings, SEO editor, Publish confirmation

**Common filters:** Page type, Status, Author, Updated date

**Primary data:** Theme, ThemeVersion, Page, PageSection, NavigationMenu, MediaAsset, BlogPost

| # | Screen | Key UI / behavior |
|---:|---|---|
| 381 | **Content & Storefront Builder Screen 001** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 382 | **Content & Storefront Builder Screen 002** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 383 | **Content & Storefront Builder Screen 003** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 384 | **Content & Storefront Builder Screen 004** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 385 | **Content & Storefront Builder Screen 005** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 386 | **Content & Storefront Builder Screen 006** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 387 | **Content & Storefront Builder Screen 007** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 388 | **Content & Storefront Builder Screen 008** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 389 | **Content & Storefront Builder Screen 009** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 390 | **Content & Storefront Builder Screen 010** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 391 | **Content & Storefront Builder Screen 011** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 392 | **Content & Storefront Builder Screen 012** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 393 | **Content & Storefront Builder Screen 013** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 394 | **Content & Storefront Builder Screen 014** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 395 | **Content & Storefront Builder Screen 015** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 396 | **Content & Storefront Builder Screen 016** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 397 | **Content & Storefront Builder Screen 017** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 398 | **Content & Storefront Builder Screen 018** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 399 | **Content & Storefront Builder Screen 019** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 400 | **Content & Storefront Builder Screen 020** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 401 | **Content & Storefront Builder Screen 021** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 402 | **Content & Storefront Builder Screen 022** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 403 | **Content & Storefront Builder Screen 023** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 404 | **Content & Storefront Builder Screen 024** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 405 | **Content & Storefront Builder Screen 025** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 406 | **Content & Storefront Builder Screen 026** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 407 | **Content & Storefront Builder Screen 027** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 408 | **Content & Storefront Builder Screen 028** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 409 | **Content & Storefront Builder Screen 029** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 410 | **Content & Storefront Builder Screen 030** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |

#### Finance, Tax & Payments — 20 screens

**Purpose:** Payment configuration, transaction reconciliation, taxes and financial documents.

**Default UI sections:** Payment overview → Transactions → Payouts → Refunds → Tax settings → Invoices → Credit notes → Reconciliation

**Primary actions:** Capture, Refund, Export, Configure gateway, Reconcile, Download invoice

**Reusable modals/sheets:** Gateway settings, Refund form, Tax rule form, Invoice preview

**Common filters:** Date, Gateway, Status, Currency, Tax region, Order

**Primary data:** Payment, PaymentMethod, Payout, Refund, TaxRule, Invoice, CreditNote

| # | Screen | Key UI / behavior |
|---:|---|---|
| 411 | **Finance, Tax & Payments Screen 001** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 412 | **Finance, Tax & Payments Screen 002** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 413 | **Finance, Tax & Payments Screen 003** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 414 | **Finance, Tax & Payments Screen 004** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 415 | **Finance, Tax & Payments Screen 005** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 416 | **Finance, Tax & Payments Screen 006** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 417 | **Finance, Tax & Payments Screen 007** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 418 | **Finance, Tax & Payments Screen 008** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 419 | **Finance, Tax & Payments Screen 009** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 420 | **Finance, Tax & Payments Screen 010** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 421 | **Finance, Tax & Payments Screen 011** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 422 | **Finance, Tax & Payments Screen 012** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 423 | **Finance, Tax & Payments Screen 013** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 424 | **Finance, Tax & Payments Screen 014** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 425 | **Finance, Tax & Payments Screen 015** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 426 | **Finance, Tax & Payments Screen 016** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 427 | **Finance, Tax & Payments Screen 017** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 428 | **Finance, Tax & Payments Screen 018** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 429 | **Finance, Tax & Payments Screen 019** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 430 | **Finance, Tax & Payments Screen 020** | Dense data or product content, contextual actions, validation, confirmation feedback. |

#### Shipping & Delivery — 18 screens

**Purpose:** Shipping zones, rates, carriers, labels, tracking and delivery SLAs.

**Default UI sections:** Shipping overview → Zones → Rates → Carriers → Shipments → Tracking → Pickup settings

**Primary actions:** Add zone, Add rate, Connect carrier, Book shipment, Print label, Track

**Reusable modals/sheets:** Zone form, Rate calculator, Carrier connection, Shipment booking

**Common filters:** Zone, Carrier, Status, Service, Date

**Primary data:** ShippingZone, ShippingRate, Carrier, Shipment, TrackingEvent, PickupLocation

| # | Screen | Key UI / behavior |
|---:|---|---|
| 431 | **Shipping & Delivery Screen 001** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 432 | **Shipping & Delivery Screen 002** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 433 | **Shipping & Delivery Screen 003** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 434 | **Shipping & Delivery Screen 004** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 435 | **Shipping & Delivery Screen 005** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 436 | **Shipping & Delivery Screen 006** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 437 | **Shipping & Delivery Screen 007** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 438 | **Shipping & Delivery Screen 008** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 439 | **Shipping & Delivery Screen 009** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 440 | **Shipping & Delivery Screen 010** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 441 | **Shipping & Delivery Screen 011** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 442 | **Shipping & Delivery Screen 012** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 443 | **Shipping & Delivery Screen 013** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 444 | **Shipping & Delivery Screen 014** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 445 | **Shipping & Delivery Screen 015** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 446 | **Shipping & Delivery Screen 016** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 447 | **Shipping & Delivery Screen 017** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 448 | **Shipping & Delivery Screen 018** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |

#### Staff, Security & Settings — 26 screens

**Purpose:** Merchant governance, permissions, store settings and security controls.

**Default UI sections:** Store settings → Staff → Roles → Permissions → Security → Domains → Notifications → Policies → Localization

**Primary actions:** Invite staff, Create role, Change permission, Connect domain, Rotate key, Save settings

**Reusable modals/sheets:** Invite staff, Role editor, Domain setup, API key confirmation, Delete store

**Common filters:** Role, Status, Permission, Event type

**Primary data:** Store, StaffMember, Role, Permission, Domain, AuditLog, NotificationRule

| # | Screen | Key UI / behavior |
|---:|---|---|
| 449 | **Staff, Security & Settings Screen 001** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 450 | **Staff, Security & Settings Screen 002** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 451 | **Staff, Security & Settings Screen 003** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 452 | **Staff, Security & Settings Screen 004** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 453 | **Staff, Security & Settings Screen 005** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 454 | **Staff, Security & Settings Screen 006** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 455 | **Staff, Security & Settings Screen 007** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 456 | **Staff, Security & Settings Screen 008** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 457 | **Staff, Security & Settings Screen 009** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 458 | **Staff, Security & Settings Screen 010** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 459 | **Staff, Security & Settings Screen 011** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 460 | **Staff, Security & Settings Screen 012** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 461 | **Staff, Security & Settings Screen 013** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 462 | **Staff, Security & Settings Screen 014** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 463 | **Staff, Security & Settings Screen 015** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 464 | **Staff, Security & Settings Screen 016** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 465 | **Staff, Security & Settings Screen 017** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 466 | **Staff, Security & Settings Screen 018** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 467 | **Staff, Security & Settings Screen 019** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 468 | **Staff, Security & Settings Screen 020** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 469 | **Staff, Security & Settings Screen 021** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 470 | **Staff, Security & Settings Screen 022** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 471 | **Staff, Security & Settings Screen 023** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 472 | **Staff, Security & Settings Screen 024** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 473 | **Staff, Security & Settings Screen 025** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 474 | **Staff, Security & Settings Screen 026** | Dense data or product content, contextual actions, validation, confirmation feedback. |

#### Integrations, API & Automations — 18 screens

**Purpose:** External integrations, API credentials, webhooks and automation rules.

**Default UI sections:** App catalog → Connected apps → API keys → Webhooks → Automation builder → Logs

**Primary actions:** Connect, Disconnect, Create key, Create webhook, Test, Enable automation

**Reusable modals/sheets:** Connection setup, API key reveal, Webhook test, Automation builder

**Common filters:** Integration, Status, Event, Date

**Primary data:** Integration, APIKey, Webhook, AutomationRule, AutomationRun, IntegrationLog

| # | Screen | Key UI / behavior |
|---:|---|---|
| 475 | **Integrations, API & Automations Screen 001** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 476 | **Integrations, API & Automations Screen 002** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 477 | **Integrations, API & Automations Screen 003** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 478 | **Integrations, API & Automations Screen 004** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 479 | **Integrations, API & Automations Screen 005** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 480 | **Integrations, API & Automations Screen 006** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 481 | **Integrations, API & Automations Screen 007** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 482 | **Integrations, API & Automations Screen 008** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 483 | **Integrations, API & Automations Screen 009** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 484 | **Integrations, API & Automations Screen 010** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 485 | **Integrations, API & Automations Screen 011** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 486 | **Integrations, API & Automations Screen 012** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 487 | **Integrations, API & Automations Screen 013** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 488 | **Integrations, API & Automations Screen 014** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 489 | **Integrations, API & Automations Screen 015** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 490 | **Integrations, API & Automations Screen 016** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 491 | **Integrations, API & Automations Screen 017** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 492 | **Integrations, API & Automations Screen 018** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |

### Super Admin

**Screen target: 84+**

#### Platform Dashboard & Operations — 20 screens

**Purpose:** SaaS-wide monitoring and operational control.

**Default UI sections:** MRR/ARR → GMV → Stores → Users → Growth → Churn → System health → Incidents → Recent activity

**Primary actions:** Open store, Suspend, Impersonate, Export, Investigate, Create incident

**Reusable modals/sheets:** Suspend tenant, Impersonation confirmation, Incident form

**Common filters:** Plan, Country, Status, Date, Risk level

**Primary data:** Store, Subscription, User, Order, Incident, AuditLog

| # | Screen | Key UI / behavior |
|---:|---|---|
| 493 | **Platform Dashboard & Operations Screen 001** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 494 | **Platform Dashboard & Operations Screen 002** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 495 | **Platform Dashboard & Operations Screen 003** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 496 | **Platform Dashboard & Operations Screen 004** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 497 | **Platform Dashboard & Operations Screen 005** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 498 | **Platform Dashboard & Operations Screen 006** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 499 | **Platform Dashboard & Operations Screen 007** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 500 | **Platform Dashboard & Operations Screen 008** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 501 | **Platform Dashboard & Operations Screen 009** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 502 | **Platform Dashboard & Operations Screen 010** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 503 | **Platform Dashboard & Operations Screen 011** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 504 | **Platform Dashboard & Operations Screen 012** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 505 | **Platform Dashboard & Operations Screen 013** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 506 | **Platform Dashboard & Operations Screen 014** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 507 | **Platform Dashboard & Operations Screen 015** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 508 | **Platform Dashboard & Operations Screen 016** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 509 | **Platform Dashboard & Operations Screen 017** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 510 | **Platform Dashboard & Operations Screen 018** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 511 | **Platform Dashboard & Operations Screen 019** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 512 | **Platform Dashboard & Operations Screen 020** | Dense data or product content, contextual actions, validation, confirmation feedback. |

#### Tenant/Store Management — 18 screens

**Purpose:** Tenant lifecycle, verification, configuration and support.

**Default UI sections:** Store list → Store profile → Plan → Usage → Domains → Owner/users → Activity → Support

**Primary actions:** Create store, Verify, Suspend, Upgrade, Reset settings, Open support

**Reusable modals/sheets:** Tenant form, Suspend, Plan change, Domain verification

**Common filters:** Status, Plan, Country, Created date, Usage

**Primary data:** Store, StoreDomain, StoreMember, Subscription, UsageMetric, Verification

| # | Screen | Key UI / behavior |
|---:|---|---|
| 513 | **Tenant/Store Management Screen 001** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 514 | **Tenant/Store Management Screen 002** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 515 | **Tenant/Store Management Screen 003** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 516 | **Tenant/Store Management Screen 004** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 517 | **Tenant/Store Management Screen 005** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 518 | **Tenant/Store Management Screen 006** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 519 | **Tenant/Store Management Screen 007** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 520 | **Tenant/Store Management Screen 008** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 521 | **Tenant/Store Management Screen 009** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 522 | **Tenant/Store Management Screen 010** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 523 | **Tenant/Store Management Screen 011** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 524 | **Tenant/Store Management Screen 012** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 525 | **Tenant/Store Management Screen 013** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 526 | **Tenant/Store Management Screen 014** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 527 | **Tenant/Store Management Screen 015** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 528 | **Tenant/Store Management Screen 016** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 529 | **Tenant/Store Management Screen 017** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 530 | **Tenant/Store Management Screen 018** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |

#### Subscriptions, Billing & Plans — 16 screens

**Purpose:** SaaS pricing plans, subscriptions, invoices, metering and entitlements.

**Default UI sections:** Plans → Plan editor → Subscriptions → Invoices → Usage → Entitlements → Billing events

**Primary actions:** Create plan, Edit, Change subscription, Refund, Export, Configure metering

**Reusable modals/sheets:** Plan form, Subscription change, Refund, Entitlement editor

**Common filters:** Plan, Status, Billing cycle, Date, Payment status

**Primary data:** Plan, Subscription, SubscriptionItem, Invoice, UsageMetric, Entitlement

| # | Screen | Key UI / behavior |
|---:|---|---|
| 531 | **Subscriptions, Billing & Plans Screen 001** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 532 | **Subscriptions, Billing & Plans Screen 002** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 533 | **Subscriptions, Billing & Plans Screen 003** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 534 | **Subscriptions, Billing & Plans Screen 004** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 535 | **Subscriptions, Billing & Plans Screen 005** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 536 | **Subscriptions, Billing & Plans Screen 006** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 537 | **Subscriptions, Billing & Plans Screen 007** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 538 | **Subscriptions, Billing & Plans Screen 008** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 539 | **Subscriptions, Billing & Plans Screen 009** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 540 | **Subscriptions, Billing & Plans Screen 010** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 541 | **Subscriptions, Billing & Plans Screen 011** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 542 | **Subscriptions, Billing & Plans Screen 012** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 543 | **Subscriptions, Billing & Plans Screen 013** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 544 | **Subscriptions, Billing & Plans Screen 014** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 545 | **Subscriptions, Billing & Plans Screen 015** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 546 | **Subscriptions, Billing & Plans Screen 016** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |

#### Platform Commerce & Risk — 16 screens

**Purpose:** Platform-wide orders, payments, commissions, payouts, fraud and disputes.

**Default UI sections:** GMV → Orders → Payments → Commissions → Payouts → Disputes → Fraud signals → Risk rules

**Primary actions:** Review transaction, Hold payout, Release payout, Resolve dispute, Edit risk rule

**Reusable modals/sheets:** Payout hold, Risk review, Dispute resolution

**Common filters:** Store, Risk, Payment status, Date, Currency

**Primary data:** Order, Payment, Commission, Payout, Dispute, RiskEvent

| # | Screen | Key UI / behavior |
|---:|---|---|
| 547 | **Platform Commerce & Risk Screen 001** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 548 | **Platform Commerce & Risk Screen 002** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 549 | **Platform Commerce & Risk Screen 003** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 550 | **Platform Commerce & Risk Screen 004** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 551 | **Platform Commerce & Risk Screen 005** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 552 | **Platform Commerce & Risk Screen 006** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 553 | **Platform Commerce & Risk Screen 007** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 554 | **Platform Commerce & Risk Screen 008** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 555 | **Platform Commerce & Risk Screen 009** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 556 | **Platform Commerce & Risk Screen 010** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 557 | **Platform Commerce & Risk Screen 011** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 558 | **Platform Commerce & Risk Screen 012** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 559 | **Platform Commerce & Risk Screen 013** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 560 | **Platform Commerce & Risk Screen 014** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 561 | **Platform Commerce & Risk Screen 015** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 562 | **Platform Commerce & Risk Screen 016** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |

#### Support, Content & System — 14 screens

**Purpose:** Platform support desk, global content, feature flags and system configuration.

**Default UI sections:** Support queue → Ticket detail → Knowledge base → Announcements → Feature flags → System settings → Audit

**Primary actions:** Assign ticket, Reply, Publish announcement, Toggle flag, Export audit

**Reusable modals/sheets:** Ticket reply, Feature flag editor, Announcement composer

**Common filters:** Priority, Status, Assignee, Feature area, Date

**Primary data:** SupportTicket, TicketMessage, KnowledgeArticle, Announcement, FeatureFlag, AuditLog

| # | Screen | Key UI / behavior |
|---:|---|---|
| 563 | **Support, Content & System Screen 001** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 564 | **Support, Content & System Screen 002** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 565 | **Support, Content & System Screen 003** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 566 | **Support, Content & System Screen 004** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 567 | **Support, Content & System Screen 005** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 568 | **Support, Content & System Screen 006** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 569 | **Support, Content & System Screen 007** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 570 | **Support, Content & System Screen 008** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 571 | **Support, Content & System Screen 009** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 572 | **Support, Content & System Screen 010** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 573 | **Support, Content & System Screen 011** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 574 | **Support, Content & System Screen 012** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 575 | **Support, Content & System Screen 013** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 576 | **Support, Content & System Screen 014** | Dense data or product content, contextual actions, validation, confirmation feedback. |

### Customer Mobile App

**Screen target: 70+**

#### Onboarding, Auth & Navigation — 16 screens

**Purpose:** Mobile sign-in, onboarding, permissions and global navigation.

**Default UI sections:** Splash → Welcome → Login → OTP → Consent → Home navigation → Account

**Primary actions:** Sign in, Continue, Verify OTP, Skip, Allow notification

**Reusable modals/sheets:** OTP, Permissions, Logout, Delete account

**Common filters:** Country, Language

**Primary data:** Customer, Session, Consent, Device

| # | Screen | Key UI / behavior |
|---:|---|---|
| 577 | **Onboarding, Auth & Navigation Screen 001** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 578 | **Onboarding, Auth & Navigation Screen 002** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 579 | **Onboarding, Auth & Navigation Screen 003** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 580 | **Onboarding, Auth & Navigation Screen 004** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 581 | **Onboarding, Auth & Navigation Screen 005** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 582 | **Onboarding, Auth & Navigation Screen 006** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 583 | **Onboarding, Auth & Navigation Screen 007** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 584 | **Onboarding, Auth & Navigation Screen 008** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 585 | **Onboarding, Auth & Navigation Screen 009** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 586 | **Onboarding, Auth & Navigation Screen 010** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 587 | **Onboarding, Auth & Navigation Screen 011** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 588 | **Onboarding, Auth & Navigation Screen 012** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 589 | **Onboarding, Auth & Navigation Screen 013** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 590 | **Onboarding, Auth & Navigation Screen 014** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 591 | **Onboarding, Auth & Navigation Screen 015** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 592 | **Onboarding, Auth & Navigation Screen 016** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |

#### Discovery & Shopping — 24 screens

**Purpose:** Mobile product discovery, search, personalization and product evaluation.

**Default UI sections:** Home feed → Categories → Search → Filters → Product grid → Product detail → Reviews → Recommendations

**Primary actions:** Search, Filter, Wishlist, Add to cart, Buy now, Share

**Reusable modals/sheets:** Filter sheet, Sort sheet, Size/attribute guide, Quick view

**Common filters:** Category, Price, Attributes, Rating, Brand

**Primary data:** Product, Variant, Collection, SearchQuery, Wishlist

| # | Screen | Key UI / behavior |
|---:|---|---|
| 593 | **Discovery & Shopping Screen 001** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 594 | **Discovery & Shopping Screen 002** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 595 | **Discovery & Shopping Screen 003** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 596 | **Discovery & Shopping Screen 004** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 597 | **Discovery & Shopping Screen 005** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 598 | **Discovery & Shopping Screen 006** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 599 | **Discovery & Shopping Screen 007** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 600 | **Discovery & Shopping Screen 008** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 601 | **Discovery & Shopping Screen 009** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 602 | **Discovery & Shopping Screen 010** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 603 | **Discovery & Shopping Screen 011** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 604 | **Discovery & Shopping Screen 012** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 605 | **Discovery & Shopping Screen 013** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 606 | **Discovery & Shopping Screen 014** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 607 | **Discovery & Shopping Screen 015** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 608 | **Discovery & Shopping Screen 016** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 609 | **Discovery & Shopping Screen 017** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 610 | **Discovery & Shopping Screen 018** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 611 | **Discovery & Shopping Screen 019** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 612 | **Discovery & Shopping Screen 020** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 613 | **Discovery & Shopping Screen 021** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 614 | **Discovery & Shopping Screen 022** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 615 | **Discovery & Shopping Screen 023** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 616 | **Discovery & Shopping Screen 024** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |

#### Cart, Checkout & Payment — 14 screens

**Purpose:** Mobile checkout and payment completion.

**Default UI sections:** Cart → Coupon → Address → Delivery → Payment → Review → Confirmation

**Primary actions:** Apply coupon, Select address, Pay, Place order, Track

**Reusable modals/sheets:** Address form, Payment sheet, Coupon picker, Failure/retry

**Common filters:** Shipping method, Payment method

**Primary data:** Cart, Order, Payment, Address, Shipment

| # | Screen | Key UI / behavior |
|---:|---|---|
| 617 | **Cart, Checkout & Payment Screen 001** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 618 | **Cart, Checkout & Payment Screen 002** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 619 | **Cart, Checkout & Payment Screen 003** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 620 | **Cart, Checkout & Payment Screen 004** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 621 | **Cart, Checkout & Payment Screen 005** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 622 | **Cart, Checkout & Payment Screen 006** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 623 | **Cart, Checkout & Payment Screen 007** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 624 | **Cart, Checkout & Payment Screen 008** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 625 | **Cart, Checkout & Payment Screen 009** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 626 | **Cart, Checkout & Payment Screen 010** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 627 | **Cart, Checkout & Payment Screen 011** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 628 | **Cart, Checkout & Payment Screen 012** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 629 | **Cart, Checkout & Payment Screen 013** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 630 | **Cart, Checkout & Payment Screen 014** | Dense data or product content, contextual actions, validation, confirmation feedback. |

#### Account, Orders & Loyalty — 16 screens

**Purpose:** Mobile customer self-service, order tracking and retention.

**Default UI sections:** Profile → Orders → Tracking → Returns → Wishlist → Loyalty → Notifications → Support

**Primary actions:** Track, Return, Buy again, Redeem, Contact support

**Reusable modals/sheets:** Return request, Address, Profile edit

**Common filters:** Order status, Date

**Primary data:** Customer, Order, Return, LoyaltyLedger, Notification

| # | Screen | Key UI / behavior |
|---:|---|---|
| 631 | **Account, Orders & Loyalty Screen 001** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 632 | **Account, Orders & Loyalty Screen 002** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 633 | **Account, Orders & Loyalty Screen 003** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 634 | **Account, Orders & Loyalty Screen 004** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 635 | **Account, Orders & Loyalty Screen 005** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 636 | **Account, Orders & Loyalty Screen 006** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 637 | **Account, Orders & Loyalty Screen 007** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 638 | **Account, Orders & Loyalty Screen 008** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 639 | **Account, Orders & Loyalty Screen 009** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 640 | **Account, Orders & Loyalty Screen 010** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 641 | **Account, Orders & Loyalty Screen 011** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 642 | **Account, Orders & Loyalty Screen 012** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 643 | **Account, Orders & Loyalty Screen 013** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 644 | **Account, Orders & Loyalty Screen 014** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 645 | **Account, Orders & Loyalty Screen 015** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 646 | **Account, Orders & Loyalty Screen 016** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |

### Merchant Mobile App

**Screen target: 50+**

#### Onboarding & Dashboard — 12 screens

**Purpose:** Merchant mobile setup and real-time store operations.

**Default UI sections:** Store select → Dashboard KPIs → Revenue → Orders → Alerts → Quick actions

**Primary actions:** Open order, Add product, Adjust stock, View report

**Reusable modals/sheets:** Store switcher, Date range, Alert detail

**Common filters:** Date, Store, Channel

**Primary data:** Store, Order, Product, Inventory, AnalyticsEvent

| # | Screen | Key UI / behavior |
|---:|---|---|
| 647 | **Onboarding & Dashboard Screen 001** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 648 | **Onboarding & Dashboard Screen 002** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 649 | **Onboarding & Dashboard Screen 003** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 650 | **Onboarding & Dashboard Screen 004** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 651 | **Onboarding & Dashboard Screen 005** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 652 | **Onboarding & Dashboard Screen 006** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 653 | **Onboarding & Dashboard Screen 007** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 654 | **Onboarding & Dashboard Screen 008** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 655 | **Onboarding & Dashboard Screen 009** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 656 | **Onboarding & Dashboard Screen 010** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 657 | **Onboarding & Dashboard Screen 011** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 658 | **Onboarding & Dashboard Screen 012** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |

#### Products & Inventory — 16 screens

**Purpose:** Mobile catalog and stock operations.

**Default UI sections:** Product list → Product editor → Barcode scan → Stock → Transfers → Low stock

**Primary actions:** Create, Edit, Scan, Adjust stock, Transfer

**Reusable modals/sheets:** Product form, Scanner, Stock adjustment, Transfer

**Common filters:** Status, Category, Stock

**Primary data:** Product, Variant, Inventory, Warehouse, InventoryMovement

| # | Screen | Key UI / behavior |
|---:|---|---|
| 659 | **Products & Inventory Screen 001** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 660 | **Products & Inventory Screen 002** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 661 | **Products & Inventory Screen 003** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 662 | **Products & Inventory Screen 004** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 663 | **Products & Inventory Screen 005** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 664 | **Products & Inventory Screen 006** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 665 | **Products & Inventory Screen 007** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 666 | **Products & Inventory Screen 008** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 667 | **Products & Inventory Screen 009** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 668 | **Products & Inventory Screen 010** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 669 | **Products & Inventory Screen 011** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 670 | **Products & Inventory Screen 012** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 671 | **Products & Inventory Screen 013** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 672 | **Products & Inventory Screen 014** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 673 | **Products & Inventory Screen 015** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 674 | **Products & Inventory Screen 016** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |

#### Orders & Fulfillment — 12 screens

**Purpose:** Fast order processing and fulfillment from a phone.

**Default UI sections:** Order queue → Order detail → Pack → Ship → Return → Refund

**Primary actions:** Confirm, Pack, Ship, Refund, Call customer

**Reusable modals/sheets:** Status change, Shipment booking, Refund

**Common filters:** Order status, Payment, Warehouse

**Primary data:** Order, Payment, Shipment, Return

| # | Screen | Key UI / behavior |
|---:|---|---|
| 675 | **Orders & Fulfillment Screen 001** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 676 | **Orders & Fulfillment Screen 002** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 677 | **Orders & Fulfillment Screen 003** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 678 | **Orders & Fulfillment Screen 004** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 679 | **Orders & Fulfillment Screen 005** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 680 | **Orders & Fulfillment Screen 006** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 681 | **Orders & Fulfillment Screen 007** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 682 | **Orders & Fulfillment Screen 008** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 683 | **Orders & Fulfillment Screen 009** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 684 | **Orders & Fulfillment Screen 010** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 685 | **Orders & Fulfillment Screen 011** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 686 | **Orders & Fulfillment Screen 012** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |

#### Customers, Marketing & Alerts — 10 screens

**Purpose:** Merchant mobile CRM, campaigns and operational notifications.

**Default UI sections:** Customer list → Customer detail → Campaigns → Coupons → Alerts → Notifications

**Primary actions:** Message, Tag, Create coupon, Launch campaign, Acknowledge alert

**Reusable modals/sheets:** Customer edit, Campaign, Coupon, Alert detail

**Common filters:** Segment, Campaign, Status

**Primary data:** Customer, Segment, Campaign, Coupon, Notification

| # | Screen | Key UI / behavior |
|---:|---|---|
| 687 | **Customers, Marketing & Alerts Screen 001** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 688 | **Customers, Marketing & Alerts Screen 002** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 689 | **Customers, Marketing & Alerts Screen 003** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 690 | **Customers, Marketing & Alerts Screen 004** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |
| 691 | **Customers, Marketing & Alerts Screen 005** | SEO/accessibility metadata where customer-facing; skeleton loaders for network-bound content. |
| 692 | **Customers, Marketing & Alerts Screen 006** | Permission-aware visibility, feature flags where relevant, and graceful unavailable-state handling. |
| 693 | **Customers, Marketing & Alerts Screen 007** | Responsive header/navigation, contextual breadcrumbs, primary CTA, loading/empty/error states. |
| 694 | **Customers, Marketing & Alerts Screen 008** | Dense data or product content, contextual actions, validation, confirmation feedback. |
| 695 | **Customers, Marketing & Alerts Screen 009** | Mobile drawer/bottom-sheet adaptation, keyboard accessibility, touch-friendly targets. |
| 696 | **Customers, Marketing & Alerts Screen 010** | Supports create/edit/view state, optimistic UI where safe, toast notifications and auditability. |

## 3. Global UI State Requirements

- Every async page: initial loading, skeleton, success, empty, partial-data, network error, authorization error and retry state.
- Every destructive action: explicit confirmation, impact text, cancel path and success/failure toast.
- Every form: client validation, server validation mapping, disabled/submitting state, success state and recovery.
- Every list/table: search, filters, sort, pagination/load-more, bulk actions, column visibility where relevant.
- Every modal/drawer: focus trap, ESC/back handling, scroll locking, accessible labeling and mobile-safe layout.
- Every customer transaction: idempotency protection, optimistic UX where safe, server confirmation before irreversible actions.
- Every merchant mutation: audit event and permission check.

## 4. Universal Product Model

```ts
type Product = {
  id: string
  storeId: string
  name: string
  slug: string
  description: string
  shortDescription?: string

  productType: "physical" | "digital" | "service" | "subscription" | "bundle"
  categoryId: string
  brandId?: string
  collectionIds: string[]

  media: MediaAsset[]
  variants: ProductVariant[]
  attributes: Record<string, string | number | boolean | string[]>

  pricing: {
    price: Money
    compareAtPrice?: Money
    costPrice?: Money
    taxClassId?: string
  }

  inventory: {
    trackInventory: boolean
    allowBackorder: boolean
    quantityPolicy: "deny" | "allow"
  }

  shipping: {
    required: boolean
    weight?: number
    dimensions?: Dimensions
  }

  seo: SEORecord
  status: "draft" | "active" | "archived"
  flags: {
    featured: boolean
    new: boolean
    bestseller: boolean
    sale: boolean
  }

  createdAt: string
  updatedAt: string
}
```

### Dynamic attribute examples

| Industry | Attributes |
|---|---|
| Fashion | size, color, fit, fabric, pattern, gender |
| Electronics | RAM, storage, processor, screen, battery, warranty |
| Furniture | material, width, height, depth, finish, room |
| Grocery | weight, ingredients, dietary flags, expiry, packaging |
| Beauty | shade, skin/hair type, finish, volume, ingredients |
| Sports | size, sport, level, material, gender |

## 5. Database Entity Blueprint

Implement these entities with tenant scoping (`storeId` or `tenantId`) on all merchant-owned data.

### Identity & Tenancy

`User`, `Session`, `MFAFactor`, `Device`, `Consent`, `Store`, `StoreMember`, `Role`, `Permission`, `RolePermission`, `StoreDomain`, `StoreSetting`, `AuditLog`, `FeatureFlag`

### Catalog

`Product`, `ProductVariant`, `ProductOption`, `AttributeDefinition`, `AttributeValue`, `ProductAttribute`, `Category`, `CategoryRule`, `Brand`, `Collection`, `Tag`, `ProductTag`, `MediaAsset`, `ProductMedia`, `PriceList`, `ProductPrice`, `ProductBundle`, `BundleItem`, `DigitalAsset`, `SubscriptionProduct`

### Inventory & Procurement

`Warehouse`, `WarehouseLocation`, `Inventory`, `InventoryMovement`, `StockTransfer`, `StockTransferItem`, `ReorderRule`, `Supplier`, `PurchaseOrder`, `PurchaseOrderItem`, `GoodsReceipt`, `GoodsReceiptItem`, `InventoryReservation`

### Customers & CRM

`Customer`, `Address`, `CustomerTag`, `CustomerSegment`, `SegmentMembership`, `CustomerNote`, `ConsentRecord`, `StoreCreditAccount`, `StoreCreditTransaction`, `Wishlist`, `WishlistItem`, `RecentlyViewed`

### Commerce

`Cart`, `CartItem`, `CheckoutSession`, `Order`, `OrderItem`, `OrderAddress`, `OrderStatusHistory`, `OrderNote`, `OrderAdjustment`, `GiftCard`, `GiftCardTransaction`, `Coupon`, `CouponCode`, `Promotion`, `PromotionRule`, `PromotionRedemption`

### Payments & Finance

`Payment`, `PaymentAttempt`, `PaymentMethod`, `Payout`, `PayoutItem`, `Refund`, `TaxRule`, `TaxRate`, `Invoice`, `InvoiceLine`, `CreditNote`, `Commission`, `ReconciliationBatch`, `FinancialTransaction`

### Shipping

`ShippingZone`, `ShippingZoneRule`, `ShippingRate`, `Carrier`, `CarrierService`, `Shipment`, `ShipmentItem`, `TrackingEvent`, `PickupLocation`, `DeliverySlot`

### Engagement

`Review`, `ReviewMedia`, `ReviewVote`, `ProductQuestion`, `QuestionAnswer`, `Notification`, `NotificationPreference`, `NotificationTemplate`, `Campaign`, `CampaignRecipient`, `AutomationRule`, `AutomationRun`, `Referral`, `ReferralEvent`, `LoyaltyProgram`, `LoyaltyTier`, `LoyaltyLedger`, `Reward`

### Content & Experience

`Theme`, `ThemeVersion`, `Page`, `PageSection`, `NavigationMenu`, `NavigationItem`, `BlogPost`, `BlogCategory`, `FAQ`, `Banner`, `LandingPage`, `SEORecord`

### Support

`SupportTicket`, `TicketMessage`, `TicketAttachment`, `SupportSLA`, `KnowledgeArticle`, `CustomerFeedback`

### SaaS Platform

`Plan`, `PlanFeature`, `Entitlement`, `Subscription`, `SubscriptionItem`, `SubscriptionEvent`, `UsageMetric`, `UsageEvent`, `PlatformInvoice`, `Incident`, `StatusPageEvent`, `Integration`, `IntegrationAccount`, `APIKey`, `Webhook`, `WebhookDelivery`, `OAuthConnection`

### Multi-tenant isolation rules

1. Every tenant-owned query must scope by authenticated store/tenant context.
2. Never trust client-supplied `storeId` for authorization.
3. Super-admin operations use explicit privileged scopes and are audited.
4. Unique constraints should include tenant scope where appropriate.
5. Background jobs must carry tenant context.
6. File/media access must enforce tenant ownership or signed access.

## 6. API Contract Blueprint

Use versioned REST APIs initially. Keep domain modules independent so GraphQL or a public Storefront API can be added later.

### Auth & Identity

- `POST /v1/auth/register`
- `POST /v1/auth/login`
- `POST /v1/auth/refresh`
- `POST /v1/auth/logout`
- `POST /v1/auth/otp/send`
- `POST /v1/auth/otp/verify`
- `POST /v1/auth/password/forgot`
- `POST /v1/auth/password/reset`
- `GET /v1/me`
- `PATCH /v1/me`
- `GET /v1/me/sessions`
- `DELETE /v1/me/sessions/:id`

### Stores & Themes

- `POST /v1/stores`
- `GET /v1/stores`
- `GET /v1/stores/:id`
- `PATCH /v1/stores/:id`
- `GET /v1/stores/:id/theme`
- `PUT /v1/stores/:id/theme`
- `POST /v1/stores/:id/domains`
- `POST /v1/stores/:id/publish`
- `GET /v1/stores/:id/navigation`
- `PUT /v1/stores/:id/navigation`

### Catalog

- `GET /v1/products`
- `POST /v1/products`
- `GET /v1/products/:id`
- `PATCH /v1/products/:id`
- `DELETE /v1/products/:id`
- `POST /v1/products/bulk`
- `POST /v1/products/import`
- `GET /v1/products/export`
- `POST /v1/products/:id/media`
- `GET /v1/categories`
- `POST /v1/categories`
- `PATCH /v1/categories/:id`
- `GET /v1/collections`
- `POST /v1/collections`
- `PATCH /v1/collections/:id`
- `GET /v1/brands`
- `POST /v1/brands`

### Search & Discovery

- `GET /v1/search`
- `GET /v1/search/suggestions`
- `GET /v1/search/trending`
- `GET /v1/recommendations`
- `GET /v1/products/:id/related`
- `GET /v1/products/:id/buy-together`

### Cart & Checkout

- `GET /v1/cart`
- `POST /v1/cart/items`
- `PATCH /v1/cart/items/:id`
- `DELETE /v1/cart/items/:id`
- `POST /v1/cart/coupons`
- `DELETE /v1/cart/coupons/:code`
- `POST /v1/checkout`
- `PATCH /v1/checkout/:id/address`
- `GET /v1/checkout/:id/shipping-rates`
- `POST /v1/checkout/:id/payment`
- `POST /v1/checkout/:id/place-order`

### Orders

- `GET /v1/orders`
- `GET /v1/orders/:id`
- `POST /v1/orders`
- `POST /v1/orders/:id/cancel`
- `POST /v1/orders/:id/returns`
- `POST /v1/orders/:id/exchange`
- `GET /v1/orders/:id/tracking`
- `POST /v1/orders/:id/reorder`
- `POST /v1/orders/:id/reviews`

### Inventory

- `GET /v1/inventory`
- `PATCH /v1/inventory/:sku`
- `POST /v1/inventory/adjustments`
- `POST /v1/inventory/transfers`
- `POST /v1/inventory/receipts`
- `GET /v1/warehouses`
- `POST /v1/warehouses`
- `GET /v1/purchase-orders`
- `POST /v1/purchase-orders`

### Customers & CRM

- `GET /v1/customers`
- `POST /v1/customers`
- `GET /v1/customers/:id`
- `PATCH /v1/customers/:id`
- `GET /v1/customers/:id/orders`
- `GET /v1/customers/:id/activity`
- `GET /v1/segments`
- `POST /v1/segments`
- `POST /v1/customers/:id/store-credit`

### Marketing

- `GET /v1/coupons`
- `POST /v1/coupons`
- `PATCH /v1/coupons/:id`
- `GET /v1/promotions`
- `POST /v1/promotions`
- `GET /v1/campaigns`
- `POST /v1/campaigns`
- `POST /v1/campaigns/:id/send-test`
- `GET /v1/loyalty`
- `POST /v1/referrals`

### Content & SEO

- `GET /v1/pages`
- `POST /v1/pages`
- `PATCH /v1/pages/:id`
- `GET /v1/blog`
- `POST /v1/blog`
- `GET /v1/media`
- `POST /v1/media`
- `GET /v1/seo/:resourceType/:resourceId`
- `PUT /v1/seo/:resourceType/:resourceId`

### Payments & Finance

- `GET /v1/payments`
- `GET /v1/payments/:id`
- `POST /v1/payments/:id/capture`
- `POST /v1/payments/:id/refund`
- `GET /v1/payouts`
- `GET /v1/invoices`
- `GET /v1/tax-rules`
- `POST /v1/tax-rules`
- `GET /v1/reconciliation`

### Shipping

- `GET /v1/shipping/zones`
- `POST /v1/shipping/zones`
- `GET /v1/shipping/rates`
- `POST /v1/shipping/rates`
- `GET /v1/carriers`
- `POST /v1/carriers/connect`
- `POST /v1/shipments`
- `GET /v1/shipments/:id`
- `GET /v1/shipments/:id/tracking`

### Analytics

- `GET /v1/analytics/overview`
- `GET /v1/analytics/revenue`
- `GET /v1/analytics/orders`
- `GET /v1/analytics/customers`
- `GET /v1/analytics/products`
- `GET /v1/analytics/funnel`
- `GET /v1/analytics/retention`
- `POST /v1/analytics/events`
- `GET /v1/analytics/export`

### Integrations & Webhooks

- `GET /v1/integrations`
- `POST /v1/integrations/:id/connect`
- `DELETE /v1/integrations/:id`
- `GET /v1/api-keys`
- `POST /v1/api-keys`
- `DELETE /v1/api-keys/:id`
- `GET /v1/webhooks`
- `POST /v1/webhooks`
- `POST /v1/webhooks/:id/test`
- `GET /v1/webhook-deliveries`

### Super Admin

- `GET /v1/admin/platform/overview`
- `GET /v1/admin/stores`
- `POST /v1/admin/stores`
- `POST /v1/admin/stores/:id/suspend`
- `GET /v1/admin/subscriptions`
- `GET /v1/admin/plans`
- `POST /v1/admin/plans`
- `PATCH /v1/admin/plans/:id`
- `GET /v1/admin/platform-orders`
- `GET /v1/admin/risk/events`
- `GET /v1/admin/tickets`
- `GET /v1/admin/audit-logs`
- `GET /v1/admin/feature-flags`

### API standards

- Authentication: short-lived access token + rotating refresh token or secure session cookie.
- Authorization: RBAC + store scope + resource ownership.
- Pagination: cursor-based for large operational lists; page-based can be exposed for storefront SEO where needed.
- Idempotency: required for payments, order creation, refunds and shipment booking.
- Errors: `{code, message, fieldErrors?, requestId}`.
- Observability: request ID, structured logs, traces and latency/error metrics.
- Webhooks: signed payloads, retry queue, exponential backoff, delivery log and idempotent consumer handling.

## 7. Core Event Bus

- `customer.created`
- `customer.updated`
- `customer.deleted`
- `product.created`
- `product.updated`
- `product.published`
- `product.archived`
- `inventory.updated`
- `inventory.low_stock`
- `inventory.out_of_stock`
- `cart.created`
- `cart.updated`
- `cart.abandoned`
- `checkout.started`
- `checkout.completed`
- `payment.created`
- `payment.succeeded`
- `payment.failed`
- `payment.refunded`
- `order.created`
- `order.confirmed`
- `order.packed`
- `order.shipped`
- `order.delivered`
- `order.cancelled`
- `return.requested`
- `return.approved`
- `return.received`
- `return.refunded`
- `review.created`
- `coupon.redeemed`
- `campaign.sent`
- `campaign.completed`
- `subscription.started`
- `subscription.renewed`
- `subscription.payment_failed`
- `subscription.cancelled`

## 8. End-to-End Workflows

### Merchant onboarding

1. Create account
2. Verify email/phone
3. Create store
4. Choose industry
5. Choose theme
6. Seed demo products
7. Configure currency/tax
8. Configure payment
9. Configure shipping
10. Connect domain
11. Publish

### Customer purchase

1. Browse/search
2. Open product
3. Select variant
4. Add to cart
5. Apply promotion
6. Enter address
7. Select delivery
8. Choose payment
9. Pay
10. Create order
11. Send confirmation
12. Reserve inventory
13. Create shipment

### Order fulfillment

1. Order confirmed
2. Payment verified
3. Inventory reserved
4. Pick
5. Pack
6. Book courier
7. Generate label
8. Ship
9. Tracking updates
10. Delivery
11. Request review

### Return/refund

1. Customer requests return
2. Validate policy
3. Approve/reject
4. Schedule pickup
5. Receive item
6. Inspect
7. Approve refund/exchange
8. Process refund
9. Release inventory
10. Notify customer

### Abandoned cart

1. Cart created
2. No purchase
3. Wait
4. Send reminder
5. Wait
6. Send incentive
7. Wait
8. Final reminder
9. Stop when purchased/expired

### Low-stock replenishment

1. Inventory crosses threshold
2. Create alert
3. Notify operator
4. Draft purchase order
5. Approve PO
6. Receive goods
7. Update inventory

### Coupon lifecycle

1. Draft
2. Schedule
3. Publish
4. Validate eligibility
5. Redeem
6. Track usage
7. Expire
8. Archive

### SaaS subscription lifecycle

1. Trial
2. Convert
3. Invoice
4. Payment
5. Renew
6. Retry failed payment
7. Dunning
8. Pause/cancel
9. Retention

### Theme publishing

1. Edit draft
2. Preview
3. Validate responsive layout
4. Save version
5. Schedule or publish
6. Invalidate CDN cache
7. Audit change

### Product import

1. Upload CSV
2. Map fields
3. Validate rows
4. Preview changes
5. Import
6. Create/update records
7. Report failures

### Customer support

1. Ticket created
2. Classify
3. Assign
4. SLA timer
5. Agent response
6. Escalate
7. Resolve
8. Collect feedback

### Marketplace vendor order

1. Order split
2. Commission calculation
3. Vendor fulfillment
4. Platform shipment
5. Delivery
6. Settlement
7. Vendor payout

### Cross-workflow invariants

- Inventory reservation happens before successful order confirmation where inventory is required.
- Payment and order creation must be idempotent.
- Refunds must create financial records; never mutate the original payment into a fake final state.
- Returns do not automatically restock until warehouse/inspection rules permit it.
- Promotion calculations are server-authoritative.
- Customer-visible order status is derived from canonical order/fulfillment events.

## 9. Storefront Theme Architecture

```ts
type ThemeConfig = {
  colors: Record<string, string>
  typography: {
    headingFont: string
    bodyFont: string
    scale: Record<string, string>
  }
  spacing: Record<string, string>
  radius: Record<string, string>
  buttons: Record<string, unknown>
  cards: Record<string, unknown>
  header: Record<string, unknown>
  footer: Record<string, unknown>
  productCard: Record<string, unknown>
}
```

### Page builder section library
- `Hero`
- `Video Hero`
- `Promo Strip`
- `Category Grid`
- `Product Grid`
- `Carousel`
- `Collection Feature`
- `Editorial Split`
- `Lookbook`
- `Testimonial`
- `Review Wall`
- `FAQ`
- `Newsletter`
- `Countdown`
- `Brand Story`
- `Trust Bar`
- `Logo Cloud`
- `Recently Viewed`
- `Recommendations`
- `Custom HTML`
- `Rich Text`
- `Image Mosaic`

## 10. Merchant Admin Information Architecture

```text
Overview
├── Dashboard
├── Reports
└── Alerts

Catalog
├── Products
├── Variants
├── Categories
├── Collections
├── Brands
├── Attributes
└── Media

Orders
├── All Orders
├── Fulfillment
├── Returns
├── Exchanges
└── Refunds

Inventory
├── Stock
├── Warehouses
├── Transfers
├── Purchase Orders
└── Suppliers

Customers
├── Customers
├── Segments
├── Loyalty
└── Support

Marketing
├── Coupons
├── Promotions
├── Campaigns
├── Automations
└── Referrals

Content
├── Themes
├── Pages
├── Navigation
├── Blog
└── SEO

Finance
├── Payments
├── Payouts
├── Invoices
├── Taxes
└── Reconciliation

Shipping
├── Zones
├── Rates
├── Carriers
└── Shipments

Settings
├── Store
├── Staff
├── Roles
├── Security
├── Domains
├── Notifications
├── API
└── Integrations
```

## 11. Customer Storefront Information Architecture

```text
Home
Shop
├── Categories
├── Collections
├── Brands
├── New
├── Deals
└── Search

Product
├── Gallery
├── Details
├── Variants
├── Reviews
├── Q&A
└── Recommendations

Bag
└── Checkout
    ├── Contact
    ├── Address
    ├── Delivery
    ├── Payment
    └── Confirmation

Account
├── Profile
├── Orders
├── Tracking
├── Wishlist
├── Addresses
├── Rewards
└── Support
```

## 12. Mobile Navigation

### Customer

`Home | Explore | Wishlist | Cart | Account`

### Merchant

`Dashboard | Orders | Products | Inventory | More`

## 13. Dummy Dataset Specification

| Dataset | Minimum seed |
|---|---:|
| Stores | 6 |
| Products | 150 |
| Categories | 40 |
| Brands | 25 |
| Collections | 20 |
| Customers | 75 |
| Orders | 250 |
| Order items | 500+ |
| Reviews | 200 |
| Coupons | 30 |
| Campaigns | 20 |
| Warehouses | 8 |
| Inventory movements | 1,000+ |
| Support tickets | 100 |
| Analytics events | 10,000+ |

### Seed industries

Fashion, electronics, beauty, home & living, furniture, sports & fitness, grocery, jewelry, books and pet supplies.

### Sample universal SKUs

- `BGE-TEE-001`
- `BGE-SHR-002`
- `ELE-PHN-001`
- `ELE-LAP-004`
- `HOM-CHR-006`
- `HOM-LMP-012`
- `BEA-SER-003`
- `BEA-LIP-014`
- `GRC-COF-009`
- `SPT-RUN-002`
- `JWL-WAT-008`
- `PET-FOD-004`

## 14. Dummy Customer / Merchant Seed Rules

Create synthetic names, emails, phones and addresses only. Never use real customer information.

Customer behavior distribution:
- 20% new customers
- 50% repeat customers
- 20% VIP/high value
- 10% inactive

Order mix:
- 75% delivered
- 8% processing/packed/shipped
- 5% cancelled
- 7% return/refund flows
- 5% pending/payment retry

## 15. Search & Recommendation Strategy

### Search
Use PostgreSQL full-text initially; move to OpenSearch/Elasticsearch when catalog/search volume requires it. Support typo tolerance, synonyms, prefix suggestions, category-aware filters and merchant-configurable ranking.

### Recommendation rules (V1)
- Frequently bought together from order-item co-occurrence.
- Similar products from category + attribute overlap.
- Trending from weighted sales velocity + recent views.
- Personalized from recent views, purchases and wishlist.
- Complete the look from merchant-defined complementary groups.

## 16. Analytics Events

- `page_view`
- `search_submitted`
- `search_result_clicked`
- `category_viewed`
- `product_viewed`
- `product_variant_selected`
- `wishlist_added`
- `wishlist_removed`
- `add_to_cart`
- `remove_from_cart`
- `cart_viewed`
- `coupon_applied`
- `checkout_started`
- `address_completed`
- `shipping_selected`
- `payment_started`
- `payment_succeeded`
- `payment_failed`
- `order_completed`
- `review_submitted`
- `return_requested`
- `campaign_clicked`
- `newsletter_subscribed`
- `push_opened`

## 17. Permissions Matrix

| Area | Owner | Admin | Manager | Product | Warehouse | Support | Marketing | Accountant |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Catalog | R/W | R/W | R/W | R/W | R | R | R | R |
| Orders | R/W | R/W | R/W | R | R/W | R/W | R | R |
| Inventory | R/W | R/W | R/W | R | R/W | R | R | R |
| Customers | R/W | R/W | R/W | R | R | R/W | R | R |
| Marketing | R/W | R/W | R/W | R | R | R | R/W | R |
| Finance | R/W | R/W | R | R | R | R | R | R/W |
| Analytics | R/W | R/W | R/W | R/W | R | R | R/W | R/W |
| Settings | R/W | R/W | R | R | R | R | R | R |
| Staff | R/W | R/W | R | R | R | R | R | R |

## 18. Accessibility Requirements

- Semantic HTML and correct heading hierarchy.
- WCAG-oriented color contrast for text and controls.
- Keyboard navigation and visible focus.
- Screen-reader labels for icons and product actions.
- Accessible dialogs, drawers, dropdowns and carousels.
- Reduced-motion support.
- Touch targets sized for mobile use.
- Alt text strategy for products/editorial media.

## 19. Performance Requirements

- Next.js image optimization and responsive image sizes.
- Lazy-load below-the-fold images and heavy modules.
- Skeleton UI for network-bound catalog and account screens.
- Cache read-heavy storefront data.
- Use Redis for sessions, rate limits, cart caching and selected computed data.
- Avoid client-side overfetching; use server-side pagination and filtering.
- Track Core Web Vitals on storefront.

## 20. Security Requirements

- Tenant-scoped authorization at service/repository level.
- CSRF protection for cookie-authenticated browser flows.
- Rate limit auth, OTP, password reset, search abuse and payment endpoints.
- Hash credentials with an established password hashing algorithm.
- Encrypt or tokenize sensitive payment data; do not store raw card details.
- Signed webhooks with replay protection.
- Audit logs for privileged mutations.
- Secure signed media URLs where private assets are used.
- Input validation with Zod or equivalent.
- Output encoding and sanitization for rich text.

## 21. AI Commerce Layer (Optional Module)

- AI product description generator.
- AI SEO metadata generator.
- AI category/attribute suggestion.
- AI customer shopping assistant grounded on the current store catalog.
- AI analytics assistant that explains merchant KPIs from permitted store data.
- AI image background removal/enhancement.
- AI recommendation explanation such as 'why this is recommended'.

All AI features must use explicit tenant boundaries and must not leak catalog/customer data between stores.

## 22. SaaS Pricing / Entitlement Model

| Plan | Example positioning | Example entitlements |
|---|---|---|
| Starter | small merchants | products, basic orders, basic analytics |
| Growth | growing stores | more staff, marketing, analytics, integrations |
| Pro | advanced merchants | automation, advanced analytics, API, loyalty |
| Enterprise | large merchants | custom limits, SLA, SSO, dedicated support |

Treat these as configurable seed values, not hard-coded business rules.

## 23. Development Roadmap

| Phase | Scope | Suggested effort* |
|---|---|---:|
| Phase 0 — Foundation | Repository, TypeScript, linting, CI, environments, design tokens, shared UI, database, auth, tenant middleware. | 1–2 weeks |
| Phase 1 — Commerce Core | Products, variants, attributes, categories, collections, customers, carts, orders, basic checkout, mock payment. | 2–4 weeks |
| Phase 2 — Premium Storefront | Homepage, PLP, PDP, search, filters, cart drawer, checkout, account, wishlist, reviews. | 2–4 weeks |
| Phase 3 — Merchant Admin | Dashboard, catalog, inventory, orders, customers, promotions, content, settings. | 3–5 weeks |
| Phase 4 — Logistics & Finance | Shipping, warehouses, returns, refunds, invoices, tax, reconciliation. | 2–4 weeks |
| Phase 5 — SaaS Control Plane | Super-admin, plans, subscriptions, usage, tenant lifecycle, support, audit. | 2–4 weeks |
| Phase 6 — Mobile | Customer app + merchant app using shared domain/API contracts. | 3–6 weeks |
| Phase 7 — Advanced | AI, loyalty, automation, marketplace, advanced search, public API. | 4–8+ weeks |

*Effort is a planning placeholder; actual timing depends on team size, integration depth and QA scope.

## 24. Sprint / Milestone Checklist

- [ ] M01 Repo and design system boot
- [ ] M02 Auth and tenant isolation
- [ ] M03 Universal catalog
- [ ] M04 Storefront shell
- [ ] M05 Product discovery
- [ ] M06 Cart and checkout
- [ ] M07 Customer account
- [ ] M08 Merchant dashboard shell
- [ ] M09 Catalog admin
- [ ] M10 Inventory
- [ ] M11 Order operations
- [ ] M12 Promotions
- [ ] M13 Content builder
- [ ] M14 Shipping
- [ ] M15 Finance/tax
- [ ] M16 Analytics
- [ ] M17 Super admin
- [ ] M18 Subscriptions
- [ ] M19 Customer mobile
- [ ] M20 Merchant mobile
- [ ] M21 Security hardening
- [ ] M22 Performance hardening
- [ ] M23 Accessibility audit
- [ ] M24 End-to-end demo data
- [ ] M25 Production readiness

## 25. QA Acceptance Criteria

- [ ] A new merchant can create a store, choose a theme, seed data and publish without code.
- [ ] A shopper can discover a product, select dynamic attributes, add to cart and complete a dummy checkout.
- [ ] Cart and wishlist persist across reloads.
- [ ] Filters and search update results correctly and are URL/state aware.
- [ ] Orders appear in both customer and merchant experiences with synchronized statuses.
- [ ] Inventory decreases/reserves according to configured inventory policy.
- [ ] Returns/refunds create auditable lifecycle records.
- [ ] Merchant permissions prevent unauthorized modules/actions.
- [ ] Super-admin cannot accidentally operate without explicit store context.
- [ ] Mobile screens have no horizontal overflow and all critical tasks are reachable by touch.
- [ ] All critical screens have loading, empty, error and success states.
- [ ] No important primary action is a dead button.

## 26. Recommended Monorepo

```text
commerce-platform/
├── apps/
│   ├── storefront/
│   ├── merchant-admin/
│   ├── super-admin/
│   ├── customer-mobile/
│   └── merchant-mobile/
├── packages/
│   ├── ui/
│   ├── config/
│   ├── auth/
│   ├── db/
│   ├── ecommerce/
│   ├── payments/
│   ├── shipping/
│   ├── analytics/
│   ├── notifications/
│   ├── search/
│   └── ai/
├── prisma/
├── scripts/
├── docs/
└── docker/
```

## 27. First Build Order

Do not start by implementing all screens independently. Build shared primitives and domain contracts first.
1. Design tokens + shared UI
2. Authentication + tenant context
3. Database schema + seed
4. Universal product/variant/attribute services
5. Storefront shell + theme engine
6. Catalog/search/filter engine
7. Cart/checkout/order engine
8. Merchant admin shell
9. Inventory/order operations
10. Customer account/support
11. Marketing/content
12. Super-admin control plane
13. Mobile clients
14. Integrations and advanced modules

## 28. Final Definition of Done

The product is considered demo-complete when a tester can enter as a demo merchant, create/open a store, browse a premium universal storefront, search/filter products, open a product detail, add variants to the bag, apply a coupon, complete a dummy payment, see the order in the merchant dashboard, fulfill the order, view tracking from the customer app, submit a return, and inspect the financial/analytics effects—all using seeded data and without dead-end navigation.

This document is the master backlog/architecture specification. Individual screens should be implemented from the reusable domain and UI components rather than as isolated one-off pages.
